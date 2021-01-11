import BaseMicroKernel from './BaseMicroKernel.js'
import TensorView from '../TensorView.js'
import MicroKernelMultiplexer from './MicroKernelMultiplexer.js'

class CollectKernelLayer extends BaseMicroKernel {
    get kndim() { return undefined; }
    /**
     * @typedef {Object} MKSpec
     * @property {string} name - name of micro kernel
     * @property {number[]} operandNDims - #dims of operands
     * @returns {MKSpec}
     */
    getSpecs() {
        return {
            name: "`Collect`",
            operandNDims: [this.kndim]
        };
    }
    /**
     * 
     * @param {...number[]} opShapes 
     * @returns {number[]}
     */
    computeShape(...opShapes) { return opShapes[0]; }
}

class CollectKernel0D extends CollectKernelLayer {
    get kndim() { return 0; }
    /**
     * @param  {TensorView} out 
     * @param  {...TensorView} operands 
     */
    invoke(out, ...operands) {
        out.tensor.raw[out.indicesToIndex([])] = operands[0].at();
    }
}

class CollectKernel1D extends CollectKernelLayer {
    get kndim() { return 1; }
    /**
     * @param  {TensorView} out 
     * @param  {...TensorView} operands 
     */
    invoke(out, ...operands) {
        const s = operands[0];
        const L = out.shape[0];
        const propdec = (view) => ({o: view.offset, s: view.strides[1], r: view.tensor.raw});
        let {o: po, s: so, r: ro} = propdec(out);
        let {o: ps, s: ss, r: rs} = propdec(s);
        for (let i = 0; i < L; ++i)
            ro[po + i * so] = rs[ps + i * ss];
    }
}

class CollectKernel2D extends CollectKernelLayer {
    get kndim() { return 2; }
    /**
     * @param  {TensorView} out 
     * @param  {...TensorView} operands 
     */
    invoke(out, ...operands) {
        const s = operands[0];
        const [L, H] = out.shape;
        const propdec = (view) => ({o: view.offset, s1: view.strides[1], s2: view.strides[2], r: view.tensor.raw});
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
