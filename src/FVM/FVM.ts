import Tensor from "../Tensor/Tensor"
import TensorView from "../Tensor/TensorView"

class SpaceGrid {
    u0: TensorView
    u1: TensorView
    size: number
    unit: number
    dim: number
    wavespeed: number
    t: number

    constructor(dim: number, targetSize: number, wavespeed: number) {
        this.u0 = new Tensor([dim, dim], Float32Array).view();
        this.u1 = new Tensor([dim, dim], Float32Array).view();
        this.dim = dim;
        this.size = targetSize;
        this.unit = this.size / dim;
        this.wavespeed = wavespeed;
        this.t = 0;
    }

    evolve(step: number) {
        const visit = Math.floor(this.dim / 4);
        this.u0.setElement([visit, visit], Math.sin(this.t * 2000));
        const vus = this.wavespeed * this.wavespeed / (this.unit * this.unit);
        const laplacianKernel = Tensor.fromArray([vus, -2 * vus, vus], [3], Float32Array).view();
        let u2 = this.u0.pad(1, 1, 0, 0).conv1d(laplacianKernel, 0).add(this.u0.pad(1, 1, 1, 0).conv1d(laplacianKernel, 1));
        this.u1 = this.u1.add(u2.scl(step));
        this.u0 = this.u0.add(this.u1.scl(step));
        this.t += step;
    }
}

export default SpaceGrid;
