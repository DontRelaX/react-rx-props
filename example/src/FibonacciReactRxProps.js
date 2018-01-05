import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import { reactRxProps } from 'react-rx-props';
import { Observable } from 'rxjs';
import calculateFibonacciExternal from './calculateFibonacci';

const calculateFibonacci = (...args) => Observable.fromPromise(calculateFibonacciExternal(...args));

class FibonacciReactRxProps extends React.Component {
  static propTypes = {
    className: PropTypes.string,
    value$: PropTypes.instanceOf(Observable).isRequired,
    useServerCall$: PropTypes.instanceOf(Observable).isRequired,
    exist$: PropTypes.instanceOf(Observable).isRequired,
  };

  state = {
    loading: true,
    fibonacci: null,
  };

  componentWillMount() {
    this.props.useServerCall$.subscribe(useServerCall => {
      this.useServerCall = useServerCall;
    });

    this.props.value$.switchMap(value => {
      this.value = value;
      this.setState({
        loading: true,
      });
      return calculateFibonacci(value, this.useServerCall)
        .takeUntil(this.props.exist$);
    }).subscribe(fibonacci => {
      this.setState({
        loading: false,
        fibonacci: fibonacci,
      });
    });
  }

  render() {
    return (
      <div className={ classnames(this.props.className, this.state.loading && 'loading') }>
        { this.state.loading ?
          'Loading...' :
          `Fibonacci of ${this.value} = ${this.state.fibonacci}`
        }
      </div>
    );
  }
}

export default reactRxProps({
  propTypes: {
    className: PropTypes.string,
    value: PropTypes.number.isRequired,
    useServerCall: PropTypes.bool.isRequired,
  },
})(FibonacciReactRxProps);
