import TensorView from './TensorView.js'

class Tensor {
    /**
     * @param {number[]} shape 
     * @param {Function} arrayType 
     */
    constructor(shape, arrayType) {
        const nElem = shape.reduce((a, b) => a * b, 1);
        this.arrayType = arrayType;
        this.raw = new arrayType(nElem);
        this.shape = shape;
        let strides = [1];
        for (let i = 0; i < shape.length; ++i)
            strides.unshift(strides[0] * shape[shape.length - 1 - i]);
        this.strides = strides;
    }

    /**
     * @param  {...number} indices 
     */
    at(...indices) {
        if (indices.length != this.shape.length) throw new TypeError("indices for Tensor.at should have same number of dimensions as shape.");
        return this.raw[this.indicesToIndex(indices)];
    }

    /**
     * @param {number[]} indices 
     */
    indicesToIndex(indices) {
        let idx = 0;
        for (let i = 0; i < indices.length; ++i)
            idx += indices[i] * this.strides[i + 1];
        return idx;
    }

    /**
     * @param {number[]} indices 
     * @param {number} value 
     */
    setElement(indices, value) {
        if (indices.length != this.shape.length) throw new TypeError("indices for Tensor.setElement should have same number of dimensions as shape.");
        this.raw[this.indicesToIndex(indices)] = value;
        return this;
    }

    /**
     * 
     * @param {number} num 
     */
    fill(num) { this.raw.fill(num); return this; }

    view() { return new TensorView(this, 0, this.shape, this.strides); }
}

export default Tensor;
