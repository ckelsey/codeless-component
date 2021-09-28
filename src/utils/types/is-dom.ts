/**
 * Determines if a value is a valid DOM element
 * @function IsDom
 * @param {any} value - The value to test
 * @return {boolean} If the value is a DOM element
 * @example
 * const element = document.createElement('div')
 * IsDom(element) // true
 * IsDom('nope') // false
 */

var isBrowser = new Function("try {return this===window;}catch(e){ return false;}")
export default function IsDom(value: any) {
    if (!isBrowser()) { return false }
    return (value instanceof Element) || (value instanceof Node)
}