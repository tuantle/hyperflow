'use strict'; // eslint-disable-line

import { Hf } from 'hyperflow';

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

const KeypadButtonComponent = function KeypadButtonComponent (property = {
    disabled: false,
    label: ``,
    onClick: () => null
}) {
    const {
        disabled,
        label,
        onClick
    } = property;

    if (Hf.isNumeric(label) || label === `.`) {
        return (
            <RaisedButton
                style = {{
                    margin: 10
                }}
                labelColor = '#FFFFFF'
                primary = { true }
                secondary = { false }
                disabled = { disabled }
                label = { label }
                onClick = { onClick }
            />
        );
    }
    return (
        <RaisedButton
            style = {{
                margin: 10
            }}
            labelColor = '#FFFFFF'
            primary = { false }
            secondary = { true }
            disabled = { disabled }
            label = { label }
            onClick = { onClick }
        />
    );
};

const KeypadInterface = Hf.Interface.augment({
    composites: [
        Hf.React.ComponentComposite
    ],
    setup (done) {
        const intf = this;
        intf.incoming(EVENT.ON.KEYPAD).handle((label) => {
            if (label === `C`) {
                intf.outgoing(EVENT.ON.RESET).emit();
            } else if (label === `÷` || label === `×` || label === `+` || label === `-`) {
                intf.outgoing(EVENT.ON.UPDATE_OPERATION).emit(() => label);
            } else if (Hf.isNumeric(label) || label === `.` || label === `Pi`) {
                intf.outgoing(EVENT.ON.UPDATE_OPERAND).emit(() => label);
            } else if (label === `±`) {
                intf.outgoing(EVENT.ON.NEGATE_OPERAND).emit();
            } else if (label === `=`) {
                intf.outgoing(EVENT.ON.COMPUTE).emit();
            }
        });
        done();
    },
    render () {
        const component = this;
        const keypadLabels = [
            [ `C`, `7`, `4`, `1`, `0` ],
            [ `±`, `8`, `5`, `2` ],
            [ `Pi`, `9`, `6`, `3`, `.` ],
            [ `÷`, `×`, `-`, `+`, `=` ]
        ];
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
            }}>
                {
                    keypadLabels.map((cells, col) => {
                        return (
                            <div key = { col }>{
                                cells.map((cell) => {
                                    return (
                                        <div
                                            key = { cell }
                                            style = {{
                                                flex: [ 1, 1, `auto` ],
                                                alignSelf: `center`,
                                                width: 55,
                                                margin: 10
                                            }}
                                        >
                                            <KeypadButtonComponent label = { cell } onClick = {() => component.outgoing(EVENT.ON.KEYPAD).emit(() => cell)}/>
                                        </div>
                                    );
                                })
                            }</div>
                        );
                    })
                }
            </div>
        );
    }
});

const CalculatorInterface = Hf.Interface.augment({
    composites: [
        Hf.React.ComponentComposite
    ],
    $init () {
        const intf = this;
        intf.composedOf(
            KeypadInterface({
                name: `keypad-view`
            })
        );
    },
    setup (done) {
        const intf = this;
        intf.incoming(
            EVENT.ON.RESET,
            EVENT.ON.UPDATE_OPERAND,
            EVENT.ON.NEGATE_OPERAND,
            EVENT.ON.UPDATE_OPERATION,
            EVENT.ON.COMPUTE
        ).repeat();
        done();
    },
    render () {
        const component = this;
        const [
            Keypad
        ] = component.getComponentComposites(`keypad-view`);
        return (
            <MuiThemeProvider muiTheme = { muiTheme } >
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
