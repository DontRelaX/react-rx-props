import React from 'react';
import sinon from 'sinon';
import { mount } from 'enzyme';
import { Observable } from 'rxjs';
import _ from 'underscore';

import { reactRxProps, defaultIgnoreProps } from './react-rx-props';


describe('reactRxProps', () => {
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

  it('should pass observable instead value', () => {
    let outputParam = null;
    sandbox.stub(MockComponent.prototype, 'componentWillMount').callsFake(function () {
      outputParam = this.props.param$;
    });
    const Component = reactRxProps()(MockComponent);
    const wrapper = mount(<Component param="Hello"/>);

    expect(outputParam).toBeInstanceOf(Observable);

    wrapper.unmount();
  });

  it('should get param value by subscribing to observable', () => {
    const inputParam = 'Hello';
    const paramNext = sinon.spy();

    sandbox.stub(MockComponent.prototype, 'componentWillMount').callsFake(function () {
      this.props.param$.subscribe(paramNext);
    });

    const Component = reactRxProps()(MockComponent);
    const wrapper = mount(<Component param={ inputParam }/>);

    expect(paramNext.calledOnce).toBeTruthy();
    expect(paramNext.withArgs(inputParam).calledOnce).toBeTruthy();

    wrapper.unmount();
  });

  it('should pass updated param value to observable', () => {
    const inputParam1 = 'Hello';
    const inputParam2 = 'World';
    const paramNext = sinon.spy();

    sandbox.stub(MockComponent.prototype, 'componentWillMount').callsFake(function () {
      this.props.param$.subscribe(paramNext);
    });
    sandbox.spy(MockComponent.prototype, 'render');

    const Component = reactRxProps()(MockComponent);

    const wrapper = mount(<Component param={ inputParam1 }/>);

    expect(paramNext.calledOnce).toBeTruthy();
    expect(paramNext.withArgs(inputParam1).calledOnce).toBeTruthy();
    expect(MockComponent.prototype.render.calledOnce).toBeTruthy();

    wrapper.setProps({
      param: inputParam2,
    });

    expect(paramNext.calledTwice).toBeTruthy();
    expect(paramNext.withArgs(inputParam2).calledOnce).toBeTruthy();
    expect(MockComponent.prototype.render.calledOnce).toBeTruthy();
    wrapper.unmount();
  });

  it('should process newly created param by value', () => {
    const inputParam1 = 'Hello';
    const inputParam2 = 'World';

    let outputParam2 = null;
    sandbox.stub(MockComponent.prototype, 'componentWillReceiveProps').callsFake((nextProps) => {
      outputParam2 = nextProps.param2;
    });
    sandbox.spy(MockComponent.prototype, 'render');

    const Component = reactRxProps()(MockComponent);

    const wrapper = mount(<Component param1={ inputParam1 }/>);

    expect(MockComponent.prototype.render.calledOnce).toBeTruthy();

    wrapper.setProps({
      param2: inputParam2,
    });

    expect(outputParam2).toBe(inputParam2);
    expect(MockComponent.prototype.render.calledTwice).toBeTruthy();

    wrapper.unmount();
  });

  it('should not wrap with observable defaultIgnoreProps', () => {
    const inputProps = _(defaultIgnoreProps).chain()
      .map(prop => [prop, prop])
      .object()
      .value();

    let outputProps = null;
    sandbox.stub(MockComponent.prototype, 'componentWillMount').callsFake(function () {
      outputProps = this.props;
    });
    const Component = reactRxProps()(MockComponent);
    const wrapper = mount(<Component { ...inputProps }/>);

    expect(_(outputProps).pick(defaultIgnoreProps)).toEqual(inputProps);

    wrapper.unmount();
  });

  it('should not wrap with observable passed ignoreProps', () => {
    const overridedIgnoreProps = ['param1', 'param2'];
    const inputProps = _(overridedIgnoreProps).chain()
      .map(prop => [prop, prop])
      .object()
      .value();

    let outputProps = null;
    sandbox.stub(MockComponent.prototype, 'componentWillMount').callsFake(function () {
      outputProps = this.props;
    });
    const Component = reactRxProps({
      ignoreProps: overridedIgnoreProps,
    })(MockComponent);
    const wrapper = mount(<Component { ...inputProps }/>);

    expect(_(outputProps).pick(overridedIgnoreProps)).toEqual(inputProps);

    wrapper.unmount();
  });

  it('should not wrap with observable passed functions', () => {
    const inputParam = () => {};
    let outputParam = null;
    sandbox.stub(MockComponent.prototype, 'componentWillMount').callsFake(function () {
      outputParam = this.props.param;
    });
    const Component = reactRxProps()(MockComponent);
    const wrapper = mount(<Component param={ inputParam }/>);

    expect(outputParam).toEqual(inputParam);

    wrapper.unmount();
  });

  it('should pass updated ignoreProps', () => {
    const inputParam1 = 'Hello';
    const inputParam2 = 'World';

    sandbox.spy(MockComponent.prototype, 'componentWillReceiveProps');
    sandbox.spy(MockComponent.prototype, 'render');

    const Component = reactRxProps({
      ignoreProps: ['param'],
    })(MockComponent);

    const wrapper = mount(<Component param={ inputParam1 }/>);

    expect(MockComponent.prototype.componentWillReceiveProps.notCalled).toBeTruthy();
    expect(MockComponent.prototype.render.calledOnce).toBeTruthy();

    wrapper.setProps({
      param: inputParam2,
    });

    expect(MockComponent.prototype.componentWillReceiveProps.calledOnce).toBeTruthy();
    expect(MockComponent.prototype.render.calledTwice).toBeTruthy();
    wrapper.unmount();
  });

  it('should respect defaultProps', () => {
    const inputParam1 = 'Hello';
    const inputParam2 = 'World';
    const paramNext = sinon.spy();

    sandbox.stub(MockComponent.prototype, 'componentWillMount').callsFake(function () {
      this.props.param$.subscribe(paramNext);
    });

    const Component = reactRxProps({
      defaultProps: {
        param: inputParam1,
      },
    })(MockComponent);
    const wrapper = mount(<Component/>);

    expect(paramNext.calledOnce).toBeTruthy();
    expect(paramNext.withArgs(inputParam1).calledOnce).toBeTruthy();

    wrapper.setProps({
      param: inputParam2,
    });

    expect(paramNext.calledTwice).toBeTruthy();
    expect(paramNext.withArgs(inputParam2).calledOnce).toBeTruthy();
    wrapper.unmount();
  });

  it('should complete passed observable before unmount', () => {
    const paramNext = sinon.spy();
    const paramComplete = sinon.spy();
    sandbox.stub(MockComponent.prototype, 'componentWillMount').callsFake(function () {
      this.props.param$.subscribe({
        next: paramNext,
        complete: paramComplete,
      });
    });
    sandbox.spy(MockComponent.prototype, 'componentWillUnmount');
    const Component = reactRxProps()(MockComponent);
    const wrapper = mount(<Component param="Hello"/>);

    expect(paramComplete.notCalled).toBeTruthy();

    wrapper.unmount();

    expect(paramComplete.calledOnce).toBeTruthy();
    expect(paramComplete.calledBefore(MockComponent.prototype.componentWillUnmount)).toBeTruthy();
  });

  it('should pass exist observable prop', () => {
    let outputExist = null;
    sandbox.stub(MockComponent.prototype, 'componentWillMount').callsFake(function () {
      outputExist = this.props.exist$;
    });
    const Component = reactRxProps()(MockComponent);
    const wrapper = mount(<Component/>);

    expect(outputExist).toBeInstanceOf(Observable);

    wrapper.unmount();
  });

  it('should exist.next(false) before unmount', () => {
    const existNext = sinon.spy();
    const existComplete = sinon.spy();
    sandbox.stub(MockComponent.prototype, 'componentWillMount').callsFake(function () {
      this.props.exist$.subscribe({
        next: existNext,
        complete: existComplete,
      });
    });
    sandbox.spy(MockComponent.prototype, 'componentWillUnmount');
    const Component = reactRxProps()(MockComponent);
    const wrapper = mount(<Component/>);

    expect(existNext.notCalled).toBeTruthy();

    wrapper.unmount();

    expect(existNext.calledOnce).toBeTruthy();
    expect(existComplete.calledOnce).toBeTruthy();
    expect(existNext.calledWith(false)).toBeTruthy();
    expect(existNext.calledBefore(MockComponent.prototype.componentWillUnmount)).toBeTruthy();
    expect(existComplete.calledBefore(MockComponent.prototype.componentWillUnmount)).toBeTruthy();
  });

  it('should pass [existName] observable prop', () => {
    let outputOverridedExist = null;
    sandbox.stub(MockComponent.prototype, 'componentWillMount').callsFake(function () {
      outputOverridedExist = this.props.overridedExist$;
    });
    const Component = reactRxProps({
      existName: 'overridedExist',
    })(MockComponent);
    const wrapper = mount(<Component/>);

    expect(outputOverridedExist).toBeInstanceOf(Observable);

    wrapper.unmount();
  });

  it('should [existName].next(false) before unmount', () => {
    const overridedExistNext = sinon.spy();
    const overridedExistComplete = sinon.spy();
    sandbox.stub(MockComponent.prototype, 'componentWillMount').callsFake(function () {
      this.props.overridedExist$.subscribe({
        next: overridedExistNext,
        complete: overridedExistComplete,
      });
    });
    sandbox.spy(MockComponent.prototype, 'componentWillUnmount');
    const Component = reactRxProps({
      existName: 'overridedExist',
    })(MockComponent);
    const wrapper = mount(<Component/>);

    expect(overridedExistNext.notCalled).toBeTruthy();

    wrapper.unmount();

    expect(overridedExistNext.calledOnce).toBeTruthy();
    expect(overridedExistComplete.calledOnce).toBeTruthy();
    expect(overridedExistNext.calledWith(false)).toBeTruthy();
    expect(overridedExistNext.calledBefore(MockComponent.prototype.componentWillUnmount)).toBeTruthy();
    expect(overridedExistComplete.calledBefore(MockComponent.prototype.componentWillUnmount)).toBeTruthy();
  });

  it('should not pass exist with existName === false', () => {
    let outputExist = null;
    sandbox.stub(MockComponent.prototype, 'componentWillMount').callsFake(function () {
      outputExist = this.props.exist$;
    });
    const Component = reactRxProps({
      existName: false,
    })(MockComponent);
    const wrapper = mount(<Component/>);

    expect(outputExist).toBeUndefined();

    wrapper.unmount();
  });

  it('should respect addDollar = false', () => {
    const inputParam = 'Hello';
    const paramNext = sinon.spy();
    const existNext = sinon.spy();

    sandbox.stub(MockComponent.prototype, 'componentWillMount').callsFake(function () {
      this.props.param.subscribe(paramNext);
      this.props.exist.subscribe(existNext);
    });

    const Component = reactRxProps({
      addDollar: false,
    })(MockComponent);
    const wrapper = mount(<Component param={ inputParam }/>);

    expect(paramNext.calledOnce).toBeTruthy();
    expect(paramNext.withArgs(inputParam).calledOnce).toBeTruthy();
    expect(existNext.notCalled).toBeTruthy();

    wrapper.unmount();

    expect(existNext.withArgs(false).calledOnce).toBeTruthy();
  });
});
