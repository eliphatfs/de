import './App.css';
import React from 'react';
import DynamicImshow from './Render/DynamicImshow';

class CanvasApp extends React.Component {

    constructor(props) {
        super(props);
        this.data = new Array(128).fill([]).map((_) => new Array(128).fill(0));
        this.mount = false;
        this.t = 0;
    }

    tick() {
        for (let i = 0; i < 256; i++)
            for (let j = 0; j < 256; j++) {
                let d = Math.sqrt((i - 20) * (i - 20) + (j - 20) * (j - 20));
                let d2 = Math.sqrt((i - 40) * (i - 40) + (j - 20) * (j - 20));
                let t = this.t - d * 2;
                let t2 = this.t - d2 * 2;
                this.data[i][j] = t < 0 ? 0 : Math.sin(t * 0.24) / Math.sqrt(d + 1)
                this.data[i][j] += t2 < 0 ? 0 : Math.sin(t2 * 0.24) / Math.sqrt(d2 + 1);  // (t < 10) ? -100 : (20 * Math.log10(1 / Math.sqrt(d + 1)));
            }
        this.t++;
        this.renderer.render(this.ctx);
        requestAnimationFrame(() => this.tick());
    }

    componentDidMount() {
        this.renderer = new DynamicImshow(this.ctx, this.data);
        this.tick();
    }

    shouldComponentUpdate() {
        return false;
    }

    render() {
        return <canvas ref={ (canvas) => { this.canvas = canvas; this.ctx = canvas.getContext("2d"); } } width="256" height="256"></canvas>;
    }
}

class App extends React.Component {
    render() {
        return <div style={{display: 'flex', justifyContent: 'center'}}>
            <CanvasApp />
        </div>;
    }
}

export default App;
