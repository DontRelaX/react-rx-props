import React from 'react';
import { Observable } from 'rxjs/Observable';

export const reactRxPropsConnect = (options = {}) => (Component) => {
  const actualOptions = Object.assign({
    connect: (props, render) => render({}),
    propTypes: undefined,
    defaultProps: undefined,
  }, options);

  return class extends React.Component {
    static propTypes = actualOptions.propTypes;
    static defaultProps = actualOptions.defaultProps;
    static displayName = `reactRxPropsConnect(${Component.displayName || Component.name || 'Component'})`;

    componentWillMount() {
      actualOptions.connect(this.props, nextState => this.setState(nextState));
    }

    render() {
      const nonObservableProps = Object.entries(this.props).reduce((memo, [key, value]) => {
        if (value instanceof Observable === false) {
          // eslint-disable-next-line no-param-reassign
          memo[key] = value;
        }
        return memo;
      }, {});
      return <Component { ...nonObservableProps } { ...this.state }/>;
    }
  };
};
