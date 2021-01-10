import BaseMicroKernel from './BaseMicroKernel.js'

class MicroKernelMultiplexer extends BaseMicroKernel {
    /**
     * 
     * @param {BaseMicroKernel[]} microKernelList 
     */
    constructor(microKernelList) {
        this.microKernelList = microKernelList;
        if (microKernelList.length === 0)
            throw new Error("MicroKernelMultiplexer receives no kernels to multiplex.");
    }

    static directUseError() { return new Error("Don't call MicroKernelMultiplexer directly without calling dispatch()!"); }
    checkInputs(operands) {
        let x = null;
        for (let i = 0; i < this.microKernelList.length; ++i) {
            x = this.microKernelList[i].checkInputs(operands);
            if (x === null) break;
        }
        return x;
    }
    invoke(out, ...operands) { throw directUseError(); }
    computeShape(...opShapes) { throw directUseError(); }

    /**
     * 
     * @param  {...TensorView} operands 
     */
    dispatch(...operands) {
        let x = null;
        for (let i = 0; i < this.microKernelList.length; ++i) {
            x = this.microKernelList[i].checkInputs(i);
            if (x === null) return this.microKernelList[i].dispatch(...operands);
        }
        throw x;
    }
}

export default MicroKernelMultiplexer;
