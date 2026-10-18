const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { test } = require('node:test');

// Unit tests use an isolated DOM stub. They do not load Google tags, send real
// conversions, launch WhatsApp or replace a real browser/layout acceptance test.
const source = fs.readFileSync(path.join(__dirname, '..', 'main.js'), 'utf8');

class Element {
  constructor(tag = 'div') {
    this.tagName = tag.toUpperCase();
    this.children = [];
    this.attrs = {};
    this.style = {};
    this.listeners = {};
    this.className = '';
    this.classes = new Set();
    this.classList = {
      add: (...values) => values.forEach(value => this.classes.add(value)),
      remove: value => this.classes.delete(value),
      contains: value => this.classes.has(value),
      toggle: value => this.classes.has(value) ? this.classes.delete(value) : this.classes.add(value)
    };
  }
  setAttribute(name, value) { this.attrs[name] = value; }
  appendChild(child) { this.children.push(child); return child; }
  contains(element) { return element === this || this.children.some(child => child.contains(element)); }
  querySelector(selector) {
    return this.children.find(child => selector.startsWith('.') && child.className === selector.slice(1)) || null;
  }
  querySelectorAll(selector) { return selector === 'a' ? this.children.filter(child => child.tagName === 'A') : []; }
  addEventListener(name, handler) { (this.listeners[name] ||= []).push(handler); }
  closest(selector) { return selector === 'a[href]' && this.tagName === 'A' ? this : null; }
}

function setup(url = 'https://www.drarunkumar.in/sexologist-agra.html', existingTag = false) {
  const body = new Element('body');
  const head = new Element('head');
  const navWrap = new Element();
  const mainNav = new Element('nav');
  navWrap.appendChild(mainNav);
  const listeners = {};
  const document = {
    body, head,
    referrer: 'https://www.drarunkumar.in/assessment.html?name=private#answers',
    createElement: tag => new Element(tag),
    querySelector(selector) {
      if (selector === '.nav-wrap') return navWrap;
      if (selector === '.main-nav') return mainNav;
      if (selector === '.clinic-contact-bar') return body.querySelector(selector);
      if (selector.startsWith('script[src^=')) return existingTag ? new Element('script') : null;
      return null;
    },
    querySelectorAll: () => [],
    addEventListener(name, handler) { (listeners[name] ||= []).push(handler); }
  };
  const window = { location: new URL(url), document, addEventListener() {} };
  const context = vm.createContext({ window, document, Element, URL, Date, console });
  function run() { vm.runInContext(source, context); }
  function click(href, trusted = true) {
    const target = new Element('a');
    target.href = href;
    const event = { target, isTrusted: trusted, defaultPrevented: false, preventDefault() { this.defaultPrevented = true; } };
    for (const handler of listeners.click || []) handler(event);
    return event;
  }
  function conversions() { return (window.dataLayer || []).filter(item => item[0] === 'event' && item[1] === 'conversion'); }
  function interactions() { return (window.dataLayer || []).filter(item => item.event === 'arun_clinic_contact'); }
  run();
  return { window, document, mainNav, navWrap, context, click, run, conversions, interactions };
}

test('real mobile-menu WhatsApp link and three correct clinic contact actions', () => {
  const env = setup();
  const mobile = env.mainNav.querySelector('.mobile-contact-link');
  assert.equal(mobile.href, 'https://wa.me/919927005959');
  assert.equal(mobile.target, '_blank');
  const bar = env.document.body.querySelector('.clinic-contact-bar');
  assert.equal(bar.attrs['aria-label'], 'Contact the Agra clinic');
  assert.equal(bar.children.length, 3);
  assert.equal(bar.children[0].href, 'tel:+919927005959');
  assert.equal(bar.children[1].href, 'https://wa.me/919927005959');
  assert.match(new URL(bar.children[2].href).searchParams.get('destination'), /Sikandra-Bodla Road, Agra/);
});

test('initialization does not report a conversion or contact interaction', () => {
  const env = setup();
  assert.equal(env.conversions().length, 0);
  assert.equal(env.interactions().length, 0);
  assert.equal(env.document.head.children.length, 1);
});

test('one trusted WhatsApp click reports one existing contact conversion', () => {
  const env = setup();
  const event = env.click('https://wa.me/919927005959?text=private%20medical%20message');
  assert.equal(event.defaultPrevented, false);
  assert.equal(env.conversions().length, 1);
  assert.equal(env.conversions()[0][2].send_to, 'AW-622603961/WpCCCMrn0IsdELnd8KgC');
  assert.equal(env.interactions()[0].contact_method, 'whatsapp');
});

test('phone and directions produce neutral hooks, not appointment conversions', () => {
  const env = setup();
  assert.equal(env.click('tel:+919927005959').defaultPrevented, false);
  env.click('https://www.google.com/maps/dir/?api=1&destination=Agra');
  assert.equal(env.conversions().length, 0);
  assert.deepEqual(Array.from(env.interactions(), item => item.contact_method), ['phone', 'directions']);
});

test('synthetic clicks and other numbers do not report clinic conversions', () => {
  const env = setup();
  env.click('https://wa.me/919927005959', false);
  env.click('https://wa.me/917819918198');
  env.click('tel:+917819918198');
  env.click('https://example.com/');
  assert.equal(env.conversions().length, 0);
  assert.equal(env.interactions().length, 0);
});

test('localhost and branch previews do not load measurement or report conversions', () => {
  for (const url of ['http://localhost:8000/', 'https://bestsexologistinindiadrarun-coder.github.io/AIHSHDrArun/', 'https://www.drarunkumar.in.example.com/']) {
    const env = setup(url);
    env.click('https://wa.me/919927005959');
    assert.equal(env.document.head.children.length, 0);
    assert.equal(env.window.dataLayer, undefined);
    assert.equal(env.window.trackArunWhatsAppContact, undefined);
  }
});

test('duplicate initialization does not duplicate the tracking listener or contact bar', () => {
  const env = setup();
  env.run();
  env.click('https://wa.me/919927005959');
  assert.equal(env.conversions().length, 1);
  assert.equal(env.document.body.children.length, 1);
  assert.equal(env.document.head.children.length, 1);
  assert.equal(env.mainNav.children.length, 1);
});

test('an existing Google tag is not inserted a second time', () => {
  const env = setup(undefined, true);
  assert.equal(env.document.head.children.length, 0);
});

test('sensitive URL paths, query values, message text and referrer paths are omitted', () => {
  const env = setup('https://www.drarunkumar.in/premature-ejaculation-agra.html?gclid=test123&gbraid=test456&wbraid=test789&name=private&diagnosis=private#private');
  env.click('https://wa.me/919927005959?text=private');
  const payload = env.conversions()[0][2];
  assert.equal(payload.page_location, 'https://www.drarunkumar.in/?gclid=test123&gbraid=test456&wbraid=test789');
  assert.equal(payload.page_referrer, 'https://www.drarunkumar.in');
  assert.equal(payload.allow_ad_personalization_signals, false);
  assert.doesNotMatch(JSON.stringify(env.window.dataLayer), /private|premature-ejaculation|assessment\.html/);
});

test('an unavailable measurement service does not block WhatsApp navigation', () => {
  const env = setup();
  env.window.gtag = () => { throw Error('blocked'); };
  assert.doesNotThrow(() => env.click('https://wa.me/919927005959'));
});

test('assessment validation prevents conversion attempts before consent', () => {
  const env = setup();
  const elements = {};
  const get = id => elements[id] ||= Object.assign(new Element(), { value: '', checked: false });
  env.document.getElementById = get;
  env.context.alert = () => {};
  const opened = [];
  env.window.open = (...args) => opened.push(args);
  const assessment = fs.readFileSync(path.join(__dirname, '..', 'assessment.html'), 'utf8');
  const inline = [...assessment.matchAll(/<script>([\s\S]*?)<\/script>/g)][0][1];
  vm.runInContext(inline, env.context);
  vm.runInContext('submitAssessmentWhatsApp()', env.context);
  assert.equal(opened.length, 0);
  assert.equal(env.conversions().length, 0);
  get('patientName').value = 'Test Person';
  get('patientPhone').value = '0000000000';
  get('ageRange').value = '26-35';
  get('primaryConcern').value = 'Private concern';
  for (const prefix of ['iief', 'pedt']) for (let i = 1; i <= 5; i++) get(prefix + i).value = '1';
  vm.runInContext('submitAssessmentWhatsApp()', env.context);
  assert.equal(opened.length, 0);
  assert.equal(env.conversions().length, 0);
  get('consentCheck').checked = true;
  vm.runInContext('submitAssessmentWhatsApp()', env.context);
  assert.equal(opened.length, 1);
  assert.equal(env.conversions().length, 1);
  assert.doesNotMatch(JSON.stringify(env.window.dataLayer), /Test Person|0000000000|Private concern|IIEF|PEDT/);
});
