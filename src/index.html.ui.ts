import Util from './Util'
const editContainer = document.getElementById("edit-container")!;
const waveSrcFocus = document.getElementById("wave-src-focus")!;
const waveSrcTemplate = document.getElementById("wave-src-template")!;
const waveSrcButton = document.getElementById("wave-src-button")!;
const gpEditButton = document.getElementById("gp-edit-button")!;

let state: UIState;

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
        window.fvm.sources.push(Util.cooToPivot([y, x], editContainer));
        const newSrc = editContainer.appendChild(waveSrcTemplate.cloneNode()) as HTMLElement;
        newSrc.id = "";
        Util.setXYAttributes([x, y], newSrc);
        Util.setOpacityAttribute(1, newSrc);
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
