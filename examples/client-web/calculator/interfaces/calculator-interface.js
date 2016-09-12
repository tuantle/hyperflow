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

import RaisedButton from 'material-ui/RaisedButton';

import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';

import getMuiTheme from 'material-ui/styles/getMuiTheme';

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
        const intf = component.getInterface();
        intf.outgoing(`on-keypad-button-press`).emit(() => component.props.label);
    },
    render: function render () {
        const component = this;
        const {
            React
        } = component.getComponentLib();
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
        intf.incoming(`on-component-did-mount`).handle((component) => {
            if (component.props.fId === intf.fId) {
                intf.incoming(`on-keypad-button-press`).handle((label) => {
                    if (label === `C`) {
                        intf.outgoing(`on-clear-key-press`).emit();
                    } else if (label === `÷` || label === `×` || label === `+` || label === `-`) {
                        intf.outgoing(`on-operation-key-press`).emit(() => label);
                    } else if (Hflow.isNumeric(label) || label === `.` || label === `π`) {
                        intf.outgoing(`on-digit-key-press`).emit(() => label);
                    } else if (label === `±`) {
                        intf.outgoing(`on-negate-key-press`).emit();
                    } else if (label === `=`) {
                        intf.outgoing(`on-equal-key-press`).emit();
                    }
                });
            }
        });
        done();
    },
    render: function render () {
        const component = this;
        const {
            React
        } = component.getComponentLib();
        const buttons = component.getComponentComposites(...keypadButtonNames);
        return (
            <div className = { component.props.name } style = { component.props.style.keypadGridStyle }>{
                keypadLabels.map((cells, col) => {
                    return (
                        <div key = { col }>{
                            cells.map((cell, row) => {
                                const Button = buttons[col + row];
                                return (
                                    <div key = { cell } style = { component.props.style.keypadCellStyle }>
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
                name: `keypad-view`,
                style: {
                    keypadGridStyle: intf.style.keypadGridStyle,
                    keypadCellStyle: intf.style.keypadCellStyle
                }
            })
        );
    },
    setup: function setup (done) {
        const intf = this;
        intf.incoming(`on-component-did-mount`).handle((component) => {
            if (component.props.fId === intf.fId) {
                intf.incoming(`on-clear-key-press`).forward(`on-reset`);
                intf.incoming(`on-digit-key-press`).forward(`on-update-operand`);
                intf.incoming(`on-negate-key-press`).forward(`on-negate-operand`);
                intf.incoming(`on-operation-key-press`).forward(`on-update-operation`);
                intf.incoming(`on-equal-key-press`).forward(`on-compute`);
            }
        });
        done();
    },
    render: function render () {
        const component = this;
        const {
            React
        } = component.getComponentLib();
        const [
            Keypad
        ] = component.getComponentComposites(`keypad-view`);
        return (
            <MuiThemeProvider muiTheme={muiTheme}>
                <div className = { component.props.name }>
                    <div style = { component.props.style.display }>
                        <h2 style = { component.props.style.displayText }>{ component.state.result }</h2>
                    </div>
                    <h1 style = { component.props.style.h1 }>v0.1</h1>
                    <Keypad/>
                </div>
            </MuiThemeProvider>
        );
    }
});
export { CalculatorInterface };
