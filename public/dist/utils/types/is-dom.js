var isBrowser = new Function("try {return this===window;}catch(e){ return false;}");
export default function IsDom(value) {
    if (!isBrowser()) {
        return false;
    }
    return (value instanceof Element) || (value instanceof Node);
}
