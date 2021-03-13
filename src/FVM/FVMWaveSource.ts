class FVMWaveSource {
    x: number
    y: number
    strength: number
    freq: number
    constructor(x: number, y: number, strength: number, freq: number) {
        this.x = x;
        this.y = y;
        this.strength = strength;
        this.freq = freq;
    }
}

export default FVMWaveSource;
