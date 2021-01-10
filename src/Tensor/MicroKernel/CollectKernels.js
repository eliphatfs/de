import BaseMicroKernel from './BaseMicroKernel.js'
import TensorView from '../TensorView.js'
import MicroKernelMultiplexer from './MicroKernelMultiplexer.js'

class CollectKernel0D extends BaseMicroKernel {
    /**
     * @typedef {Object} MKSpec
     * @property {string} name - name of micro kernel
     * @property {number[]} operandNDims - #dims of operands
     * @returns {MKSpec}
     */
    getSpecs() {
        return {
            name: "`Collect`",
            operandNDims: [0]
        };
    }
    /**
     * @param  {TensorView} out 
     * @param  {...TensorView} operands 
     */
    invoke(out, ...operands) {
        out.tensor.raw[out.indicesToIndex([])] = operands[0].at();
    }
    /**
     * 
     * @param {...number[]} opShapes 
     * @returns {number[] | undefined}
     */
    computeShape(...opShapes) { return []; }
}

class CollectKernel1D extends BaseMicroKernel {
    /**
     * @typedef {Object} MKSpec
     * @property {string} name - name of micro kernel
     * @property {number[]} operandNDims - #dims of operands
     * @returns {MKSpec}
     */
    getSpecs() {
        return {
            name: "`Collect`",
            operandNDims: [1]
        };
    }
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
    /**
     * 
     * @param {...number[]} opShapes 
     * @returns {number[] | undefined}
     */
    computeShape(...opShapes) { return opShapes[0]; }
}

class CollectKernelMultiplex extends MicroKernelMultiplexer {
    get microKernelList() {
        return [new CollectKernel1D(), new CollectKernel0D()];
    }
}

export default CollectKernelMultiplex;
