import './App.css';
import React from 'react';
import DynamicImshow from './Render/DynamicImshow';
import * as MUICore from '@material-ui/core';
import * as MIcons from '@material-ui/icons';

function CanvasApp(props: any) {
    let data: number[][]= new Array<number[]>(256).fill([]).map((_) => new Array<number>(256).fill(0));
    let t: number = 0;

    const canvasRef: React.MutableRefObject<HTMLCanvasElement | null> = React.useRef(null);
    React.useEffect(() => {
        const ctx = canvasRef.current?.getContext("2d")!;
        const renderer = new DynamicImshow(ctx, data);
        tick();
        
        function tick() {
            for (let i = 0; i < 256; i++)
                for (let j = 0; j < 256; j++) {
                    let d = Math.sqrt((i - 20) * (i - 20) + (j - 20) * (j - 20));
                    let d2 = Math.sqrt((i - 40) * (i - 40) + (j - 20) * (j - 20));
                    let tx = t - d * 2;
                    let tx2 = t - d2 * 2;
                    data[i][j] = tx < 0 ? 0 : Math.sin(tx * 0.24) / Math.sqrt(d + 1)
                    data[i][j] += tx2 < 0 ? 0 : Math.sin(tx2 * 0.24) / Math.sqrt(d2 + 1);  // (t < 10) ? -100 : (20 * Math.log10(1 / Math.sqrt(d + 1)));
                }
            t++;
            renderer.render(ctx);
            requestAnimationFrame(tick);
        }
    });
    return <canvas ref={canvasRef} width="256" height="256"></canvas>;
}

class App extends React.Component {
    render() {
        return <div style={{display: 'flex', justifyContent: 'center'}}>
            <MUICore.ButtonGroup orientation="vertical" variant="text" color="primary">
                <MUICore.IconButton><MIcons.WifiTethering /></MUICore.IconButton>
                <MUICore.IconButton><MIcons.DeleteOutlined /></MUICore.IconButton>
            </MUICore.ButtonGroup>
            <CanvasApp />
        </div>;
    }
}

export default App;
