import React from 'react';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';

export const defaultIgnoreProps = ['className', 'style'];

export const reactRxProps = (options = {}) => (Component) => {
  const actualOptions = Object.assign({
    existName: 'exist',
    ignoreProps: defaultIgnoreProps,
    propTypes: undefined,
    defaultProps: undefined,
    addDollar: true,
  }, options);

  const isFunction = obj => !!(obj && obj.constructor && obj.call && obj.apply);
  const makeObservableName = name => `${name}${actualOptions.addDollar ? '$' : ''}`;

  return class extends React.Component {
    static propTypes = actualOptions.propTypes;
    static defaultProps = actualOptions.defaultProps;
    static displayName = `reactRxProps(${Component.displayName || Component.name || 'Component'})`;

    componentWillMount() {
      Object.keys(this.props)
        .filter(name => actualOptions.ignoreProps.indexOf(name) === -1)
        .filter(name => !isFunction(this.props[name]))
        .filter(name => !(this.props[name] instanceof Observable))
        .forEach(name => {
          this.observables[name] = new BehaviorSubject();
          this.observables[name].next(this.props[name]);
        });

      if (actualOptions.existName !== false) {
        this.observables[actualOptions.existName] = new Subject();
      }
    }

    componentWillReceiveProps(nextProps) {
      Object.keys(nextProps)
        .filter(name => nextProps[name] !== this.props[name])
        .filter(name => this.observables[name] !== undefined)
        .forEach(name => this.observables[name].next(nextProps[name]));
    }

    shouldComponentUpdate(nextProps) {
      return Object.keys(nextProps)
        .filter(name => nextProps[name] !== this.props[name])
        .findIndex(name => this.observables[name] === undefined) !== -1;
    }

    componentWillUnmount() {
      if (actualOptions.existName !== false) {
        this.observables[actualOptions.existName].next(false);
      }
      Object.values(this.observables).forEach(observable => observable.complete());
    }

    observables = {};

    render() {
      const props = {};

      Object.keys(this.props)
        .filter(name => this.observables[name] === undefined)
        .forEach(name => {
          props[name] = this.props[name];
        });

      Object.keys(this.observables)
        .forEach(name => {
          props[makeObservableName(name)] = this.observables[name];
        });

      return <Component { ...props }/>;
    }
  };
};
