import Tensor from './Tensor.js';
import CollectKernelMultiplex from "./MicroKernel/CollectKernels.js"

class TensorView {
    /**
     * 
     * @param {Tensor} tensor 
     * @param {number} offset 
     * @param {number[]} shape 
     * @param {number[]=} strides 
     */
    constructor(tensor, offset, shape, strides) {
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

    /**
     * @param {number[]} indices 
     */
    indicesToIndex(indices) {
        let idx = this.offset;
        for (let i = 0; i < indices.length; ++i)
            idx += indices[i] * this.strides[i + 1];
        return idx;
    }

    at(...indices) {
        if (indices.length != this.shape.length) throw new TypeError("indices for TensorView.at should have same number of dimensions as shape.");
        return this.tensor.raw[this.indicesToIndex(indices)];
    }

    /**
     * 
     * @param  {...number} axes 
     */
    permute(...axes) {
        if (axes.length !== this.shape.length) throw new Error("Requires " + this.shape.length + " for permute of TensorView, got " + axes.length);
        let newShape = [];
        let newStrides = [this.strides[0]];
        for (let i = 0; i < axes.length; ++i) {
            newShape.push(this.shape[axes[i]]);
            newStrides.push(this.strides[axes[i] + 1]);
        }
        return new TensorView(this.tensor, this.offset, newShape, newStrides);
    }
}

export default TensorView;
