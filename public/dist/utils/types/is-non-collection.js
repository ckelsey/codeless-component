const nonCollections = ['string', 'number', 'null', 'undefined', 'function', 'boolean', 'date'];
export default function IsNonCollection(value) { return nonCollections.indexOf(typeof value) > -1 || value === null || value instanceof Date; }
