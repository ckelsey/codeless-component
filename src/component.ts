import Observer, { ObserverOptions, ObserverInstance } from "./utils/observe/observer"

interface StateMetaItem {
    initial: any
    attribute?: boolean
    formatter?: ObserverOptions['formatter']
    matchType?: boolean
}

// type StateMetaItemMapper<Type> = { [State in keyof Type]: StateMetaItem }
// type StateMetaObject<Values> = StateMetaItemMapper<Values>

interface ComponentConfig {
    selector: string
    template: string
    style?: string
    state?: { [key: string]: StateMetaItem }
    stateSubscriptions?: {
        [key: string]: {
            next?: (host: any, newValue: any, observerInstance?: ObserverInstance) => void
            error?: (host: any, error: string, observerInstance?: ObserverInstance) => void
            complete?: (host: any, observerInstance?: ObserverInstance) => void
        }
    }
}

const validateSelector = (selector: string) => {
    if (selector.indexOf('-') <= 0) {
        throw new Error('You need at least 1 dash in the custom element name')
    }
}

const validateTemplate = (template: string) => {
    if (template === undefined || template === '') {
        throw new Error('You need to pass a template for the element')
    }
}

function initialValue(host: any, key: string, state: StateMetaItem) {
    const attrValue = host.getAttribute(key)
    if (attrValue !== null) { return attrValue }
    return state.initial
}

function getTemplate(html: string = '<div></div>', style: string = '') {
    const template = document.createElement('template')

    if (style) {
        html = `<style>${style}</style> ${html}`
    }

    template.innerHTML = html

    return template
}

function Component(config: ComponentConfig) {
    return (constructor: CustomElementConstructor) => {
        validateSelector(config.selector)
        validateTemplate(config.template)

        const stateKeys = Object.keys(config.state || {})
        const stateAttributes = stateKeys.filter(key => config.state && !!config.state[key].attribute)

        if (stateAttributes.length) {
            Object.defineProperty(constructor, 'observedAttributes', { get() { return stateAttributes }, enumerable: false })

            stateAttributes.forEach((key) => {
                const getter = function (this: { get: () => any; enumerable: true }) {
                    return (this as any).state[key].value
                }
                const setter = function (this: { get: (this: { get: () => any; enumerable: true }) => any; set: (value: any) => void; enumerable: true }, value: any) {
                    (this as any).state[key].next(value)
                }
                Object.defineProperty(constructor.prototype, key, {
                    get: getter,
                    set: setter,
                    enumerable: true
                })
            })
        }

        const template = getTemplate(config.template, config.style)

        const connectedCallback = constructor.prototype.connectedCallback || function () { }

        constructor.prototype.connectedCallback = function () {
            const clone = document.importNode(template.content, true);
            this.attachShadow({ mode: 'open' }).appendChild(clone)

            if (config.state) {
                this.state = Object.freeze(Object.keys(config.state).reduce(
                    (result: any, key: string) =>
                        Object.assign(result, {
                            [key]: Observer(initialValue(this, key, (config.state as any)[key]),
                                {
                                    matchType: (config.state as any)[key].matchType === undefined ? true : (config.state as any)[key].matchType,
                                    formatter: (config.state as any)[key].formatter
                                }
                            )
                        }),
                    {}
                ))
            }

            if (config.stateSubscriptions) {
                Object.keys(config.stateSubscriptions).forEach(key => {
                    const sub = (config.stateSubscriptions as any)[key]
                    this.state[key].subscribe(
                        (newVal: any, obs: ObserverInstance) => sub.next(this, newVal, obs),
                        (error: any, obs: ObserverInstance) => sub.error(this, error, obs),
                        (obs: ObserverInstance) => sub.complete(this, obs)
                    )
                })
            }

            connectedCallback.call(this)
        }

        const attributeChangedCallback = constructor.prototype.attributeChangedCallback || function () { }

        constructor.prototype.attributeChangedCallback = function (attrName: string, _oldValue: string, newValue: string) {
            if (this.state[attrName]) { this.state[attrName].next(newValue) }
            attributeChangedCallback.call(this)
        }

        window.customElements.define(config.selector, constructor)
    }
}

export default Component