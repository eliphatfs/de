import Util from './Util'
const editContainer = document.getElementById("edit-container")!;
const waveSrcFocus = document.getElementById("wave-src-focus")!;
const waveSrcTemplate = document.getElementById("wave-src-template")!;

document.getElementById("play-button")!.onclick = () => { window.fvm.running = true; };
document.getElementById("pause-button")!.onclick = () => { window.fvm.running = false; };
document.getElementById("restore-button")!.onclick = () => { window.fvm.running = false; window.fvm.reset_trigger = true; };

window.addEventListener("mousemove", (ev) => {
    const [xr, yr] = Util.relativePosition([ev.clientX, ev.clientY], editContainer);
    const [xp, yp] = Util.pivot([xr, yr], waveSrcFocus, [0.5, 0.5]);
    Util.setXYAttributes([xp, yp], waveSrcFocus);
});

waveSrcFocus.onmousedown = (ev) => {
    if (ev.button != 0) return;
    const x = parseFloat(waveSrcFocus.getAttribute("x")!);
    const y = parseFloat(waveSrcFocus.getAttribute("y")!);
    window.fvm.sources.push(Util.cooToPivot([y, x], editContainer));
    const newSrc = editContainer.appendChild(waveSrcTemplate.cloneNode()) as HTMLElement;
    newSrc.id = "";
    Util.setXYAttributes([x, y], newSrc);
    Util.setOpacityAttribute(1, newSrc);
};

export {};
