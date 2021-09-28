const Debounce = (func: Function, wait = 33, immediate = false) => {
    let timer: any = 0
    const _this = this
    return function () {
        const context: any = _this
        const args = arguments
        const callNow = immediate && !timer
        const later = function () {
            timer = requestAnimationFrame(function () {
                timer = 0
                if (!immediate) func.apply(context, args)
            })
        }

        clearTimeout(timer)
        cancelAnimationFrame(timer)

        timer = setTimeout(later, wait)

        if (callNow) { func.apply(context, args) }
    }
}
export default Debounce