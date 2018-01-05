import React, { Component } from 'react';
import './App.css';
import FibonacciBasic from './FibonacciBasic';
import FibonacciReactRxProps from './FibonacciReactRxProps';



class App extends Component {
  state = {
    value: 5,
    useServerCall: false
  };

  setValue = (e) => {
    this.setState({
      value: parseInt(e.target.value, 10)
    });
  };

  setUseServerCall = (e) => {
    this.setState({
      useServerCall: e.target.checked
    });
  };

  render() {
    return (
      <div className="App">
        <div className="pair">
          <div className="label">value: </div>
          <input className="data" type="number" value={ this.state.value } onChange={ this.setValue }/>
        </div>
        <div className="pair">
          <div className="label">useServerCall: </div>
          <div className="data">
            <input type="checkbox" value={ this.state.useServerCall } onChange={ this.setUseServerCall }/>
          </div>
        </div>
        <div className="separator"/>
        <div className="pair">
          <div className="label">Basic: </div>
          <FibonacciBasic className="data fibonacci" value={ this.state.value } useServerCall={ this.state.useServerCall }/>
        </div>
        <div className="pair">
          <div className="label">ReactRxProps: </div>
          <FibonacciReactRxProps className="data fibonacci" value={ this.state.value } useServerCall={ this.state.useServerCall }/>
        </div>
      </div>
    );
  }
}

export default App;
