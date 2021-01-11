import BaseMicroKernel, { MKSpec } from './BaseMicroKernel'
import TensorView from '../TensorView'

class Conv1DKernel extends BaseMicroKernel {
    /**
     * @typedef {Object} MKSpec
     * @property {string} name - name of micro kernel
     * @property {number[]} operandNDims - #dims of operands
     * @returns {MKSpec}
     */
    getSpecs(): MKSpec {
        return {
            name: "`1D Convolution`",
            operandNDims: [1, 1]
        };
    }
    
    invoke(out: TensorView, ...operands: TensorView[]) {
        const signal = operands[0];
        const kernel = operands[1];
        const L = out.shape[0];
        const m = kernel.shape[0];
        const propdec = (view: TensorView) => ({o: view.offset, s: view.strides[1], r: view.tensor.raw});
        let {o: po, s: so, r: ro} = propdec(out);
        let {o: ps, s: ss, r: rs} = propdec(signal);
        let {o: pk, s: sk, r: rk} = propdec(kernel);
        for (let i = 0; i < L; ++i) {
            ro[po + i * so] = 0;
            for (let j = 0; j < m; ++j)
                ro[po + i * so] += rs[ps + ss * (i + j)] * rk[pk + sk * j];
        }
    }
    
    computeShape(...opShapes: number[][]): number[] { return [opShapes[0][0] - opShapes[1][0] + 1]; }
}

export default Conv1DKernel;
