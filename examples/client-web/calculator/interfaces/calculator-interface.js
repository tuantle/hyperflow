/**
 *------------------------------------------------------------------------
 *
 * @description -  Calculator app main interface.
 *
 * @author Tuan Le (tuan.t.lei@gmail.com)
 *
 *------------------------------------------------------------------------
 */
'use strict'; // eslint-disable-line

import { Hflow } from 'hyperflow';

import React from 'react';

import RaisedButton from 'material-ui/RaisedButton';

import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';

import getMuiTheme from 'material-ui/styles/getMuiTheme';

import EVENT from '../events/calculator-event';

const muiTheme = getMuiTheme({
    palette: {
        accent1Color: `#FF5722`
    }
});

const keypadLabels = [
    [ `C`, `7`, `4`, `1`, `0` ],
    [ `±`, `8`, `5`, `2` ],
    [ `π`, `9`, `6`, `3`, `.` ],
    [ `÷`, `×`, `-`, `+`, `=` ]
];

let keypadButtonNames;

const KeypadButtonInterface = Hflow.Interface.augment({
    composites: [
        Hflow.React.ComponentComposite
    ],
    state: {
        label: {
            value: ``,
            stronglyTyped: true
        }
    },
    onClick: function onClick () {
        const component = this;
        component.outgoing(EVENT.ON.KEYPAD).emit(() => component.props.label);
    },
    render: function render () {
        const component = this;
        if (Hflow.isNumeric(component.props.label) || component.props.label === `.`) {
            return (
                <RaisedButton
                    style = {{
                        margin: 10
                    }}
                    labelColor = '#FFFFFF'
                    primary = { true }
                    label = { component.props.label }
                    onClick = { component.onClick }
                />
            );
        }
        return (
            <RaisedButton
                style = {{
                    margin: 10
                }}
                labelColor = '#FFFFFF'
                secondary = { true }
                label = { component.props.label }
                onClick = { component.onClick }
            />
        );
    }
});

const KeypadInterface = Hflow.Interface.augment({
    composites: [
        Hflow.React.ComponentComposite
    ],
    $init: function $init () {
        const intf = this;
        keypadButtonNames = [].concat.apply([], keypadLabels).map((label) => {
            return label === `.` ? `${intf.name}-dot-button` : `${intf.name}-${label}-button`;
        });
        const keypadButtons = keypadButtonNames.map((name) => KeypadButtonInterface({
            name
        }));
        intf.composedOf(...keypadButtons);
    },
    setup: function setup (done) {
        const intf = this;
        intf.incoming(EVENT.ON.KEYPAD).handle((label) => {
            if (label === `C`) {
                intf.outgoing(EVENT.ON.RESET).emit();
            } else if (label === `÷` || label === `×` || label === `+` || label === `-`) {
                intf.outgoing(EVENT.ON.UPDATE_OPERATION).emit(() => label);
            } else if (Hflow.isNumeric(label) || label === `.` || label === `π`) {
                intf.outgoing(EVENT.ON.UPDATE_OPERAND).emit(() => label);
            } else if (label === `±`) {
                intf.outgoing(EVENT.ON.NEGATE_OPERAND).emit();
            } else if (label === `=`) {
                intf.outgoing(EVENT.ON.COMPUTE).emit();
            }
        });
        done();
    },
    render: function render () {
        const component = this;
        const buttons = component.getComponentComposites(...keypadButtonNames);
        return (
            <div className = { component.props.name } style = {{
                display: `flex`,
                flexDirection: `row`,
                flexWrap: `wrap`,
                justifyContent: `space-around`,
                alignContent: `center`,
                alignItems: `stretch`,
                paddingRight: 300,
                paddingLeft: 300
            }}>{
                keypadLabels.map((cells, col) => {
                    return (
                        <div key = { col }>{
                            cells.map((cell, row) => {
                                const Button = buttons[col + row];
                                return (
                                    <div key = { cell } style = {{
                                        flex: [ 1, 1, `auto` ],
                                        alignSelf: `center`,
                                        width: 55,
                                        margin: 10
                                    }}>
                                        <Button label = { cell }/>
                                    </div>
                                );
                            })
                        }</div>
                    );
                })
            }</div>
        );
    }
});

const CalculatorInterface = Hflow.Interface.augment({
    composites: [
        Hflow.React.ComponentComposite
    ],
    $init: function $init () {
        const intf = this;
        intf.composedOf(
            KeypadInterface({
                name: `keypad-view`
            })
        );
    },
    setup: function setup (done) {
        const intf = this;
        intf.incoming(EVENT.ON.RESET).repeat();
        intf.incoming(EVENT.ON.UPDATE_OPERAND).repeat();
        intf.incoming(EVENT.ON.NEGATE_OPERAND).repeat();
        intf.incoming(EVENT.ON.UPDATE_OPERATION).repeat();
        intf.incoming(EVENT.ON.COMPUTE).repeat();
        done();
    },
    render: function render () {
        const component = this;
        const [
            Keypad
        ] = component.getComponentComposites(`keypad-view`);
        return (
            <MuiThemeProvider muiTheme={muiTheme}>
                <div className = { component.props.name }>
                    <div style = {{
                        display: `flex`,
                        flexDirection: `row`,
                        justifyContent: `center`,
                        alignContent: `center`,
                        paddingLeft: 350,
                        paddingRight: 310
                    }}>
                        <h2 style = {{
                            color: `#388E3C`,
                            background: `whitesmkoke`,
                            border: 1,
                            borderStyle: `solid`,
                            borderRadius: 2,
                            fontFamily: `helvetica`,
                            fontSize: 32,
                            fontWeight: `bold`,
                            textAlign: `right`,
                            textIndent: -10,
                            paddingRight: 5,
                            paddingLeft: 5,
                            width: `100%`
                        }}>{ component.state.result }</h2>
                    </div>
                    <h1 style = {{
                        color: `gray`,
                        fontFamily: `helvetica`,
                        fontSize: 12,
                        textAlign: `right`,
                        paddingRight: 310
                    }}>v0.5</h1>
                    <Keypad/>
                </div>
            </MuiThemeProvider>
        );
    }
});
export default CalculatorInterface;
