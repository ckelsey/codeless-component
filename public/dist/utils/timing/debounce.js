const Debounce = (func, wait = 33, immediate = false) => {
    let timer = 0;
    const _this = this;
    return function () {
        const context = _this;
        const args = arguments;
        const callNow = immediate && !timer;
        const later = function () {
            timer = requestAnimationFrame(function () {
                timer = 0;
                if (!immediate)
                    func.apply(context, args);
            });
        };
        clearTimeout(timer);
        cancelAnimationFrame(timer);
        timer = setTimeout(later, wait);
        if (callNow) {
            func.apply(context, args);
        }
    };
};
export default Debounce;
