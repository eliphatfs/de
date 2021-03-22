import Util from './Util'
import FVMWaveSource from './FVM/FVMWaveSource'
import DialogBuilder from './UI/DialogBuilder';
import { BorderType } from './FVM/FVMBorder';
const editContainer = document.getElementById("edit-container")!;
const waveSrcFocus = document.getElementById("wave-src-focus")!;
const waveSrcTemplate = document.getElementById("wave-src-template")!;
const waveSrcButton = document.getElementById("wave-src-button")!;
const gpEditButton = document.getElementById("gp-edit-button")!;

interface IEditable {
    view: HTMLElement
    editWindow: () => void
}

class Editable<T> implements IEditable {
    view: HTMLElement
    target: T
    constructor(view: HTMLElement, target: T) { this.view = view; this.target = target; }
    editWindow() { }
}

class WaveSourceEditable extends Editable<FVMWaveSource> {
    validNormalizedValue(s: string) {
        let f = Util.fixNumericString(s);
        if (parseFloat(f) < 0) return "0";
        if (parseFloat(f) > 1) return "1";
        return f;
    }
    refreshView() {
        Util.setXYAttributesPivotted(Util.pivotToCoo([this.target.x, this.target.y], this.view.parentElement!), this.view);
    }
    editWindow() {
        new DialogBuilder()
        .rowForm({ title: "Wave source" })
        .grid()
        .gridUnit(1, 2).textInputField({
            label: "X",
            initial: this.target.x.toString(),
            onValidate: this.validNormalizedValue,
            onCommit: (s) => {
                this.target.x = parseFloat(s);
                this.refreshView();
            }
        })
        .gridUnit(1, 2).textInputField({
            label: "Y",
            initial: this.target.y.toString(),
            onValidate: this.validNormalizedValue,
            onCommit: (s) => {
                this.target.y = parseFloat(s);
                this.refreshView();
            }
        })
        .gridUnit(1, 2).textInputField({
            label: "Amplitude (m)",
            initial: this.target.strength.toString(),
            onValidate: Util.fixNumericString,
            onCommit: (s) => {
                this.target.strength = parseFloat(s);
            }
        })
        .gridUnit(1, 2).textInputField({
            label: "Frequency (Hz)",
            initial: this.target.freq.toString(),
            onValidate: Util.fixNumericString,
            onCommit: (s) => {
                this.target.freq = parseFloat(s);
            }
        })
        .rowDiv()
        .button("OK", (delegate) => delegate.commitFields().close(), { primary: true }).space()
        .button("Cancel", (delegate) => delegate.close()).space()
        .button("Delete", (delegate) => {
            this.view.remove();
            window.fvm.sources.splice(window.fvm.sources.indexOf(this.target), 1);
            delegate.close();
        }, { color: "#e05f5f", textColor: "white" })
        .show();
    }
}

let state: UIState;
let editables: IEditable[] = [];

class UIState {
    enter() {}
    exit() {}
    transition(newState: UIState) {
        if (state === newState) return;
        this.exit();
        state = newState;
        newState.enter();
    }
}

class GPEdit extends UIState {
    static instance = new GPEdit();
    enter() {
        gpEditButton.classList.add("pure-button-active");
        for (let editable of editables) {
            editable.view.onmouseenter = () => editable.view.classList.add("highlight-color");
            editable.view.onmouseleave = () => editable.view.classList.remove("highlight-color");
            editable.view.onclick = () => editable.editWindow();
        }
    }
    exit() {
        gpEditButton.classList.remove("pure-button-active");
        for (let editable of editables) {
            editable.view.onmouseenter = null;
            editable.view.onmouseleave = null;
            editable.view.onclick = null;
        }
    }
}

class CreateWaveSource extends UIState {
    static instance = new CreateWaveSource();
    enter() {
        waveSrcFocus.style.display = "";
        window.addEventListener("mousemove", this.trackSrcFocus);
        waveSrcFocus.onmousedown = this.waveSrcDown;
        waveSrcButton.classList.add("pure-button-active");
    }
    exit() {
        waveSrcFocus.style.display = "none";
        window.removeEventListener("mousemove", this.trackSrcFocus);
        waveSrcButton.classList.remove("pure-button-active");
    }
    trackSrcFocus(ev: MouseEvent) {
        const [xr, yr] = Util.relativePosition([ev.clientX, ev.clientY], editContainer);
        Util.setXYAttributesPivotted([xr, yr], waveSrcFocus);
    }
    waveSrcDown(ev: MouseEvent) {
        if (ev.button != 0) return;
        const [x, y] = Util.getXYAttributesPivotted(waveSrcFocus);
        const sourceObj = new FVMWaveSource(...Util.cooToPivot([x, y], editContainer), 1, 2000);
        window.fvm.sources.push(sourceObj);
        const newSrc = editContainer.appendChild(waveSrcTemplate.cloneNode(true)) as HTMLElement;
        newSrc.id = "";
        Util.setXYAttributesPivotted([x, y], newSrc);
        Util.setOpacityAttribute(1, newSrc);
        editables.push(new WaveSourceEditable(newSrc, sourceObj));
    }
}

state = CreateWaveSource.instance;
state.enter();

gpEditButton.onclick = () => { state.transition(GPEdit.instance); };
waveSrcButton.onclick = () => { state.transition(CreateWaveSource.instance); };

document.getElementById("wave-project-settings-button")!.onclick = () => {
    new DialogBuilder().rowForm({ title: "Volume options" })
    .grid().gridUnit(1, 1).dropdown({
        items: ["Reflexive", "Absorbing"],
        initial: window.fvm.borderType as number,
        label: "Border",
        onCommit: (idx) => window.fvm.borderType = idx as BorderType
    })
    .rowDiv()
    .button("OK", (delegate) => delegate.commitFields().close(), { primary: true }).space()
    .button("Cancel", (delegate) => delegate.close())
    .show();
};

document.getElementById("play-button")!.onclick = () => { window.fvm.running = true; };
document.getElementById("pause-button")!.onclick = () => { window.fvm.running = false; };
document.getElementById("restore-button")!.onclick = () => { window.fvm.running = false; window.fvm.reset_trigger = true; };

export {};
