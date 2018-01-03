## React Rx Props

HoC to wrap your component props into observables to specify straightforward rules when 
component should update.

### Installation
`npm i --save react-rx-props`

You also need to have `react@>=15.0.0` and `rxjs@>=5.0.0` in your dependencies.

### Documentation

#### Basic usage: 

```jsx harmony
import { reactRxProps } from 'react-rx-props';

reactRxProps(options)(YourComponent)
```

or if you prefer annotations:
```jsx harmony
@reactRxProps(options)
class YourComponent extends React.Component {...}
```

#### Options
If options object not provided - default values will be used.

`ignoreProps` - array of props that should not be wrapped into observable.
By default its `['className', 'style']`. Functions never wrapped into observable.

`existName` - name of `exist` param. By default it `exist`. If you set it to 
`false` - exist param will be not passed. Exist param is useful observable
that can be used as `observable.takeUntil(this.props.exist)`. It will be 
resolved once HoC component will unmount.

`propTypes` - instead specifying prop types in your component pass it here. By default `undefined`.

`defaultProps` - instead specifying default props in your component pass it here. By default `undefined`.

### Motivation
Often after getting some input data we create some internal model of component 
that allow faster render invocation, for example lets write component that display 
fibonacci number. It will have next parameters:

```js
className     //Fibonacci calculation is not required after this property change, but we should render.
value         //We should calculate fibonacci and render component after this property change
useServerCall //Rendering is not required after this property change, but it will be used in next calculation
```

also we have external function that calculate fibonacci number and return promise:
```typescript
calculateFibonacciExternal(value: number, useServerCall: boolean): Promise<number>;
```

Lets write it in some kind of classic way:
```jsx harmony
export class Fibonacci extends React.Component {
  static propTypes = {
    className: PropTypes.string,
    value: PropTypes.number,
    useServerCall: PropTypes.bool, 
  };
  
  state = {
    loading: true,
    fibonacci: null
  };
  
  unmounted = false;
  calculationId = 0;
  
  calculateFibonacci = (value, useServerCall, cb) => {
    const currentCalculationId = ++this.calculationId;
    calculateFibonacciExternal(value, useServerCall).then(fibonacci => {
      if(currentCalculationId === currentCalculationId && !this.unmounted) {
        cb(fibonacci);
      }
    });
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
      this.calculateFibonacci(this.props.value, this.props.useServerCall, (fibonacci) => {
        this.setState({
          fibonacci: fibonacci,
          loading: false,
        });
      });
    }
  }
  
  shouldComponentUpdate(nextProps) {
    return this.props.className !== nextProps.className || 
           this.props.value !== this.props.value;
  }
  
  componentWillUnmount() {
    this.unmounted = true;
  }
  
  render() {
    return (
      <div className={ classnames(this.props.className, this.state.loading && 'loading') }>
        { this.state.loading ?
          'Loading...' :
          `Fibonacci of ${this.props.value} = {this.state.fibonacci}`
        }
      </div>
    );
  }
}
```

Pretty complex for such simple task? We need to handle this logic in 4 lifecycle 
methods. Lets update it using React Rx Props library:

```jsx harmony
@reactRxProps({
  propTypes: {
    className: PropTypes.string,
    value: PropTypes.number,
    useServerCall: PropTypes.bool, 
  }
})
export class Fibonacci extends React.Component {
  state = {
    loading: true,
    fibonacci: null
  };
  
  calculateFibonacci = (...args) => Observable.fromPromise(calculateFibonacciExternal(...args));
  
  componentWillMount() {
    this.props.useServerCall.subscribe(useServerCall => this.useServerCall = useServerCall);
    
    this.props.value.switchMap(value => {
      this.setState({
        loading: true,
      }); 
      return this.calculateFibonacci(value, this.useServerCall)
        .takeUntil(this.props.exist);
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
          `Fibonacci of ${this.props.value} = {this.state.fibonacci}`
        }
      </div>
    );
  }
}
```

Now all logic placed in componentWillMount. Lets make breakdown to explain what's going on:
```$jsx
componentWillMount() {
  //We are simply save useServerCall as class property, no setState call, no render.
  this.props.useServerCall.subscribe(useServerCall => this.useServerCall = useServerCall);
  
  //On every value change including initial value...
  this.props.value.switchMap(value => {
    //...we are set loading flag to true in state...
    this.setState({
      loading: true,
    }); 
    //...and execute calculateFibonacci function that will return observable for result...
    return calculateFibonacci(value, this.useServerCall)
      //...We don't want to process result if component already unmounted...
      .takeUntil(this.props.exist);
  })
  //...update state with calculated fibonacci
  .subscribe(fibonacci => {
    this.setState({
      loading: false,
      fibonacci: fibonacci,
    });
  });
}
```

When we are working with Redux we can face more complex situations especially when we need to 
work with multiple async data sources. Dealing with it using Observables will be easier and 
cleaner in terms of code.
