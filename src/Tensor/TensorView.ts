import Tensor from './Tensor'
import CollectKernelMultiplex from "./MicroKernel/CollectKernels"
import Conv1DKernel from "./MicroKernel/Conv1DKernel"
import Util from '../Util'

class TensorView {
    tensor: Tensor
    offset: number
    shape: number[]
    strides: number[]

    constructor(tensor: Tensor, offset: number, shape: number[], strides?: number[]) {
        this.tensor = tensor;
        this.offset = offset;
        this.shape = shape;
        if (strides === undefined) this.strides = this.tensor.strides;
        else this.strides = strides;
        if (this.strides.length !== this.shape.length + 1) throw new Error("Strides and shape for TensorView does not match. (strides len should be shape len + 1)");
    }

    toTensor() {
        return new CollectKernelMultiplex().dispatch(this).tensor;
    }

    indicesToIndex(indices: number[]) {
        let idx = this.offset;
        for (let i = 0; i < indices.length; ++i)
            idx += indices[i] * this.strides[i + 1];
        return idx;
    }

    at(...indices: number[]) {
        if (indices.length != this.shape.length) throw new TypeError("indices for TensorView.at should have same number of dimensions as shape.");
        return this.tensor.raw[this.indicesToIndex(indices)];
    }

    permute(...axes: number[]) {
        if (axes.length !== this.shape.length) throw new Error("Requires " + this.shape.length + " for permute of TensorView, got " + axes.length);
        let newShape = [];
        let newStrides = [this.strides[0]];
        for (let i = 0; i < axes.length; ++i) {
            newShape.push(this.shape[axes[i]]);
            newStrides.push(this.strides[axes[i] + 1]);
        }
        return new TensorView(this.tensor, this.offset, newShape, newStrides);
    }

    conv1d(kernel: TensorView, convAxis: number) {
        let sigNDims = this.shape.length;
        let perm = Util.swapToPermutation(sigNDims, convAxis, sigNDims - 1);
        let exchanged = this.permute(...perm);
        let kernelBatchStrides = new Array(sigNDims - kernel.shape.length).fill(0);
        let batchedKernel = new TensorView(
            kernel.tensor,
            kernel.offset,
            exchanged.shape.slice(0, sigNDims - kernel.shape.length).concat(kernel.shape),
            kernel.strides.slice(0, 1).concat(kernelBatchStrides).concat(kernel.strides.slice(1))
        );
        return new Conv1DKernel().dispatch(exchanged, batchedKernel).permute(...perm);
    }
}

export default TensorView;
