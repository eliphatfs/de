class Util {
    static arrayEqual(array1: number[] | string[], array2: number[] | string[]) {
        const n = array1.length;
        if (n !== array2.length) return false;
        for (let i = 0; i < n; ++i)
            if (array1[i] !== array2[i]) return false;
        return true;
    }

    static swapToPermutation(n: number, axis1: number, axis2: number) {
        let perm = [];
        for (let i = 0; i < n; ++i) perm.push(i);
        perm[axis1] = axis2; perm[axis2] = axis1;
        return perm;
    }

    static range(start: number, end: number, step: number = 1) {
        let arr = [];
        for (let i = start; i < end; i += step) arr.push(i);
        return arr;
    }
}

export default Util;
