import Observer from "./utils/observe/observer.js";
const validateSelector = (selector) => {
    if (selector.indexOf('-') <= 0) {
        throw new Error('You need at least 1 dash in the custom element name');
    }
};
const validateTemplate = (template) => {
    if (template === undefined || template === '') {
        throw new Error('You need to pass a template for the element');
    }
};
function initialValue(host, key, state) {
    const attrValue = host.getAttribute(key);
    if (attrValue !== null) {
        return attrValue;
    }
    return state.initial;
}
function getTemplate(html = '<div></div>', style = '') {
    const template = document.createElement('template');
    if (style) {
        html = `<style>${style}</style> ${html}`;
    }
    template.innerHTML = html;
    return template;
}
function Component(config) {
    return (constructor) => {
        validateSelector(config.selector);
        validateTemplate(config.template);
        const stateKeys = Object.keys(config.state || {});
        const stateAttributes = stateKeys.filter(key => config.state && !!config.state[key].attribute);
        if (stateAttributes.length) {
            Object.defineProperty(constructor, 'observedAttributes', { get() { return stateAttributes; }, enumerable: false });
            stateAttributes.forEach((key) => {
                const getter = function () {
                    return this.state[key].value;
                };
                const setter = function (value) {
                    this.state[key].next(value);
                };
                Object.defineProperty(constructor.prototype, key, {
                    get: getter,
                    set: setter,
                    enumerable: true
                });
            });
        }
        const template = getTemplate(config.template, config.style);
        const connectedCallback = constructor.prototype.connectedCallback || function () { };
        constructor.prototype.connectedCallback = function () {
            const clone = document.importNode(template.content, true);
            this.attachShadow({ mode: 'open' }).appendChild(clone);
            if (config.state) {
                this.state = Object.freeze(Object.keys(config.state).reduce((result, key) => Object.assign(result, {
                    [key]: Observer(initialValue(this, key, config.state[key]), {
                        matchType: config.state[key].matchType === undefined ? true : config.state[key].matchType,
                        formatter: config.state[key].formatter
                    })
                }), {}));
            }
            if (config.stateSubscriptions) {
                Object.keys(config.stateSubscriptions).forEach(key => {
                    const sub = config.stateSubscriptions[key];
                    this.state[key].subscribe((newVal, obs) => sub.next(this, newVal, obs), (error, obs) => sub.error(this, error, obs), (obs) => sub.complete(this, obs));
                });
            }
            connectedCallback.call(this);
        };
        const attributeChangedCallback = constructor.prototype.attributeChangedCallback || function () { };
        constructor.prototype.attributeChangedCallback = function (attrName, _oldValue, newValue) {
            if (this.state[attrName]) {
                this.state[attrName].next(newValue);
            }
            attributeChangedCallback.call(this);
        };
        window.customElements.define(config.selector, constructor);
    };
}
export default Component;
