import Type from "../types/type.js";
function isEmpty(toCheck) {
    if (toCheck === undefined) {
        return true;
    }
    if (typeof toCheck === 'object' && Object.keys(toCheck).length === 0) {
        return true;
    }
    return false;
}
export default function Diff(sourceObject, compareObject) {
    const differences = {};
    const sourceType = Type(sourceObject);
    const compareType = Type(compareObject);
    const validTypes = ['object', 'array'];
    if (validTypes.indexOf(sourceType) == -1 || validTypes.indexOf(compareType) == -1) {
        return sourceObject !== compareObject ? compareObject === undefined ? sourceObject : compareObject : undefined;
    }
    if (sourceType !== compareType) {
        return compareType == 'undefined' && sourceType !== 'undefined' ? sourceObject : compareObject;
    }
    function doCompare(index) {
        if (differences[index]) {
            return;
        }
        const compared = Diff(sourceObject[index], compareObject[index]);
        if (!isEmpty(compared)) {
            differences[index] = sourceObject[index] === compared ? undefined : compared;
        }
    }
    if (sourceType == 'object') {
        Object.keys(sourceObject).forEach(doCompare);
        Object.keys(compareObject).forEach(doCompare);
    }
    if (sourceType == 'array') {
        sourceObject.forEach((_v, index) => doCompare(index));
        compareObject.forEach((_v, index) => doCompare(index));
    }
    return differences;
}
