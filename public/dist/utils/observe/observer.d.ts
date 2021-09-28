declare const emptyNext: (_value: any, _force?: boolean | undefined) => void;
declare const emptyError: (_value: any) => void;
declare const emptyFn: () => void;
export declare const SubscribeFn: (_next: typeof emptyNext, _error?: ((_value: any) => void) | undefined, _complete?: (() => void) | undefined) => () => void;
declare const emptyUnsubscribe: (_subscription: ObserverSubscription) => void;
export declare const nullObserver: () => ObserverInstance;
export interface ObserverSubscription {
    next: typeof emptyNext;
    error?: typeof emptyError;
    complete?: typeof emptyFn;
    unsubscribe?: Function;
    id: string;
}
export interface ObserverOptions {
    noInit?: boolean;
    nextOnNew?: boolean;
    noSubsComplete?: boolean;
    matchType?: boolean;
    takeFirst?: boolean;
    takeLast?: boolean;
    takeBy?: number;
    onSubscribe?: (subscription?: ObserverSubscription) => void;
    formatter?: (toFormat: any, observer?: ObserverInstance) => any;
    initialValue?: any;
}
export interface ObserverValuesObject {
    errors: string[];
    updated: number;
    subscriptions: {
        [key: string]: ObserverSubscription;
    };
    isComplete: boolean;
    eventCallbacks: {
        [key: string]: {
            [key: string]: Function;
        };
    };
    initialType: string;
    initialValue: any;
    formatter: Function;
    matchType: boolean;
    nextOnNew: boolean;
    noInit: boolean;
    noSubsComplete: boolean;
    takeFirst: boolean;
    takeLast: boolean;
    takeBy: number;
    value: any;
    previousValue: any;
}
export interface ObserverInstance {
    isComplete: boolean;
    value: any;
    previous: any;
    subscriptions: {
        [key: string]: ObserverSubscription;
    };
    lastUpdate: number;
    settings: ObserverOptions;
    removed: any[];
    added: any[];
    changed: {
        [key: string]: any;
    };
    next: typeof emptyNext;
    error: typeof emptyError;
    complete: typeof emptyFn;
    subscribe: typeof SubscribeFn;
    unsubscribe: typeof emptyUnsubscribe;
    insert: (element: any, index?: number) => void;
    insertAll: (elements: any, index?: number) => void;
    updateItemsByKey: (_elements: any[], key: any) => void;
    remove: (element: any, index: any, all?: boolean) => void;
    removeElements: (elements: any[]) => void;
    reverse: typeof emptyFn;
    has: (value: any) => boolean;
    indexOf: (value: any) => number;
    on: (name: string, callback: Function) => Function;
    trigger: (name: string, data: any) => void;
    data: any;
}
export default function Observer(initialValue?: any, options?: ObserverOptions): any;
export {};
