import IsNonCollection from './is-non-collection'
import IsDom from './is-dom'
import IsDate from './is-date'
import IsObject from './is-object'

export default function Type(value: any) {
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
                        typeof value

}