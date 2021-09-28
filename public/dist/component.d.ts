import { ObserverOptions, ObserverInstance } from "./utils/observe/observer";
interface StateMetaItem {
    initial: any;
    attribute?: boolean;
    formatter?: ObserverOptions['formatter'];
    matchType?: boolean;
}
interface ComponentConfig {
    selector: string;
    template: string;
    style?: string;
    state?: {
        [key: string]: StateMetaItem;
    };
    stateSubscriptions?: {
        [key: string]: {
            next?: (newValue: any, observerInstance?: ObserverInstance) => void;
            error?: (error: string, observerInstance?: ObserverInstance) => void;
            complete?: (observerInstance?: ObserverInstance) => void;
        };
    };
}
declare function Component(config: ComponentConfig): (constructor: CustomElementConstructor) => void;
export default Component;
