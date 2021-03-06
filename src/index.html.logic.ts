import FVM from './FVM/FVM'
import { BorderType } from './FVM/FVMBorder';
import FVMWaveSource from './FVM/FVMWaveSource';
import DynamicImshowTyped from './Render/DynamicImshowTyped'

declare global {
  interface Window {
    fvm: {
        running: boolean;
        sources: FVMWaveSource[];
        reset_trigger: boolean;
        borderType: BorderType;
        render: {
            map_max: number;
            map_min: number;
        }
    }
  }
}
window.fvm = {
    running: false, sources: [], reset_trigger: false, borderType: BorderType.Reflexive,
    render: {
        map_max: 1.0,
        map_min: -1.0
    }
};

const mainCanvas = document.getElementById("main-canvas") as HTMLCanvasElement;
const ctx = mainCanvas.getContext("2d")!;
let fvm = new FVM(256, 4, 340, window.fvm.sources);
let data = new Float32Array(256 * 256);
let imshow = new DynamicImshowTyped(ctx, data, 256, 256);

function transfer_and_render() {
    data.set(fvm.u0.toTensor().raw);
    imshow.mapmax = window.fvm.render.map_max;
    imshow.mapmin = window.fvm.render.map_min;
    imshow.render(ctx);
}

transfer_and_render();

function tick() {
    if (window.fvm.reset_trigger) {
        fvm = new FVM(256, 4, 340, window.fvm.sources);
        transfer_and_render();
        window.fvm.reset_trigger = false;
    }
    if (window.fvm.running) {
        fvm.spaceBorderType = window.fvm.borderType;
        fvm.evolve(0.4 * 4 / 256 / 340);
        transfer_and_render();
    }
    requestAnimationFrame(tick);
}

tick();

export {};
