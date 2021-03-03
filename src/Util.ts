class Util {
    static relativePosition(clientPos: [number, number], elem: HTMLElement): [number, number] {
        const [x, y] = clientPos;
        return [
            x - elem.getBoundingClientRect().left,
            y - elem.getBoundingClientRect().top
        ];
    }
    static pivot(clientPos: [number, number], elem: HTMLElement, pivot: [number, number] = [0.5, 0.5]): [number, number] {
        const [x, y] = clientPos;
        return [
            x - elem.getBoundingClientRect().width * pivot[0],
            y - elem.getBoundingClientRect().height * pivot[1]
        ];
    }
    static cooToPivot([x, y]: [number, number], elem: HTMLElement): [number, number] {
        return [
            x / elem.getBoundingClientRect().width,
            y / elem.getBoundingClientRect().height
        ];
    }
    static setXYAttributes([x, y]: [number, number], elem: HTMLElement) {
        elem.setAttribute("x", x.toString());
        elem.setAttribute("y", y.toString());
    }
    static setOpacityAttribute(op: number, elem: HTMLElement) {
        elem.setAttribute("opacity", op.toString());
    }
    static arrayEqual(array1: number[] | string[], array2: number[] | string[]) {
        const n = array1.length;
        if (n !== array2.length) return false;
        for (let i = 0; i < n; ++i)
            if (array1[i] !== array2[i]) return false;
        return true;
    }

    static fixNumericString(current: string, defaultVal: number = 0) {
        if (!isNaN(current as any)) return current;
        if (!isNaN(parseFloat(current))) return parseFloat(current).toString();
        return defaultVal.toString();
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
