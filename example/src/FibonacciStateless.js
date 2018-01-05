import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import { reactRxProps, reactRxPropsConnect } from 'react-rx-props';
import { compose } from 'recompose';
import { Observable } from 'rxjs';
import calculateFibonacciExternal from './calculate-fibonacci';

const calculateFibonacci = (...args) => Observable.fromPromise(calculateFibonacciExternal(...args));

class FibonacciReactRxProps extends React.Component {
  static propTypes = {
    className: PropTypes.string,
    value: PropTypes.number,
    fibonacci: PropTypes.number,
  };

  render() {
    return (
      <div className={ classnames(this.props.className, this.props.loading && 'loading') }>
        { this.props.loading ?
          'Loading...' :
          `Fibonacci of ${this.props.value} = ${this.props.fibonacci}`
        }
      </div>
    );
  }
}

export default compose(
  reactRxProps({
    propTypes: {
      className: PropTypes.string,
      value: PropTypes.number.isRequired,
      useServerCall: PropTypes.bool.isRequired,
    },
  }),
  reactRxPropsConnect({
    propTypes: {
      className: PropTypes.string,
      value$: PropTypes.instanceOf(Observable).isRequired,
      useServerCall$: PropTypes.instanceOf(Observable).isRequired,
      exist$: PropTypes.instanceOf(Observable).isRequired,
    },
    connect: (props, render) => {
      const model = {};

      props.useServerCall$.subscribe(useServerCall => {
        model.useServerCall = useServerCall;
      });

      props.value$.switchMap(value => {
        model.value = value;
        render({
          loading: true,
        });
        return calculateFibonacci(model.value, model.useServerCall)
          .takeUntil(props.exist$);
      }).subscribe(fibonacci => {
        render({
          loading: false,
          value: model.value,
          fibonacci: fibonacci,
        });
      });
    },
  })
)(FibonacciReactRxProps);
