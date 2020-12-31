// based on https://github.com/wolfadex/fluent-web
const _ = require('lodash')

customElements.define('i18n-provider', class Provider extends HTMLElement {
  constructor() {
    super();
    this._listeners = [];
  }
  connectedCallback() {
    this._listeners = [];
    this.addEventListener("i18n-bundle-subscribe", bundlesSubscribe);
    this.addEventListener("i18n-bundle-unsubscribe", bundlesUnsubscribe);
  }
  disconnectedCallback() {
    this._listeners = [];
    this.removeEventListener("i18n-bundle-subscribe", bundlesSubscribe);
    this.removeEventListener("i18n-bundle-unsubscribe", bundlesUnsubscribe);
  }
  get bundle() {
    return this._bundle;
  }
  set bundle(bundle) {
    this._bundle = bundle
    this._listeners.forEach((target) => {
      target.providerBundle = this._bundle;
    });
  }
})
function bundlesSubscribe(event) {
  const provider = event.currentTarget
  provider._listeners.push(event.target)
  event.target.providerBundle = provider._bundle;
}
function bundlesUnsubscribe(event) {
  const provider = event.currentTarget
  const i = provider._listeners.findIndex(event.target);
  if (i >= 0) {
    provider._listeners.splice(i, 1);
  }
}

class Node extends HTMLElement {
  getMessage({messageId}) {
    const bundle = this._bundle || this._providerBundle;
    if (bundle) {
      return _.get(bundle, messageId)
    }
    return null
  }
  connectedCallback() {
    this.dispatchEvent(
      new CustomEvent("i18n-bundle-subscribe", {
        bubbles: true,
        target: this,
      })
    );
    this.render();
  }
  disconnectedCallback() {
    this.dispatchEvent(
      new CustomEvent("i18n-bundle-unsubscribe", {
        bubbles: true,
        target: this,
      })
    );
  }
  set providerBundle(bundle) {
    this._providerBundle = bundle
    this.render();
  }
  set bundle(bundle) {
    this._bundle = bundle
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
