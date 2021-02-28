import FVM from './FVM/FVM'
import DynamicImshowTyped from './Render/DynamicImshowTyped'

declare global {
  interface Window {
    fvm: {
        running: boolean;
        sources: [number, number][];
    }
  }
}
window.fvm = { running: false, sources: [] };

const mainCanvas = document.getElementById("main-canvas") as HTMLCanvasElement;
const ctx = mainCanvas.getContext("2d")!;
let fvm = new FVM(256, 4, 340, window.fvm.sources);
let data = new Float32Array(256 * 256);
let imshow = new DynamicImshowTyped(ctx, data, 256, 256);


data.set(fvm.u0.toTensor().raw);
imshow.render(ctx);

function tick() {
    if (window.fvm.running) {
        fvm.evolve(0.4 * 4 / 256 / 340);
        data.set(fvm.u0.toTensor().raw);
        imshow.render(ctx);
    }
    requestAnimationFrame(tick);
}

tick();

export {};
