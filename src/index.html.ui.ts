import Util from './Util'
import FVMWaveSource from './FVM/FVMWaveSource'
import DialogBuilder from './UI/DialogBuilder';
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
    editWindow() {
        new DialogBuilder()
        .rowForm("Wave source")
        .rowDiv()
        .button("Close", (delegate) => delegate.close())
        .space()
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
        const [xp, yp] = Util.pivot([xr, yr], waveSrcFocus, [0.5, 0.5]);
        Util.setXYAttributes([xp, yp], waveSrcFocus);
    }
    waveSrcDown(ev: MouseEvent) {
        if (ev.button != 0) return;
        const x = parseFloat(waveSrcFocus.getAttribute("x")!);
        const y = parseFloat(waveSrcFocus.getAttribute("y")!);
        const sourceObj = new FVMWaveSource(...Util.cooToPivot([y, x], editContainer));
        window.fvm.sources.push(sourceObj);
        const newSrc = editContainer.appendChild(waveSrcTemplate.cloneNode(true)) as HTMLElement;
        newSrc.id = "";
        Util.setXYAttributes([x, y], newSrc);
        Util.setOpacityAttribute(1, newSrc);
        editables.push(new WaveSourceEditable(newSrc, sourceObj));
    }
}

state = CreateWaveSource.instance;
state.enter();

gpEditButton.onclick = () => { state.transition(GPEdit.instance); };
waveSrcButton.onclick = () => { state.transition(CreateWaveSource.instance); };

document.getElementById("play-button")!.onclick = () => { window.fvm.running = true; };
document.getElementById("pause-button")!.onclick = () => { window.fvm.running = false; };
document.getElementById("restore-button")!.onclick = () => { window.fvm.running = false; window.fvm.reset_trigger = true; };

export {};
