import _ from "lodash"

class DynamicImshow {
    data: number[][]
    imageData: ImageData
    palette: number[][]
    lut: number[][]

    constructor(ctx: CanvasRenderingContext2D, data: number[][]) {
        this.data = data;
        this.imageData = ctx.createImageData(data[0].length, data.length);
        this.imageData.data.fill(255);
        let palette = ['#101010', '#102d5d', '#284e85', '#4e7ab7', '#7ec4e7', '#e4edfc', '#ffffff']//['#000000', '#ffffff']// ['#4ca1af', '#c4e0e5'];
        this.palette = palette.map((x) => Number(x.replace('#', "0x"))).map((x) => [x >> 16, (x % 65536) >> 8, x % 256]);
        this.lut = this.genPaletteLUT();
    }

    genPaletteLUT() {
        const palette = this.palette;
        return _.range(0.0, 1.0, 1.0 / 1024.0)
        .map((v) => {
            const unif = v * (palette.length - 1);
            const C1 = palette[Math.floor(unif)];
            const C2 = palette[Math.ceil(unif)];
            const K2 = unif - Math.floor(unif);
            const K1 = 1 - K2;
            return [
                C1[0] * K1 + C2[0] * K2,
                C1[1] * K1 + C2[1] * K2,
                C1[2] * K1 + C2[2] * K2
            ];
        })
    }

    render(ctx: CanvasRenderingContext2D) {
        const min = -1; // _.min(this.data.map((x) => _.min(x)));
        let max = 1; // _.max(this.data.map((x) => _.max(x)));
        if (min === undefined || max === undefined) throw Error("Unreachable!");
        if (min === max) max = min + 1;
        let idx = 0;
        for (let i = 0; i < this.data.length; ++i)
            for (let j = 0; j < this.data[0].length; ++j) {
                // 0.76110584, 0.89771305, 0.84543495
                // 0.19219589, 0.11144875, 0.23278346
                const norm = Math.floor((this.data[i][j] - min) / (max - min) * this.lut.length);
                const color = this.lut[norm >= 0 ? norm < this.lut.length ? norm : this.lut.length - 1 : 0];
                for (let c = 0; c < 3; ++c)
                    this.imageData.data[idx + c] = color[c];
                idx += 4;
            }
        ctx.putImageData(this.imageData, 0, 0);
    }
}

export default DynamicImshow;
