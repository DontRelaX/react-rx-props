import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import calculateFibonacciExternal from './calculateFibonacci';

export default class Fibonacci extends React.Component {
  static propTypes = {
    className: PropTypes.string,
    value: PropTypes.number.isRequired,
    useServerCall: PropTypes.bool.isRequired,
  };

  state = {
    loading: true,
    fibonacci: null,
  };

  componentWillMount() {
    this.calculateFibonacci(this.props.value, this.props.useServerCall, (fibonacci) => {
      this.setState({
        fibonacci: fibonacci,
        loading: false,
      });
    });
  }

  componentWillReceiveProps(nextProps) {
    if(nextProps.value !== this.props.value) {
      this.setState({
        loading: true,
      });
      this.calculateFibonacci(nextProps.value, nextProps.useServerCall, (fibonacci) => {
        this.setState({
          fibonacci: fibonacci,
          loading: false,
        });
      });
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    return this.props.className !== nextProps.className ||
      this.props.value !== nextProps.value ||
      this.state.loading !== nextState.loading ||
      this.state.fibonacci !== nextState.fibonacci;
  }

  componentWillUnmount() {
    this.unmounted = true;
  }

  unmounted = false;
  calculationId = 0;

  calculateFibonacci = (value, useServerCall, cb) => {
    const currentCalculationId = ++this.calculationId;
    calculateFibonacciExternal(value, useServerCall).then(fibonacci => {
      if(currentCalculationId === this.calculationId && !this.unmounted) {
        cb(fibonacci);
      }
    });
  };

  render() {
    return (
      <div className={ classnames(this.props.className, this.state.loading && 'loading') }>
        { this.state.loading ?
          'Loading...' :
          `Fibonacci of ${this.props.value} = ${this.state.fibonacci}`
        }
      </div>
    );
  }
}
