import TensorView from '../TensorView.js'
import Util from '../../Util.js'
import Tensor from '../Tensor.js';

class BaseMicroKernel {
    /**
     * @typedef {Object} MKSpec
     * @property {string} name - name of micro kernel
     * @property {number[]} operandNDims - #dims of operands
     * @returns {MKSpec}
     */
    getSpecs() {
        return {
            name: "`Abstract operation`",
            operandNDims: []
        };
    }
    /**
     * @param  {TensorView} out 
     * @param  {...TensorView} operands 
     */
    invoke(out, ...operands) { }
    /**
     * 
     * @param {...number[]} opShapes 
     * @returns {number[]}
     */
    computeShape(...opShapes) { return null; }

    /**
     * 
     * @param {TensorView[]} operands 
     */
    checkInputs(operands) {
        let spec = this.getSpecs();
        if (spec.operandNDims.length !== operands.length)
            return new Error("The operation " + spec.name + " requires "
                             + spec.operandNDims.length + " operands, got "
                             + operands.length);
        if (operands.length === 0)
            return new Error("Ill-defined kernel with 0 arguments: " + spec.name);
        let collectedNDims = operands.map((op) => op.shape.length);
        let ndimDelta = spec.operandNDims.map((x, i) => collectedNDims[i] - x);
        if (ndimDelta.some((x) => x < 0))
            return new Error("#dims of operands for " + spec.name + " does not suffice: got "
                             + collectedNDims + ", requires at least" + spec.operandNDims);
        if (ndimDelta.some((x) => x !== ndimDelta[0]))
            return new Error("#dims of operands for " + spec.name + " does not match: got "
                             + collectedNDims + ", requires" + spec.operandNDims
                             + " with possible extra and same"
                             + " batch dimensions before each operand.");
        let batchDims = operands.map((op) => op.shape.slice(0, ndimDelta[0]));
        if (batchDims.some((x) => !Util.arrayEqual(x, batchDims[0])))
            return new Error("Operands for " + spec.name + " differ in batch dimensions: got "
                             + batchDims.join(" & ") + ".");
        return [batchDims, ndimDelta[0]];
    }

    /**
     * 
     * @param  {...TensorView} operands 
     */
    dispatch(...operands) {
        let checkResult = this.checkInputs(operands);
        if (checkResult instanceof Error) throw checkResult;
        const [batchDims, ndimDeltaVal] = checkResult;
        let resultShape = batchDims[0].concat(
            this.computeShape(...operands.map((op) => op.shape.slice(ndimDeltaVal)))
        );
        let outView = new Tensor(resultShape, operands[0].tensor.arrayType).view();
        this._dispatch(operands, 0, ndimDeltaVal || 0, outView);
        return outView;
    }

    /**
     * 
     * @param {TensorView[]} operands 
     * @param {number} ndim 
     * @param {number} ndimDelta 
     * @param {TensorView} outView 
     */
    _dispatch(operands, ndim, ndimDelta, outView) {
        if (ndim === ndimDelta) return this.invoke(outView, ...operands);
        for (let i = 0; i < outView.shape[0]; ++i) {
            let subView = new TensorView (
                outView.tensor,
                outView.offset + i * outView.strides[1],
                outView.shape.slice(1),
                outView.strides.slice(1)
            );
            let suboperands = operands.map((x) => new TensorView(
                x.tensor,
                x.offset + i * x.strides[1],
                x.shape.slice(1),
                x.strides.slice(1)
            ));
            this._dispatch(suboperands, ndim + 1, ndimDelta, subView);
        }
    }
}

export default BaseMicroKernel;
