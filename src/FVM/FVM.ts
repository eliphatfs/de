import Tensor from "../Tensor/Tensor"
import TensorView from "../Tensor/TensorView"
import FVMWaveSource from './FVMWaveSource'
import { BorderType } from './FVMBorder'

class SpaceGrid {
    u0: TensorView
    u1: TensorView
    size: number
    unit: number
    dim: number
    wavespeed: number
    t: number
    sources: FVMWaveSource[]

    spaceBorderType: BorderType

    constructor(dim: number, targetSize: number, wavespeed: number, sources: FVMWaveSource[]) {
        this.u0 = new Tensor([dim, dim], Float32Array).view();
        this.u1 = new Tensor([dim, dim], Float32Array).view();
        this.dim = dim;
        this.size = targetSize;
        this.unit = this.size / dim;
        this.wavespeed = wavespeed;
        this.t = 0;
        this.sources = sources;
        this.spaceBorderType = BorderType.Reflexive;
    }

    evolve(step: number) {
        for (let {x, y, strength, freq} of this.sources) {
            x = x <= 0 ? 1.1 / this.dim : x >= 1 ? 1 - 1.9 / this.dim : x;
            y = y <= 0 ? 1.1 / this.dim : y >= 1 ? 1 - 1.9 / this.dim : y;
            this.u0.setElement([Math.floor(y * this.dim), Math.floor(x * this.dim)], Math.sin(this.t * freq) * strength);
        }
        const vus = this.wavespeed * this.wavespeed / (this.unit * this.unit);
        const laplacianKernel = Tensor.fromArray([vus, -2 * vus, vus], [3], Float32Array).view();
        let u2 = this.u0.pad(1, 1, 0, 0).conv1d(laplacianKernel, 0).add(this.u0.pad(1, 1, 1, 0).conv1d(laplacianKernel, 1));
        this.u1 = this.u1.add(u2.scl(step));
        if (this.spaceBorderType == BorderType.Absorbing) {
            let sclN = this.wavespeed / this.unit;
            for (let i = 0; i < this.dim; i++) {
                this.u1.setElement([0, i], sclN * (this.u0.at(1, i) - this.u0.at(0, i)));
                this.u1.setElement([i, 0], sclN * (this.u0.at(i, 1) - this.u0.at(i, 0)));
                this.u1.setElement([this.dim - 1, i], sclN * (this.u0.at(this.dim - 2, i) - this.u0.at(this.dim - 1, i)));
                this.u1.setElement([i, this.dim - 1], sclN * (this.u0.at(i, this.dim - 2) - this.u0.at(i, this.dim - 1)));
            }
        }
        this.u0 = this.u0.add(this.u1.scl(step));
        this.t += step;
    }
}

export default SpaceGrid;
