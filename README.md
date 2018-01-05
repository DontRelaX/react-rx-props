## React Rx Props

[![Build Status](https://travis-ci.org/DontRelaX/react-rx-props.svg?branch=master)](https://travis-ci.org/DontRelaX/react-rx-props)
[![codecov](https://codecov.io/gh/DontRelaX/react-rx-props/branch/master/graph/badge.svg)](https://codecov.io/gh/DontRelaX/react-rx-props)

HoC to wrap your component props into observables to specify straightforward rules when 
component should update.

### Installation
`npm i --save react-rx-props`

You also need to have `react@>=15.0.0` and `rxjs@>=5.0.0` in your dependencies.

### Documentation

#### reactRxProps: 

```jsx harmony
import { reactRxProps } from 'react-rx-props';

reactRxProps(options)(YourComponent)
```

##### Options
If options object not provided - default values will be used.

`ignoreProps` - array of props that should not be wrapped into observable.
By default its `['className', 'style']`. Functions and Observables never wrapped 
into observable.

`existName` - name of `exist` param. By default it `exist`. If you set it to 
`false` - exist param will be not passed. Exist param is useful observable
that can be used as `observable.takeUntil(this.props.exist)`. It will be 
emit value once HoC component will unmount. Affected by `addDollar`.

`propTypes` - instead specifying prop types in your component pass it here. By default `undefined`.

`defaultProps` - instead specifying default props in your component pass it here. By default `undefined`.

`addDollar` - if `true` it will add $ to property name when it wrapped into observable. By default `true`.

#### reactRxPropsConnect:

```jsx harmony
import { reactRxPropsConnect } from 'react-rx-props';

reactRxPropsConnect(options)(YourComponent)
```

##### Options
If options object not provided - default values will be used.

`connect` - this function will be executed before component will be mounted. It have 2 args:
`props` that represent all passed props to this component and `render` callback that
should be executed when you want to render wrapped component. `render` have single `props` param
that will be used to update current props passed to wrapped component. In addition to this props
wrapped component will receive all non Observable props.

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

Lets write it in some kind of classic way:
[FibonacciBasic.js](https://github.com/DontRelaX/react-rx-props/blob/master/example/src/FibonacciBasic.js)

Pretty complex for such simple task? We need to handle this logic in 4 lifecycle 
methods. Have a lot of code duplication, `shouldComponentUpdate` executes not only
when props changed but also when we update state. Its pretty easy to write wrong 
code here, that will run additional renders for example.

Lets update it using React Rx Props library:
[FibonacciReactRxProps.js](https://github.com/DontRelaX/react-rx-props/blob/master/example/src/FibonacciReactRxProps.js)

Now all logic placed in componentWillMount. Lets make breakdown to explain what's going on:
```jsx harmony
componentWillMount() {
  //We are simply save useServerCall as class property (better to put such properties under some object), 
  //no setState call, no render.
  this.props.useServerCall$.subscribe(useServerCall => {
    this.useServerCall = useServerCall;
  });
  
  //On every value change including initial value...
  this.props.value$.switchMap(value => {
    //...we save value as class property
    this.value = value;
    //...we are set loading flag to true in state...
    this.setState({
      loading: true,
    }); 
    //...and execute calculateFibonacci function that will return observable for result...
    return calculateFibonacci(value, this.useServerCall)
      //...We don't want to process result if component already unmounted...
      .takeUntil(this.props.exist$);
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

I bet you would like to write stateless component instead, lets do it using `reactRxPropsConnect`:
[FibonacciStateless.js](https://github.com/DontRelaX/react-rx-props/blob/master/example/src/FibonacciStateless.js)

When we are working with Redux we can face more complex situations especially when we need to 
work with multiple async data sources. Dealing with it using Observables will be easier and 
cleaner in terms of code.
