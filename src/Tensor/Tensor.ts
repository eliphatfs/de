import TensorView from './TensorView'

export type NativeNumberArray = (
    Uint8Array | Uint16Array | Uint32Array
    | Int8Array | Int16Array | Int32Array
    | Float32Array | Float64Array
    | Uint8ClampedArray
);
export type NativeNumberArrayConstructor = {new(len: number): NativeNumberArray};

class Tensor {
    raw: NativeNumberArray
    arrayType: NativeNumberArrayConstructor
    shape: number[]
    strides: number[]

    constructor(shape: number[], arrayType: NativeNumberArrayConstructor) {
        const nElem = shape.reduce((a, b) => a * b, 1);
        this.raw = new arrayType(nElem);
        this.arrayType = arrayType;
        this.shape = shape;
        
        let strides = [1];
        for (let i = 0; i < shape.length; ++i)
            strides.unshift(strides[0] * shape[shape.length - 1 - i]);
        this.strides = strides;
    }

    at(...indices: number[]) {
        if (indices.length != this.shape.length) throw new TypeError("indices for Tensor.at should have same number of dimensions as shape.");
        return this.raw[this.indicesToIndex(indices)];
    }

    indicesToIndex(indices: number[]) {
        let idx = 0;
        for (let i = 0; i < indices.length; ++i)
            idx += indices[i] * this.strides[i + 1];
        return idx;
    }

    setElement(indices: number[], value: number) {
        if (indices.length != this.shape.length) throw new TypeError("indices for Tensor.setElement should have same number of dimensions as shape.");
        this.raw[this.indicesToIndex(indices)] = value;
        return this;
    }
    
    fill(num: number) { this.raw.fill(num); return this; }

    view() { return new TensorView(this, 0, this.shape); }

    static fromArray(flatArray: number[], shape: number[], arrayType: NativeNumberArrayConstructor) {
        let tensor = new Tensor(shape, arrayType);
        if (flatArray.length !== tensor.raw.length)
            throw new Error("Tensor.fromArray data length not equal array size.");
        const n = flatArray.length;
        let draw = tensor.raw;
        for (let i = 0; i < n; ++i)
            draw[i] = flatArray[i];
        return tensor;
    }
}

export default Tensor;
