import Tensor from './Tensor'
import CollectKernelMultiplex from "./MicroKernel/CollectKernels"
import Conv1DKernel from "./MicroKernel/Conv1DKernel"
import Util from '../Util'

class TensorView {
    tensor: Tensor
    offset: number
    shape: number[]
    strides: number[]
    contiguous: boolean

    constructor(tensor: Tensor, offset: number, shape: number[], strides?: number[], contiguous?: boolean) {
        this.tensor = tensor;
        this.offset = offset;
        this.shape = shape;
        if (strides === undefined) this.strides = this.tensor.strides;
        else this.strides = strides;
        if (this.strides.length !== this.shape.length + 1) throw new Error("Strides and shape for TensorView does not match. (strides len should be shape len + 1)");
        this.contiguous = contiguous ?? false;
    }

    toTensor() {
        if (this.contiguous) {
            let newTensor = new Tensor(this.shape, this.tensor.arrayType);
            newTensor.raw.set(this.tensor.raw);
            return newTensor;
        }
        else return new CollectKernelMultiplex().dispatch(this).tensor;
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

    setElement(indices: number[], value: number) {
        if (indices.length != this.shape.length) throw new TypeError("indices for TensorView.setElement should have same number of dimensions as shape.");
        this.tensor.raw[this.indicesToIndex(indices)] = value;
        return this;
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

    pad(sizeBefore: number, sizeAfter: number, axis: number, pad: number = 0) {
        const perm = Util.swapToPermutation(this.shape.length, 0, axis);
        let exchanged = this.permute(...perm).toTensor();
        let elements = exchanged.strides[1];
        let newTensor = new Tensor([sizeBefore + exchanged.shape[0] + sizeAfter].concat(exchanged.shape.slice(1)), exchanged.arrayType);
        newTensor.raw.fill(pad);
        newTensor.raw.set(exchanged.raw, sizeBefore * elements);
        return newTensor.view().permute(...perm);
    }

    add(other: TensorView) {
        if (!Util.arrayEqual(other.shape, this.shape))
            throw new Error("Shape mismatch for `add`: " + this.shape + " + " + other.shape);
        const tensor = this.toTensor();
        const r1 = tensor.raw, n = tensor.raw.length, r2 = other.toTensor().raw;
        for (let i = 0; i < n; ++i) r1[i] += r2[i];
        return tensor.view();
    }

    mul(other: TensorView) {
        if (!Util.arrayEqual(other.shape, this.shape))
            throw new Error("Shape mismatch for `mul`: " + this.shape + " + " + other.shape);
        const tensor = this.toTensor();
        const r1 = tensor.raw, n = tensor.raw.length, r2 = other.toTensor().raw;
        for (let i = 0; i < n; ++i) r1[i] *= r2[i];
        return tensor.view();
    }

    scl(scalar: number) {
        const tensor = this.toTensor();
        const r = tensor.raw, n = tensor.raw.length;
        for (let i = 0; i < n; ++i) r[i] *= scalar;
        return tensor.view();
    }

    sub(other: TensorView) {
        if (!Util.arrayEqual(other.shape, this.shape))
            throw new Error("Shape mismatch for `sub`: " + this.shape + " + " + other.shape);
        const tensor = this.toTensor();
        const r1 = tensor.raw, n = tensor.raw.length, r2 = other.toTensor().raw;
        for (let i = 0; i < n; ++i) r1[i] -= r2[i];
        return tensor.view();
    }

    div(other: TensorView) {
        if (!Util.arrayEqual(other.shape, this.shape))
            throw new Error("Shape mismatch for `div`: " + this.shape + " + " + other.shape);
        const tensor = this.toTensor();
        const r1 = tensor.raw, n = tensor.raw.length, r2 = other.toTensor().raw;
        for (let i = 0; i < n; ++i) r1[i] /= r2[i];
        return tensor.view();
    }

    squeeze(axis: number) {
        if (this.shape[axis] !== 1)
            throw new Error(`Only size-1 axes can be squeezed! axis: ${axis} shape: ${this.shape}`);
        let newshape = [...this.shape];
        let newstrides = [...this.strides];
        newstrides.splice(axis + 1, 1);
        newshape.splice(axis, 1);
        return new TensorView(this.tensor, this.offset, newshape, newstrides);
    }

    unsqueeze(axis: number) {
        if (axis < 0 || axis > this.shape.length)
            throw new Error(`Axis should be >= 0 and <= ndims! got: ${axis} ndims: ${this.shape.length}`);
        let newshape = [...this.shape];
        let newstrides = [...this.strides];
        newstrides.splice(axis + 1, 0, 0);
        newshape.splice(axis, 0, 1);
        return new TensorView(this.tensor, this.offset, newshape, newstrides);
    }

    broadcast(axis: number, size: number) {
        if (this.shape[axis] !== 1)
            throw new Error(`Only size-1 axes can be broadcast! axis: ${axis} shape: ${this.shape}`);
        let newshape = [...this.shape];
        let newstrides = [...this.strides];
        newstrides.splice(axis + 1, 1, 0);
        newshape.splice(axis, 1, size);
        return new TensorView(this.tensor, this.offset, newshape, newstrides);
    }

    scalarLike(scalar: number) {
        return new TensorView(
            new Tensor([], this.tensor.arrayType).fill(scalar),
            0,
            this.shape,
            [1].concat(new Array(this.shape.length).fill(0))
        );
    }
}

export default TensorView;
