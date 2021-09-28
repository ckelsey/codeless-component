/**
 * Determines if a value is or can be a valid date
 * @function IsDate
 * @param {any} value - The value to test
 * @return (boolean) If the value is a valid date
 * @example 
 * IsDate('Mon Nov 18 2019 07:41:48 GMT-0800') // true
 * IsDate('Not a date') // false
 */

export default function IsDate(value: any) {
    if (typeof value === 'string' && parseFloat(value).toString() === value) { return false } // i.e. 222 is a date, but we don't want that

    const tempValue: any = new Date(Date.parse(value))

    return (
        tempValue !== 'Invalid Date'
        && !isNaN(tempValue)
        && tempValue instanceof Date
    )
}