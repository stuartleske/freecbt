// based on https://github.com/wolfadex/fluent-web
import i18n from 'i18n-js'

customElements.define('i18n-provider', class Provider extends HTMLElement {
  constructor() {
    super();
    this._listeners = [];
  }
  connectedCallback() {
    this._listeners = [];
    this.addEventListener("i18n-locale-subscribe", localeSubscribe);
    this.addEventListener("i18n-locale-unsubscribe", localeUnsubscribe);
  }
  disconnectedCallback() {
    this._listeners = [];
    this.removeEventListener("i18n-locale-subscribe", localeSubscribe);
    this.removeEventListener("i18n-locale-unsubscribe", localeUnsubscribe);
  }
  static get observedAttributes() {
    return ['locale'];
  }
  attributeChangedCallback(name, oldValue, newValue) {
    if (name === 'locale' && oldValue !== newValue) {
      i18n.locale = newValue || null
      this._locale = i18n.locale
      this._listeners.forEach((target) => {
        target.providerLocale = this._locale;
      });
    }
  }
})
function localeSubscribe(event) {
  const provider = event.currentTarget
  provider._listeners.push(event.target)
  event.target.providerLocale = provider._locale;
}
function localeUnsubscribe(event) {
  const provider = event.currentTarget
  const i = provider._listeners.findIndex(event.target);
  if (i >= 0) {
    provider._listeners.splice(i, 1);
  }
}

class Node extends HTMLElement {
  getMessage({messageId}) {
    const locale = this._locale || this._providerLocale;
    if (locale) {
      return i18n.t(messageId)
    }
    return null
  }
  connectedCallback() {
    this.dispatchEvent(
      new CustomEvent("i18n-locale-subscribe", {
        bubbles: true,
        target: this,
      })
    );
    this.render();
  }
  disconnectedCallback() {
    this.dispatchEvent(
      new CustomEvent("i18n-locale-unsubscribe", {
        bubbles: true,
        target: this,
      })
    );
  }
  set providerLocale(locale) {
    this._providerLocale = locale
    this.render();
  }
  set locale(locale) {
    this._locale = locale
    this.render();
  }
}

customElements.define('i18n-message', class Message extends Node {
  static get observedAttributes() {
    return ['messageid'];
  }
  attributeChangedCallback(name, oldValue, newValue) {
    if (name === 'messageid' && oldValue !== newValue) {
      this.render();
    }
  }
  render() {
    const messageId = this.getAttribute('messageid')
    const message = this.getMessage({messageId}) || "???"+messageId+"???"
    this.innerText = message
  }
})
customElements.define('i18n-element', class Element extends Node {
  set messageAttributes(pairs) {
    this._attributes = pairs
    this.render();
  }
  set messageProperties(pairs) {
    this._properties = pairs
    this.render();
  }
  render() {
    if (this.firstElementChild) {
      for (let [name, messageId] of (this._attributes || [])) {
        const message = this.getMessage({messageId}) || "???"+messageId+"???"
        this.firstElementChild.setAttribute(name, message)
      }
      for (let [name, messageId] of (this._properties || [])) {
        const message = this.getMessage({messageId}) || "???"+messageId+"???"
        this.firstElementChild[name] = message
      }
    }
  }
})
