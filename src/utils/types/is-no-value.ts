export default function IsNoValue(value: any) {
    return value === undefined ||
        value === null ||
        value === '' ||
        value === 'undefined' ||
        value === 'null'
}