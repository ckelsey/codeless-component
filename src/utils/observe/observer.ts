import ID from '../id'
import Type from '../types/type'
import Equals from '../checks/equals'
import Debounce from '../timing/debounce'
import Get from '../objects/get'
import Diff from '../objects/diff'

const observers = new WeakMap()
const observerKeys: { [key: string]: string[] } = {}

    ; (window as any).observers = () => ({
        map: observers,
        keys: Object.keys(observerKeys)
    })

const isNullOrUndefined = (value: any) => value === null || value === undefined
const emptyNext = (_value: any, _force?: boolean) => { }
const emptyError = (_value: any) => { }
const emptyFn = () => { }
export const SubscribeFn = (_next: typeof emptyNext, _error?: typeof emptyError, _complete?: typeof emptyFn) => emptyFn
const emptyUnsubscribe = (_subscription: ObserverSubscription) => { }
export const nullObserver = (): ObserverInstance => ({
    isComplete: true,
    value: undefined,
    previous: undefined,
    subscriptions: {},
    lastUpdate: 0,
    settings: {},
    removed: [],
    added: [],
    changed: {},
    next: emptyNext,
    error: emptyError,
    complete: emptyFn,
    subscribe: SubscribeFn,
    unsubscribe: emptyUnsubscribe,
    insert: (_element: any, _index?: number) => { },
    insertAll: (_elements: any, _index?: number) => { },
    updateItemsByKey: (_elements: any[], _key: any) => { },
    remove: (_element: any, _index: any, _all?: boolean) => { },
    removeElements: (_elements: any[]) => { },
    reverse: emptyFn,
    has: (_value: any) => false,
    indexOf: (_value: any) => -1,
    on: (_name: string, _callback: Function) => () => { },
    trigger: (_name: string, _data: any) => { },
    data: {}
})

export interface ObserverSubscription {
    next: typeof emptyNext
    error?: typeof emptyError
    complete?: typeof emptyFn
    unsubscribe?: Function
    id: string
}

export interface ObserverOptions {
    noInit?: boolean
    nextOnNew?: boolean
    noSubsComplete?: boolean
    matchType?: boolean
    takeFirst?: boolean
    takeLast?: boolean
    takeBy?: number
    onSubscribe?: (subscription?: ObserverSubscription) => void
    formatter?: (toFormat: any, observer?: ObserverInstance) => any
    initialValue?: any
}

export interface ObserverValuesObject {
    errors: string[]
    updated: number
    subscriptions: { [key: string]: ObserverSubscription }
    isComplete: boolean
    eventCallbacks: { [key: string]: { [key: string]: Function } }
    initialType: string
    initialValue: any
    formatter: Function
    matchType: boolean
    nextOnNew: boolean
    noInit: boolean
    noSubsComplete: boolean
    takeFirst: boolean
    takeLast: boolean
    takeBy: number
    value: any
    previousValue: any
}

export interface ObserverInstance {
    isComplete: boolean
    value: any
    previous: any
    subscriptions: { [key: string]: ObserverSubscription }
    lastUpdate: number
    settings: ObserverOptions
    removed: any[]
    added: any[]
    changed: { [key: string]: any }
    next: typeof emptyNext
    error: typeof emptyError
    complete: typeof emptyFn
    subscribe: typeof SubscribeFn
    unsubscribe: typeof emptyUnsubscribe
    insert: (element: any, index?: number) => void
    insertAll: (elements: any, index?: number) => void
    updateItemsByKey: (_elements: any[], key: any) => void
    remove: (element: any, index: any, all?: boolean) => void
    removeElements: (elements: any[]) => void
    reverse: typeof emptyFn
    has: (value: any) => boolean
    indexOf: (value: any) => number
    on: (name: string, callback: Function) => Function
    trigger: (name: string, data: any) => void
    data: any
}

export default function Observer(initialValue?: any, options: ObserverOptions = {}) {
    let _this: any = [ID()]
    observerKeys[_this[0]] = _this
    const noInit = options.noInit ? true : false
    const nextOnNew = options.nextOnNew === false ? false : true
    const matchType = options.matchType ? true : false
    const onSubscribe = options.onSubscribe && typeof options.onSubscribe === 'function' ? options.onSubscribe : (val: any) => val
    const formatter = options.formatter && typeof options.formatter === 'function' ? options.formatter : (val: any) => val
    initialValue = formatter(initialValue)
    const initialType = Type(initialValue)
    const takeFirst = !!options.takeFirst
    const takeLast = !!options.takeLast
    const debounced = !!takeFirst || !!takeLast
    const takeBy = options.takeBy || 0

    const getInstance = () => observers.get(_this)

    const formatValue = (toFormat: any, obs: any = {}) => {
        const f = formatter(toFormat, obs)
        const inst = getInstance()
        return inst && matchType && Type(f) !== initialType ? inst.data.value : f
    }

    const states = [initialValue]

    const addedRemovedReducer = (source: any[]) => (target: any[], current: any) => {
        if (source.indexOf(current) === -1) { target.push(current) }
        return target
    }

    const bothArray = (source: any, target: any) => Array.isArray(source) && Array.isArray(target)

    function getAddedRemoved(source: any[], target: any[]) {
        return !bothArray(source, target) ? [] : source.reduce(addedRemovedReducer(target), [])
    }


    function getRemoved() {
        const inst = getInstance()
        return inst && inst.data ?
            getAddedRemoved(inst.data.previousValue, inst.data.value) :
            []
    }

    function getAdded() {
        const inst = getInstance()
        return inst && inst.data ? getAddedRemoved(inst.data.value, inst.data.previousValue) : []
    }

    function destroy() {
        const inst = getInstance()

        if (!inst) { return }

        inst.trigger('destroy', inst.data)

        Object.keys(inst.data.subscriptions).forEach(k => Get(inst.data, `subscriptions.${k}.unsubscribe`, emptyFn))

        inst.data.isComplete = true

        delete observerKeys[_this[0]]
        observers.delete(_this)
        _this = null
    }

    const callFn = (
        val: any,
        valuesObj: ObserverValuesObject | undefined,
        functionKey: string,
        subscriptions: { [key: string]: ObserverSubscription }
    ) =>
        (id: string) => {
            const fn = Get(subscriptions, `${id}.${functionKey}`)
            typeof fn === 'function' ? fn(val, valuesObj || {}, id) : undefined
        }

    function doLoop(functionKey: string, val: any, valuesObj?: ObserverValuesObject) {
        const inst = getInstance()

        if (!inst) { return }

        inst.trigger(functionKey, valuesObj || {})

        const subs = inst.data.subscriptions

        Object.keys(subs).forEach(callFn(val, valuesObj, functionKey, subs))

        if (functionKey === 'complete') { destroy() }
    }

    const debouncedLoop = Debounce(doLoop, takeBy, !!takeFirst)
    const loop = !debounced ? doLoop : debouncedLoop

    function unsubscribe(subscription: ObserverSubscription) {
        return function unsubscribeInner() {
            const inst = getInstance()

            if (!inst) { return }

            const subscriptions = inst.data.subscriptions

            delete subscriptions[subscription.id]

            inst.trigger('unsubscribe', { subscription, subscriptions })

            if (inst.data.noSubsComplete && Object.keys(subscriptions).length === 0) {
                destroy()
            }
        }
    }

    function getArrayIndexOf(element: any, isArray: boolean) {
        const inst = getInstance()

        if (!inst || !isArray) { return }

        const index = inst.data.value.indexOf(element)

        return index > -1 ? index : undefined
    }

    function getObjectKey(value: any) {
        let _result

        const inst = getInstance()

        if (!inst) { return }

        const dataVal = inst.data.value

        const keys = Object.keys(dataVal)
        let i = keys.length

        while (i--) {
            if (value === dataVal[keys[i]]) {
                _result = keys[i]
                break
            }
        }

        return _result
    }

    function getValTypes(inst?: any) {
        inst = inst || getInstance()
        const value = Get(inst, 'data.value')

        return inst ? {
            value,
            isArray: Array.isArray(value),
            isString: typeof value === 'string'
        } : {}
    }

    let result: ObserverInstance = {
        get isComplete() {
            const inst = getInstance()
            if (!inst) { return true }

            return inst.data.isComplete
        },
        get value() {
            const inst = getInstance()
            if (!inst) { return }
            return inst.data.value
        },
        get previous() {
            const inst = getInstance()
            if (!inst) { return }
            return inst.data.previousValue
        },
        get subscriptions() {
            const inst = getInstance()
            if (!inst) { return }
            return inst.data.subscriptions
        },
        get lastUpdate() {
            const inst = getInstance()
            if (!inst) { return }
            return inst.data.updated
        },
        get settings() {
            return {
                initialType,
                formatter,
                matchType,
                nextOnNew,
                noInit,
                takeFirst,
                takeLast,
                takeBy
            }
        },

        get removed() { return getRemoved() },

        get added() { return getAdded() },

        get changed() {
            const inst = getInstance()
            if (!inst) { return [] }
            return Diff(inst.data.previousValue, inst.data.value)
        },

        next: function (v: any, force?: boolean) {
            const inst = getInstance()

            if (!inst) { return }

            const formatted = formatValue(v, inst)

            if (!force && nextOnNew && Equals(formatted, inst.data.value)) { return }

            inst.data.value = formatted
            inst.data.updated = new Date().getTime()

            loop('next', inst.data.value, inst.data)

            return inst.data
        },

        error: function (err: string) {
            const inst = getInstance()
            if (!inst) { return }

            inst.data.errors = inst.data.errors.concat([err])
            inst.data.updated = new Date().getTime()

            loop('error', err, inst.data)

            inst.complete()
        },

        complete: function () {
            const inst = getInstance()
            if (!inst) { return }
            loop('complete', inst.data)
        },

        subscribe: function (next: (value: any, force?: boolean) => void, error = (_err: string) => { }, complete = emptyFn) {
            const inst = getInstance()

            if (!inst) { return () => { } }

            const subscription: ObserverSubscription = Object.assign({}, {
                next: next,
                error: error,
                complete: complete,
                id: ID()
            })

            subscription.unsubscribe = unsubscribe(subscription)
            inst.data.subscriptions[subscription.id] = subscription

            if (!noInit && inst.data.value !== undefined && typeof subscription.next === 'function') {
                subscription.next(inst.data.value)
            }

            onSubscribe(subscription)

            return unsubscribe(subscription)
        },

        unsubscribe: function (subscription: ObserverSubscription) {
            const inst = getInstance()

            if (!inst || !subscription || !subscription.id || !inst.data.subscriptions[subscription.id]) { return }

            return unsubscribe(subscription)
        },

        insert: function (element: any, index?: number) {
            const inst = getInstance()

            if (!inst) { return }

            const valData = getValTypes(inst)
            index = index == undefined ? Get(valData, 'value.length', 0) : index

            if (valData.isArray) {
                valData.value.splice(index, index !== valData.value.length ? 1 : 0, element)
                return inst.next(valData.value, true)
            }

            if (typeof valData.value === 'string') {
                valData.value = valData.value.slice(0, index) + element + valData.value.slice(index)
                return inst.next(valData.value, true)
            }

            valData.value[index as number] = element

            return inst.next(valData.value, true)
        },

        insertAll: function (elements: any[] | { [key: string]: any }, index?: number) {
            const inst = getInstance()

            if (!inst) { return }

            const valData = getValTypes(inst)
            index = index == undefined ? Get(valData, 'value.length', 0) : index

            if (valData.isArray) {
                if (!Array.isArray(elements)) { return }
                valData.value.splice.apply(valData.value, [index, index !== valData.value.length ? 1 : 0, ...elements])
                return inst.next(valData.value, true)
            }

            const elementsObject = elements as { [key: string]: any }

            Object.keys(elementsObject).forEach(elementKey => inst.data.value[elementKey] = elementsObject[elementKey])

            return inst.next(valData.value, true)
        },

        updateItemsByKey: function (elements: any[], key: any) {
            const inst = getInstance()

            if (!inst || !Array.isArray(elements)) { return }

            let elementsToAdd = elements.slice()

            const newValue = inst.value
                .slice()
                .map((element: any) => {
                    if (isNullOrUndefined(element[key])) { return element }

                    const matchingElementIndex = elementsToAdd.findIndex(elementToAdd => !isNullOrUndefined(elementToAdd[key]) && elementToAdd[key] === element[key])

                    if (matchingElementIndex === -1) { return element }

                    const elementToAdd = elementsToAdd[matchingElementIndex]

                    elementsToAdd.splice(matchingElementIndex, 1)

                    return elementToAdd
                })
                .concat(elementsToAdd)

            return inst.next(newValue, true)
        },

        remove: function (element: any, index: any, all = false) {
            const inst = getInstance()

            if (!inst) { return }

            const valData = getValTypes(inst)

            if (index === undefined) {
                index = getArrayIndexOf(element, valData.isArray as boolean)
            }

            if (index === undefined && valData.isArray) {
                return valData.value
            }

            if (index === undefined && valData.isString) {
                return inst.next(valData.value.replace(new RegExp(element, all ? 'gm' : ''), ''), true)
            }

            if (index !== undefined) {
                if (valData.isArray) {
                    valData.value.splice(index, 1)
                } else if (valData.isString) {
                    inst.data.value = valData.value.slice(0, index)
                } else {
                    inst.data.value[index] = undefined
                    delete inst.data.value[index]
                }

                return inst.next(valData.value, true)
            }

            const objectKey = getObjectKey(element)

            if (objectKey !== undefined) {
                inst.data.value[objectKey] = null
                delete inst.data.value[objectKey]
                return inst.next(inst.data.value, true)
            }

            return inst.next(inst.data.value, true)
        },

        removeElements: function (elements: any[]) {
            const inst = getInstance()

            if (!inst) { return }

            const valData = getValTypes(inst)

            if (valData.isArray) {

                for (let i = 0; i < elements.length; i = i + 1) {
                    const index = valData.value.indexOf(elements[i])
                    if (index > -1) {
                        valData.value.splice(index, 1)
                    }
                }

                return inst.next(valData.value, true)
            }

            Object.keys(elements).forEach(prop => delete valData.value[prop])

            return inst.next(valData.value, true)
        },

        reverse: function () {
            const inst = getInstance()

            if (!inst) { return }

            const valData = getValTypes(inst)

            if (valData.isArray) {
                return inst.next(valData.value.reverse(), true)
            }

            if (valData.isString) {
                return inst.next(valData.value.split('').reverse(), true)
            }

            inst.next(valData.value, true)
        },

        has: function has(value: any) {
            const valData = getValTypes()

            if (valData.isArray) {
                return getArrayIndexOf(value, valData.isArray) || false
            }

            if (valData.isString) {
                return valData.value.indexOf(value) > -1
            }

            const objectKey = getObjectKey(value)

            if (objectKey !== undefined) {
                return true
            }

            return false
        },

        indexOf: function indexOf(value: any) {
            const valData = getValTypes()

            if (valData.isArray) {
                return getArrayIndexOf(value, valData.isArray) || -1
            }

            if (valData.isString) {
                return valData.value.indexOf(value)
            }

            return getObjectKey(value) || -1
        },

        on: function on(name: string, callback: Function) {
            const inst = getInstance()

            if (!inst) { return () => { } }

            if (!inst.data.eventCallbacks[name]) {
                observers.get(_this).data.eventCallbacks[name] = {}
            }

            const id = ID()
            observers.get(_this).data.eventCallbacks[name][id] = callback

            return () => delete observers.get(_this).data.eventCallbacks[name][id]
        },

        trigger: function trigger(name: string, data: any) {
            const inst = getInstance()

            if (!inst) { return }

            const callbacks = inst.data.eventCallbacks[name]

            if (!callbacks) { return }

            Object.keys(callbacks).forEach(prop => callbacks[prop](data))
        },

        data: {
            errors: [],
            updated: new Date().getTime(),
            subscriptions: {},
            isComplete: false,
            initialType,
            initialValue,
            eventCallbacks: {},
            formatter,
            matchType,
            nextOnNew,
            noInit,
            noSubsComplete: options.noSubsComplete === true ? true : false,
            takeFirst,
            takeLast,
            value: null,
            previousValue: null
        }
    }

    observers.set(_this, result)

    Object.defineProperties(getInstance().data, {
        value: {
            get() {
                return states[0]
            },
            set(v) {
                states.unshift(v)
                while (states.length > 2) { states.pop() }
            }
        },
        previousValue: {
            get() {
                return states[1]
            }
        }
    })


    return getInstance()
}
