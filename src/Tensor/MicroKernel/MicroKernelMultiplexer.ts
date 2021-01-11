import TensorView from '../TensorView'
import BaseMicroKernel from './BaseMicroKernel'

class MicroKernelMultiplexer extends BaseMicroKernel {
    /**
     * 
     * @returns {BaseMicroKernel[]} 
     */
    get microKernelList(): BaseMicroKernel[] { return null; }

    static directUseError() { return new Error("Don't call MicroKernelMultiplexer directly without calling dispatch()!"); }
    checkInputs(operands: TensorView[]): [number[][], number] | Error { throw MicroKernelMultiplexer.directUseError(); }
    invoke(out: TensorView, ...operands: TensorView[]) { throw MicroKernelMultiplexer.directUseError(); }
    computeShape(...opShapes: number[][]): number[] { throw MicroKernelMultiplexer.directUseError(); }

    /**
     * 
     * @param  {...TensorView} operands 
     */
    dispatch(...operands: TensorView[]) {
        let x = null;
        for (let i = 0; i < this.microKernelList.length; ++i) {
            x = this.microKernelList[i].checkInputs(operands);
            if (!(x instanceof Error)) return this.microKernelList[i].dispatch(...operands);
        }
        throw x;
    }
}

export default MicroKernelMultiplexer;
