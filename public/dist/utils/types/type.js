import IsNonCollection from "./is-non-collection.js";
import IsDom from "./is-dom.js";
import IsDate from "./is-date.js";
import IsObject from "./is-object.js";
export default function Type(value) {
    return value === null ?
        'null' :
        IsNonCollection(value) ?
            typeof value === 'string' ?
                'string' :
                !isNaN(value) ?
                    'number' :
                    IsDate(value) ?
                        'date' :
                        typeof value :
            IsDom(value) ?
                'dom' :
                Array.isArray(value) ?
                    'array' :
                    IsObject(value) ?
                        'object' :
                        typeof value;
}
