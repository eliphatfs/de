import Tensor from './Tensor.js';

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
    }

    toTensor() {
        let tensor = new Tensor(shape, this.tensor.arrayType);
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
        if (indices.length != this.shape.length) throw new TypeError("indices for Tensor.at should have same number of dimensions as shape.");
        return this.raw[this.indicesToIndex(indices)];
    }
}

export default TensorView;
