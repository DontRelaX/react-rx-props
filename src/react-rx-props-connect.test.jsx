import React from 'react';
import sinon from 'sinon';
import { mount } from 'enzyme';
import { Observable } from 'rxjs';
import { reactRxPropsConnect } from './react-rx-props-connect';


describe('react-rx-props-connect', () => {
  class MockComponent extends React.Component {
    componentWillMount() {}
    componentWillReceiveProps() {}
    componentWillUnmount() {}
    render() {
      return null;
    }
  }

  let sandbox;
  beforeEach(() => {
    sandbox = sinon.sandbox.create();
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should pass all props to connect function', () => {
    const param = 'Hello';
    const connect = sinon.spy();
    const Component = reactRxPropsConnect({
      connect: connect,
    })(MockComponent);
    const wrapper = mount(<Component param={ param }/>);

    expect(connect.calledOnce).toBeTruthy();
    expect(connect.getCall(0).args[0]).toEqual({
      param: param,
    });

    wrapper.unmount();

    expect(connect.calledOnce).toBeTruthy();
  });

  it('should pass to component props that was passed to render', () => {
    const param = 'Hello';

    let outputProps = null;
    sandbox.stub(MockComponent.prototype, 'componentWillMount').callsFake(function () {
      outputProps = this.props;
    });

    const Component = reactRxPropsConnect({
      connect: (props, render) => render({
        param: param,
      }),
    })(MockComponent);
    const wrapper = mount(<Component/>);

    expect(MockComponent.prototype.componentWillMount.calledOnce);
    expect(outputProps).toEqual({
      param: param,
    });

    wrapper.unmount();
  });

  it('should pass to component all non Observable props', () => {
    const param1 = 'Hello';
    const param2 = Observable.of('Hello');

    let outputProps = null;
    sandbox.stub(MockComponent.prototype, 'componentWillMount').callsFake(function () {
      outputProps = this.props;
    });

    const Component = reactRxPropsConnect()(MockComponent);
    const wrapper = mount(<Component param1={ param1 } param2={ param2 }/>);

    expect(MockComponent.prototype.componentWillMount.calledOnce);
    expect(outputProps).toEqual({
      param1: param1,
    });

    wrapper.unmount();
  });

  it('should render component with new props with each render invocation', () => {
    const param = 'Hello';
    const connect = sinon.spy();

    let outputProps = null;
    sandbox.stub(MockComponent.prototype, 'render').callsFake(function () {
      outputProps = this.props;
      return null;
    });

    const Component = reactRxPropsConnect({
      connect: connect,
    })(MockComponent);
    const wrapper = mount(<Component/>);

    expect(MockComponent.prototype.render.calledOnce);
    expect(outputProps).toEqual({});

    expect(connect.calledOnce).toBeTruthy();
    const connectFn = connect.getCall(0).args[1];
    connectFn({
      param: param,
    });

    expect(MockComponent.prototype.render.calledTwice);
    expect(outputProps).toEqual({
      param: param,
    });

    wrapper.unmount();

    expect(connect.calledOnce).toBeTruthy();
  });
});
