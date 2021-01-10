import Tensor from './Tensor.js'

test('tensor strides', () => {
    expect(new Tensor([2, 3, 4], Float64Array).strides)
    .toEqual([24, 12, 4, 1]);
    expect(new Tensor([1], Float64Array).strides)
    .toEqual([1, 1]);
});

test('tensor fill and index visit', () => {
    let tens = new Tensor([2, 3, 4], Int32Array).fill(10);
    expect(tens.at(1, 2, 2)).toBe(10);
    expect(tens.at(1, 1, 3)).toBe(10);
    expect(tens.indicesToIndex([1, 2, 4])).toBe(24);
    expect(tens.at(1, 2, 4)).toBeUndefined();

    let small = new Tensor([2], Int32Array).setElement([0], 1).setElement([1], 3);
    expect(small.at(0)).toBe(1);
    expect(small.at(1)).toBe(3);
    
    let odd = new Tensor([31, 17, 5, 7], Int32Array).fill(1).setElement([23, 12, 1, 0], 3);
    expect(odd.at(23, 12, 1, 0)).toBe(3);
    expect(odd.at(1, 2, 3, 5)).toBe(1);
    expect(odd.at(19, 2, 3, 5)).toBe(1);

    expect(() => small.at(0, 1)).toThrowError();
    expect(() => odd.at(2, 3, 3)).toThrowError();
    
    expect(small.view().toTensor()).toEqual(small);
    expect(odd.view().toTensor()).toEqual(odd);
});

test('vargs extension', () => {
    class Foo {
        bar(...args) { return args; }
    }

    class Bar extends Foo {
        bar(a, b) { return super.bar(a, b); }
    }
    expect(new Bar().bar(1, 2)).toEqual([1, 2]);
});

test('0-tensor basics', () => {
    expect(new Tensor([], Int32Array).fill(5).at()).toBe(5);
    expect(new Tensor([], Int32Array).fill(-3).setElement([], 2).at()).toBe(2);
    expect(new Tensor([], Int32Array).fill(42).view().toTensor().at()).toBe(42);
});
