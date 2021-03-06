import Tensor from './Tensor'
import TensorView from './TensorView'

test('tensor strides', () => {
    expect(new Tensor([2, 3, 4], Float64Array).strides)
    .toEqual([24, 12, 4, 1]);
    expect(new Tensor([1], Float64Array).strides)
    .toEqual([1, 1]);

    expect(() => new TensorView(new Tensor([5, 4], Float32Array), 0, [5]))
    .toThrowError();
});

test('tensor fill and index visit', () => {
    let tens = new Tensor([2, 3, 4], Int32Array).fill(10);
    expect(tens.at(1, 2, 2)).toBe(10);
    expect(tens.at(1, 1, 3)).toBe(10);
    expect(tens.indicesToIndex([1, 2, 4])).toBe(24);
    expect(tens.at(1, 2, 4)).toBeUndefined();

    let small = new Tensor([2], Int32Array).setElement([0], 1).setElement([1], 3);
    expect(() => small.setElement([], 1)).toThrowError();
    expect(small.at(0)).toBe(1);
    expect(small.at(1)).toBe(3);
    expect(small.view().at(1)).toBe(3);
    expect(small.view().setElement([1], 4).at(1)).toBe(4);
    
    let odd = new Tensor([31, 17, 5, 7], Int32Array).fill(1).setElement([23, 12, 1, 0], 3);
    expect(odd.at(23, 12, 1, 0)).toBe(3);
    expect(odd.at(1, 2, 3, 5)).toBe(1);
    expect(odd.at(19, 2, 3, 5)).toBe(1);

    expect(() => small.at(0, 1)).toThrowError();
    expect(() => odd.at(2, 3, 3)).toThrowError();
    
    expect(small.view().toTensor()).toEqual(small);
    expect(odd.view().toTensor()).toEqual(odd);

    let fromData = Tensor.fromArray([1, 2, 3, 4], [2, 2], Uint16Array);
    expect(fromData.raw).toEqual(new Uint16Array([1, 2, 3, 4]));
    expect(fromData.view().at(0, 1)).toBe(2);
    expect(() => fromData.view().at(0, 1, 2)).toThrowError();
    expect(() => Tensor.fromArray([1, 2, 3, 4], [2, 3], Uint16Array)).toThrowError();
});

test('0-tensor basics', () => {
    expect(new Tensor([], Int32Array).fill(5).at()).toBe(5);
    expect(new Tensor([], Int32Array).fill(-3).setElement([], 2).at()).toBe(2);
    expect(new Tensor([], Int32Array).fill(42).view().toTensor().at()).toBe(42);
});

test('shape operations', () => {
    expect(
        Tensor.fromArray([1, 2, 3, 4, 5, 6], [3, 2], Uint8Array)
        .view().permute(1, 0).toTensor()
    ).toEqual(
        Tensor.fromArray([1, 3, 5, 2, 4, 6], [2, 3], Uint8Array)
    );

    expect(() => new Tensor([2, 4], Float32Array).view().permute(2, 1, 0))
    .toThrowError();
    
    expect(
        Tensor.fromArray([0, 1, 2, 3, 4, 5, 6, 7], [2, 2, 2], Uint8Array)
        .view().permute(2, 1, 0).toTensor()
    ).toEqual(
        Tensor.fromArray([0, 4, 2, 6, 1, 5, 3, 7], [2, 2, 2], Uint8Array)
    );
    
    expect(
        Tensor.fromArray([0, 1, 2, 3, 4, 5, 6, 7], [2, 2, 2], Uint8Array)
        .view().permute(1, 0, 2).toTensor()
    ).toEqual(
        Tensor.fromArray([0, 1, 4, 5, 2, 3, 6, 7], [2, 2, 2], Uint8Array)
    );
    
    expect(
        Tensor.fromArray([0, 1, 2, 3, 4, 5, 6, 7], [2, 2, 2], Uint8Array)
        .view().permute(1, 2, 0).toTensor()
    ).toEqual(
        Tensor.fromArray([0, 4, 1, 5, 2, 6, 3, 7], [2, 2, 2], Uint8Array)
    );
});

test('convolution 1d', () => {
    expect(
        Tensor.fromArray([1, 2, 3], [3], Int32Array).view()
        .conv1d(Tensor.fromArray([1, 2], [2], Int32Array).view(), 0)
        .toTensor()
    ).toEqual(
        Tensor.fromArray([5, 8], [2], Int32Array)
    );

    expect(
        Tensor.fromArray([1, 2, 3, 4, 5, 6], [2, 3], Int32Array).view()
        .conv1d(Tensor.fromArray([1, 2], [2], Int32Array).view(), 1)
        .toTensor()
    ).toEqual(
        Tensor.fromArray([5, 8, 14, 17], [2, 2], Int32Array)
    );

    expect(
        Tensor.fromArray([1, 2, 3, 4, 5, 6], [2, 3], Int32Array).view()
        .conv1d(Tensor.fromArray([1, 2], [2], Int32Array).view(), 0)
        .toTensor()
    ).toEqual(
        Tensor.fromArray([9, 12, 15], [1, 3], Int32Array)
    );

    expect(() =>
        Tensor.fromArray([1, 2, 3, 4, 5, 6], [2, 3], Int32Array).view()
        .conv1d(Tensor.fromArray([1, 2, 3, 4], [4], Int32Array).view(), 0)
    ).toThrowError();

    expect(() =>
        Tensor.fromArray([1, 2, 3, 4, 5, 6], [2, 3], Int32Array).view()
        .conv1d(Tensor.fromArray([1, 2, 3, 4, 5, 6, 7, 8], [4, 2], Int32Array).view(), 0)
    ).toThrowError();
});

test('squeeze, unsqueeze and broadcast', () => {
    expect(
        Tensor.fromArray([1, 2, 3], [3], Int32Array).view()
        .unsqueeze(0).toTensor()
    )
    .toEqual(
        Tensor.fromArray([1, 2, 3], [1, 3], Int32Array)
    );

    expect(
        Tensor.fromArray([1, 2, 3], [1, 3], Int32Array).view()
        .unsqueeze(2).squeeze(0).squeeze(1).toTensor()
    )
    .toEqual(
        Tensor.fromArray([1, 2, 3], [3], Int32Array)
    );

    expect(
        Tensor.fromArray([1, 2, 3], [1, 3], Int32Array).view()
        .unsqueeze(2).broadcast(0, 2).broadcast(2, 2).toTensor()
    )
    .toEqual(
        Tensor.fromArray([1, 1, 2, 2, 3, 3, 1, 1, 2, 2, 3, 3], [2, 3, 2], Int32Array)
    );

    expect(() => Tensor.fromArray([1, 2, 3], [3], Int32Array).view().squeeze(0)).toThrowError();
    expect(() => Tensor.fromArray([1, 2, 3], [3, 1], Int32Array).view().unsqueeze(3)).toThrowError();
    expect(() => Tensor.fromArray([1, 2, 3], [1, 3], Int32Array).view().broadcast(1, 5)).toThrowError();
});

test('element-wise +-*/ and pad', () => {
    let c = Tensor.fromArray([1, 2, 3], [3], Int32Array).view();
    expect(
        c.mul(c).toTensor()
    )
    .toEqual(
        Tensor.fromArray([1, 4, 9], [3], Int32Array)
    );

    expect(
        c.add(c).toTensor()
    )
    .toEqual(
        Tensor.fromArray([2, 4, 6], [3], Int32Array)
    );

    expect(
        c.sub(c).toTensor()
    )
    .toEqual(
        Tensor.fromArray([0, 0, 0], [3], Int32Array)
    );
    
    expect(
        c.div(c).toTensor()
    )
    .toEqual(
        Tensor.fromArray([1, 1, 1], [3], Int32Array)
    );

    expect(
        c.add(c.scalarLike(2)).toTensor()
    )
    .toEqual(
        Tensor.fromArray([3, 4, 5], [3], Int32Array)
    )

    expect(
        c.scl(20).toTensor()
    )
    .toEqual(
        Tensor.fromArray([20, 40, 60], [3], Int32Array)
    )

    expect(
        c.pad(2, 1, 0, -1).toTensor()
    )
    .toEqual(
        Tensor.fromArray([-1, -1, 1, 2, 3, -1], [6], Int32Array)
    )
});
