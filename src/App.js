import './App.css';
import React from 'react';
import * as PIXI from 'pixi.js';
/*import logo from './logo.svg';
<img src={logo} className="App-logo" alt="logo" />*/
// Image use example
// Get the texture for rope.

class App extends React.Component {
  constructor(props) {
    super(props);
    this.main = new PIXI.Application({width: 800, height: 480, backgroundColor: 0x1099bb});
    // const app = this.main;
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

export default App;
