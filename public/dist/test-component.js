var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import CustomElement from "./component.js";
const template = "<div id=\"hello\">Hello</div>";
const style = "#hello{color:red}";
let TestComponent = class TestComponent extends HTMLElement {
    sayHi() {
        console.log(this.msg);
    }
};
TestComponent = __decorate([
    CustomElement({
        selector: 'test-component',
        template,
        style,
        state: {
            msg: { initial: 'Meep', attribute: true }
        },
        stateSubscriptions: {
            msg: {
                next: (host, newVal) => {
                    console.log('newval', newVal, host);
                    const shadow = host.shadowRoot;
                    if (shadow) {
                        const root = shadow.getElementById('hello');
                        if (root) {
                            root.textContent = newVal;
                        }
                    }
                }
            }
        }
    })
], TestComponent);
export default TestComponent;
