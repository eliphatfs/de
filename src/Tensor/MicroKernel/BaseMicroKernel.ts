import TensorView from '../TensorView'
import Util from '../../Util'
import Tensor from '../Tensor'

export type MKSpec = {
    name: string,
    operandNDims: number[]
};

class BaseMicroKernel {
    getSpecs(): MKSpec {
        return {
            name: "`Abstract operation`",
            operandNDims: []
        };
    }
    
    invoke(out: TensorView, ...operands: TensorView[]) { }
    computeShape(...opShapes: number[][]): number[] { throw new Error("BaseMicroKernel should not be called."); return []; }

    checkInputs(operands: TensorView[]): [number[][], number] | Error {
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

    dispatch(...operands: TensorView[]) {
        let checkResult = this.checkInputs(operands);
        if (checkResult instanceof Error) throw checkResult;
        const [batchDims, ndimDeltaVal] = checkResult;
        let resultShape = batchDims[0].concat(
            this.computeShape(...operands.map((op) => op.shape.slice(ndimDeltaVal)))
        );
        if (resultShape.some((x) => x <= 0))
            throw new Error(`Operation ${this.getSpecs().name} results in a negative or zero dimensionality. Operands shape received: ${operands.map((x) => x.shape).join(" & ")}.`)
        let outView = new Tensor(resultShape, operands[0].tensor.arrayType).view();
        this._dispatch(operands, 0, ndimDeltaVal || 0, outView);
        return outView;
    }

    _dispatch(operands: TensorView[], ndim: number, ndimDelta: number, outView: TensorView) {
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
