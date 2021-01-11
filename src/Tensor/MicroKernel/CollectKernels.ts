import BaseMicroKernel, { MKSpec } from './BaseMicroKernel'
import TensorView from '../TensorView'
import MicroKernelMultiplexer from './MicroKernelMultiplexer'

class CollectKernelLayer extends BaseMicroKernel {
    get kndim(): number { throw new Error("Abstract method"); }

    getSpecs(): MKSpec {
        return {
            name: "`Collect`",
            operandNDims: [this.kndim]
        };
    }
    computeShape(...opShapes: number[][]): number[] { return opShapes[0]; }
}

class CollectKernel0D extends CollectKernelLayer {
    get kndim() { return 0; }

    invoke(out: TensorView, ...operands: TensorView[]) {
        out.tensor.raw[out.indicesToIndex([])] = operands[0].at();
    }
}

class CollectKernel1D extends CollectKernelLayer {
    get kndim() { return 1; }
    
    invoke(out: TensorView, ...operands: TensorView[]) {
        const s = operands[0];
        const L = out.shape[0];
        const propdec = (view: TensorView) => ({o: view.offset, s: view.strides[1], r: view.tensor.raw});
        let {o: po, s: so, r: ro} = propdec(out);
        let {o: ps, s: ss, r: rs} = propdec(s);
        for (let i = 0; i < L; ++i)
            ro[po + i * so] = rs[ps + i * ss];
    }
}

class CollectKernel2D extends CollectKernelLayer {
    get kndim() { return 2; }
    
    invoke(out: TensorView, ...operands: TensorView[]) {
        const s = operands[0];
        const [L, H] = out.shape;
        const propdec = (view: TensorView) => ({o: view.offset, s1: view.strides[1], s2: view.strides[2], r: view.tensor.raw});
        let {o: po, s1: so1, s2: so2, r: ro} = propdec(out);
        let {o: ps, s1: ss1, s2: ss2, r: rs} = propdec(s);
        for (let i = 0; i < L; ++i)
            for (let j = 0; j < H; ++j)
                ro[po + i * so1 + j * so2] = rs[ps + i * ss1 + j * ss2];
    }
}

class CollectKernelMultiplex extends MicroKernelMultiplexer {
    get microKernelList() {
        return [new CollectKernel2D(), new CollectKernel1D(), new CollectKernel0D()];
    }
}

export default CollectKernelMultiplex;
