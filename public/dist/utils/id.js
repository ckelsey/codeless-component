let index = 0;
function doId(indx) {
    return doHash() + indx;
}
function doHash() {
    return (performance.now() + 'xxxxxxxxxxxxxxxx')
        .replace(/[x]|\./g, function () {
        return (Math.random() * 16 | 0).toString(16);
    });
}
export default function ID() {
    index = index + 1;
    return doId(index);
}
