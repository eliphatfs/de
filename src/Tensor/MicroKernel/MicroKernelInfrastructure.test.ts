import Tensor from '../Tensor'
import BaseMicroKernel from './BaseMicroKernel'
import MicroKernelMultiplexer from './MicroKernelMultiplexer'

test('error on direct uses', () => {
    expect(() => new BaseMicroKernel().dispatch()).toThrowError();
    expect(() => new BaseMicroKernel().dispatch(new Tensor([], Uint8Array).view())).toThrowError();
    expect(() => new MicroKernelMultiplexer().dispatch()).toThrowError();
    expect(() => new MicroKernelMultiplexer().invoke(new Tensor([], Uint8Array).view())).toThrowError();
    expect(() => new MicroKernelMultiplexer().checkInputs([])).toThrowError();
    expect(() => new MicroKernelMultiplexer().computeShape()).toThrowError();
});
