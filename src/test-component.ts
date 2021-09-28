import CustomElement from "./component"

const template = require('./test-component.html')
const style = require('./test-component.scss')

@CustomElement({
    selector: 'test-component',
    template,
    style,
    state: {
        msg: { initial: 'Meep', attribute: true }
    },
    stateSubscriptions: {
        msg: {
            next: (host: TestComponent, newVal: any) => {
                console.log('newval', newVal, host)
                const shadow = host.shadowRoot
                if (shadow) {
                    const root = shadow.getElementById('hello')
                    if (root) {
                        root.textContent = newVal
                    }
                }
            }
        }
    }
})

class TestComponent extends HTMLElement {
    msg!: string
    sayHi() {
        console.log(this.msg)
    }
}

export default TestComponent