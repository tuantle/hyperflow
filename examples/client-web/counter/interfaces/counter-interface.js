/**
 *------------------------------------------------------------------------
 *
 * @description -  Counter app interface.
 *
 * @author Tuan Le (tuan.t.lei@gmail.com)
 *
 *------------------------------------------------------------------------
 */
'use strict'; // eslint-disable-line

import { Hflow } from 'hyperflow';

import React from 'react';

import FlatButton from 'material-ui/FlatButton';

import RaisedButton from 'material-ui/RaisedButton';

import TextField from 'material-ui/TextField';

import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';

import getMuiTheme from 'material-ui/styles/getMuiTheme';

import injectTapEventPlugin from 'react-tap-event-plugin';

import EVENT from '../events/counter-event';

injectTapEventPlugin();

const muiTheme = getMuiTheme({
    palette: {
        accent1Color: `#FF5722`
    }
});

const UndoButtonInterface = Hflow.Interface.augment({
    composites: [
        Hflow.React.ComponentComposite
    ],
    state: {
        disabled: {
            value: false,
            stronglyTyped: true
        },
        label: {
            value: `UNDO`,
            stronglyTyped: true
        }
    },
    onClick: function onClick () {
        const component = this;
        component.outgoing(EVENT.ON.UNDO).emit();
    },
    render: function render () {
        const component = this;
        const {
            label,
            disabled
        } = component.props;
        return (
            <FlatButton
                style = {{
                    margin: 5,
                    color: `#FF5722`
                }}
                primary = { true }
                label = { label }
                disabled = { disabled }
                onClick = { component.onClick }
            />
        );
    }
});

const DecreaseButtonInterface = Hflow.Interface.augment({
    composites: [
        Hflow.React.ComponentComposite
    ],
    state: {
        disabled: {
            value: false,
            stronglyTyped: true
        },
        label: {
            value: `-`,
            stronglyTyped: true
        }
    },
    onClick: function onClick () {
        const component = this;
        component.outgoing(EVENT.ON.DECREASE).emit(() => -1);
    },
    render: function render () {
        const component = this;
        const {
            label,
            disabled
        } = component.props;
        return (
            <RaisedButton
                style = {{
                    margin: 10,
                    backgroundColor: `#FF5722`
                }}
                primary = { true }
                label = { label }
                disabled = { disabled }
                onClick = { component.onClick }
            />
        );
    }
});

const IncreaseButtonInterface = Hflow.Interface.augment({
    composites: [
        Hflow.React.ComponentComposite
    ],
    state: {
        disabled: {
            value: false,
            stronglyTyped: true
        },
        label: {
            value: `+`,
            stronglyTyped: true
        }
    },
    onClick: function onClick () {
        const component = this;
        component.outgoing(EVENT.ON.INCREASE).emit(() => 1);
    },
    render: function render () {
        const component = this;
        const {
            label,
            disabled
        } = component.props;
        return (
            <RaisedButton
                style = {{
                    margin: 10,
                    backgroundColor: `#FF5722`
                }}
                primary = { true }
                label = { label }
                disabled = { disabled }
                onClick = { component.onClick }
            />
        );
    }
});

const OffsetInputInterface = Hflow.Interface.augment({
    composites: [
        Hflow.React.ComponentComposite
    ],
    state: {
        offset: {
            value: 1,
            stronglyTyped: true
        }
    },
    onChange: function onChange (_event) {
        const component = this;
        component.outgoing(EVENT.ON.CHANGE_OFFSET).emit(() => parseInt(_event.target.value, 10));
    },
    render: function render () {
        const component = this;
        const {
            offset
        } = component.props;
        return (
            <TextField
                hintText = 'Integer'
                floatingLabelText = 'Offset Value'
                type = 'number'
                value = { offset }
                onChange = { component.onChange }
            />
        );
    }
});

const CounterInterface = Hflow.Interface.augment({
    composites: [
        Hflow.React.ComponentComposite
    ],
    $init: function $init () {
        const intf = this;
        intf.composedOf(
            IncreaseButtonInterface({
                name: `increase-button`
            }),
            DecreaseButtonInterface({
                name: `decrease-button`
            }),
            UndoButtonInterface({
                name: `undo-button`
            }),
            OffsetInputInterface({
                name: `offset-input`,
                style: {
                    input: {
                        color: `whitesmoke`,
                        background: `#E0645C`
                    }
                }
            })
        );
    },
    setup: function setup (done) {
        const intf = this;
        intf.incoming(EVENT.ON.CHANGE_OFFSET).repeat();
        intf.incoming(EVENT.ON.UNDO).repeat();
        intf.incoming(
            EVENT.ON.INCREASE,
            EVENT.ON.DECREASE
        ).forward(EVENT.ON.COUNT);
        done();
    },
    render: function render () {
        const component = this;
        const [
            IncreaseButton,
            DecreaseButton,
            UndoButton,
            OffsetInput
        ] = component.getComponentComposites(
            `increase-button`,
            `decrease-button`,
            `undo-button`,
            `offset-input`
        );
        const {
            name
        } = component.props;
        const {
            count,
            offset
        } = component.state;

        return (
            <MuiThemeProvider muiTheme = { muiTheme }>
                <div
                    className = { name }
                    style = {{
                        display: `flex`,
                        flexDirection: `column`,
                        justifyContent: `center`,
                        alignItems: `center`
                    }}
                >
                    <IncreaseButton disabled = { count > 100 }/>
                    <DecreaseButton disabled = { count < 1 }/>
                    <div
                        className = { name }
                        style = {{
                            display: `flex`,
                            flexDirection: `row`,
                            justifyContent: `center`,
                            alignItems: `center`
                        }}
                    >
                        <UndoButton/>
                    </div>
                    <h2 style = {{
                        color: `gray`,
                        fontFamily: `helvetica`,
                        fontSize: 12,
                        textAlign: `left`,
                        paddingRight: 175
                    }}>Count = { count }</h2>
                    <h1 style = {{
                        color: `gray`,
                        fontFamily: `helvetica`,
                        fontSize: 32,
                        textAlign: `left`
                    }}>v0.4</h1>
                    <OffsetInput offset = { offset }/>
                </div>
            </MuiThemeProvider>
        );
    }
});
export default CounterInterface;
