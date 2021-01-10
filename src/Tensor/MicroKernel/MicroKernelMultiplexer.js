import BaseMicroKernel from './BaseMicroKernel.js'

class MicroKernelMultiplexer extends BaseMicroKernel {
    /**
     * 
     * @returns {BaseMicroKernel[]} 
     */
    get microKernelList() { return null; }

    static directUseError() { return new Error("Don't call MicroKernelMultiplexer directly without calling dispatch()!"); }
    checkInputs(operands) { throw directUseError(); }
    invoke(out, ...operands) { throw directUseError(); }
    computeShape(...opShapes) { throw directUseError(); }

    /**
     * 
     * @param  {...TensorView} operands 
     */
    dispatch(...operands) {
        let x = null;
        for (let i = 0; i < this.microKernelList.length; ++i) {
            x = this.microKernelList[i].checkInputs(operands);
            if (!(x instanceof Error)) return this.microKernelList[i].dispatch(...operands);
        }
        throw x;
    }
}

export default MicroKernelMultiplexer;
