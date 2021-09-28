export default function IsDate(value) {
    if (typeof value === 'string' && parseFloat(value).toString() === value) {
        return false;
    }
    const tempValue = new Date(Date.parse(value));
    return (tempValue !== 'Invalid Date'
        && !isNaN(tempValue)
        && tempValue instanceof Date);
}
