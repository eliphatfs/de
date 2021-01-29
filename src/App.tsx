import './App.css';
import React from 'react';
import * as MUICore from '@material-ui/core';
import * as MIcons from '@material-ui/icons';
import DynamicImshowTyped from './Render/DynamicImshowTyped';
import SpaceGrid from './FVM/SpaceGrid';

function CanvasApp(props: any) {
    let data = new Float32Array(256 * 256);

    const canvasRef = React.useRef<HTMLCanvasElement>(null);
    React.useEffect(() => {
        const ctx = canvasRef.current?.getContext("2d")!;
        const renderer = new DynamicImshowTyped(ctx, data, 256, 256);
        let grid = new SpaceGrid(256, 4, 340);
        tick();
        
        function tick() {
            grid.evolve(0.4 * 4 / 256 / 340);
            data.set(grid.u0.toTensor().raw);
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
