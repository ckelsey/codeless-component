import Observer, { nullObserver, ObserverInstance, ObserverOptions } from './observer'

export interface EventObserverOptions extends ObserverOptions {
    useCapture?: boolean
    preventDefault?: boolean | ((e: Event) => any)
    stopPropagation?: boolean | ((e: Event) => any)
}

export default function EventObserver(
    element: Element | Window,
    eventName: string,
    options: EventObserverOptions = {}
): ObserverInstance {
    if (!element || !eventName) { return nullObserver() }

    let isRunning = false

    options = Object.assign({}, {
        preventDefault: false,
        stopPropagation: false,
        useCapture: true
    }, options || {})

    function canListen() {
        return element && typeof element.addEventListener == 'function'
    }

    function onSubscribe() {
        if (isRunning) { return }
        if (!canListen()) { return shutDown() }

        isRunning = true
        element.addEventListener(eventName, eventHandler, options.useCapture)
    }

    const observer = Observer(undefined, Object.assign({}, options, { onSubscribe, nextOnNew: false }))

    function eventHandler(event: Event) {
        if (!observer || !observer.subscriptions || Object.keys(observer.subscriptions).length === 0) { return shutDown() }

        if ((typeof options.preventDefault == 'function' && !!options.preventDefault(event)) || (typeof options.preventDefault == 'boolean' && options.preventDefault)) {
            event.preventDefault()
        }

        if ((typeof options.stopPropagation == 'function' && !!options.stopPropagation(event)) || (typeof options.stopPropagation == 'boolean' && options.stopPropagation)) {
            event.stopPropagation()
        }

        observer.next(event)
    }

    function shutDown() {
        if (canListen()) { element.removeEventListener(eventName, eventHandler, options.useCapture) }

        isRunning = false

        if (element instanceof Window) { return }
    }

    return observer
}