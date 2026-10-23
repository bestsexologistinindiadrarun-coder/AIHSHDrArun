"""Dependency-free structural/link checks; not a browser or accessibility audit."""
from collections import Counter
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlsplit
import subprocess
import sys

ROOT = Path(__file__).resolve().parents[1]
LANDINGS = {"sexologist-agra.html", "premature-ejaculation-agra.html", "erectile-dysfunction-agra.html", "contact.html"}
VOID = {"area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "param", "source", "track", "wbr"}
errors = []

class Document(HTMLParser):
    def __init__(self, filename):
        super().__init__(convert_charrefs=True)
        self.filename = filename
        self.stack = []
        self.tags = []
        self.ids = []
        self.urls = []
        self.scripts = []
        self.inline_script = None

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        self.tags.append((tag, attrs))
        if attrs.get("id"):
            self.ids.append(attrs["id"])
        for field in ("href", "src"):
            if attrs.get(field):
                self.urls.append(attrs[field])
        if tag == "script" and "src" not in attrs:
            self.inline_script = ""
        if tag not in VOID:
            self.stack.append(tag)

    def handle_startendtag(self, tag, attrs):
        self.handle_starttag(tag, attrs)
        if tag not in VOID:
            self.handle_endtag(tag)

    def handle_endtag(self, tag):
        if tag == "script" and self.inline_script is not None:
            self.scripts.append(self.inline_script)
            self.inline_script = None
        if tag in VOID:
            return
        if not self.stack or self.stack[-1] != tag:
            errors.append(f"{self.filename}: mismatched closing </{tag}>; stack {self.stack[-4:]}")
        elif self.stack:
            self.stack.pop()

    def handle_data(self, data):
        if self.inline_script is not None:
            self.inline_script += data

documents = {}
for file in sorted(ROOT.glob("*.html")):
    document = Document(file.name)
    document.feed(file.read_text())
    document.close()
    documents[file.name] = document
    if document.stack:
        errors.append(f"{file.name}: unclosed tags {document.stack}")
    for element_id, count in Counter(document.ids).items():
        if count > 1:
            errors.append(f"{file.name}: duplicate ID {element_id}")
    if sum(tag == "h1" for tag, _ in document.tags) != 1:
        errors.append(f"{file.name}: expected one h1")
    for script in document.scripts:
        check = subprocess.run(["node", "--check"], input=script, text=True, capture_output=True)
        if check.returncode:
            errors.append(f"{file.name}: invalid inline JavaScript: {check.stderr}")

for name, document in documents.items():
    for url in document.urls:
        parsed = urlsplit(url)
        if parsed.scheme or parsed.netloc:
            continue
        target_name = unquote(parsed.path) or name
        target = ROOT / target_name
        if not target.is_file():
            errors.append(f"{name}: missing local target {url}")
        if parsed.fragment and target_name in documents and parsed.fragment not in documents[target_name].ids:
            errors.append(f"{name}: missing fragment {url}")
    if "main.js?v=20261018-directions-3" not in document.urls:
        errors.append(f"{name}: outdated shared script version")
    if "styles.css?v=20261018-contact-2" not in document.urls:
        errors.append(f"{name}: outdated shared stylesheet version")
    if name in LANDINGS:
        if "tel:+919927005959" not in document.urls:
            errors.append(f"{name}: missing correct call action")
        if not any(url.startswith("https://wa.me/919927005959") for url in document.urls):
            errors.append(f"{name}: missing correct WhatsApp action")
        if "https://maps.app.goo.gl/KXKvnoKUAVTJcy5v9?g_st=ac" not in document.urls:
            errors.append(f"{name}: missing directions")
        canonical = [attrs.get("href") for tag, attrs in document.tags if tag == "link" and attrs.get("rel") == "canonical"]
        if canonical != ["https://www.drarunkumar.in/" + name]:
            errors.append(f"{name}: unexpected canonical {canonical}")
        if not any(tag == "main" and attrs.get("id") == "main" for tag, attrs in document.tags):
            errors.append(f"{name}: missing skip-link destination")

if ".main-nav::after" in (ROOT / "styles.css").read_text():
    errors.append("Fake mobile CTA still present")
assessment = (ROOT / "assessment.html").read_text()
if "appears available" in assessment or "Confirm This Slot" in assessment:
    errors.append("Assessment still promises unverified booking availability")

if errors:
    print("\n".join(errors), file=sys.stderr)
    raise SystemExit(1)
print(f"PASS: {len(documents)} HTML pages; balanced tags, local links, inline JS, asset versions and landing-page contact actions.")
