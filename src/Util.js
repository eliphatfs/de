class Util {
    /**
     * 
     * @param {number[] | string[]} array1 
     * @param {number[] | string[]} array2 
     */
    static arrayEqual(array1, array2) {
        const n = array1.length;
        if (n !== array2.length) return false;
        for (let i = 0; i < n; ++i)
            if (array1[i] !== array2[i]) return false;
        return true;
    }

    static swapToPermutation(n, axis1, axis2) {
        let perm = [];
        for (let i = 0; i < n; ++i) perm.push(i);
        perm[axis1] = axis2; perm[axis2] = axis1;
        return perm;
    }
}

export default Util;
