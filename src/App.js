import './App.css';
import React from 'react';
import * as PIXI from 'pixi.js';

class PixiApp extends React.Component {

    constructor(props) {
        super(props);
        this.main = new PIXI.Application({width: 800, height: 480, backgroundColor: 0x1099bb});
    }

    componentDidMount() {
        this.domref.appendChild(this.main.view);
    }

    componentWillUnmount() {
        this.domref.removeChild(this.main.view);
    }

    shouldComponentUpdate() {
        return false;
    }

    render() {
        return <div ref={ (domref) => this.domref = domref }></div>;
    }
}

class App extends React.Component {
    render() {
        return <PixiApp />;
    }
}

export default App;
