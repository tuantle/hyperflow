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

import event from '../events/calculator-event';

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
        intf.outgoing(event.on.keypadButtonPress).emit(() => component.props.label);
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
        intf.incoming(event.on.componentDidMount).handle((component) => {
            if (component.props.fId === intf.fId) {
                intf.incoming(event.on.keypadButtonPress).handle((label) => {
                    if (label === `C`) {
                        intf.outgoing(event.on.clearKeyButtonPress).emit();
                    } else if (label === `÷` || label === `×` || label === `+` || label === `-`) {
                        intf.outgoing(event.on.operationKeyButtonPress).emit(() => label);
                    } else if (Hflow.isNumeric(label) || label === `.` || label === `π`) {
                        intf.outgoing(event.on.digitKeyButtonPress).emit(() => label);
                    } else if (label === `±`) {
                        intf.outgoing(event.on.negateKeyButtonPress).emit();
                    } else if (label === `=`) {
                        intf.outgoing(event.on.equalKeyButtonPress).emit();
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
        intf.incoming(event.on.componentDidMount).handle((component) => {
            if (component.props.fId === intf.fId) {
                intf.incoming(event.on.clearKeyButtonPress).forward(event.on.reset);
                intf.incoming(event.on.digitKeyButtonPress).forward(event.on.updateOperand);
                intf.incoming(event.on.negateKeyButtonPress).forward(event.on.negateOperand);
                intf.incoming(event.on.operationKeyButtonPress).forward(event.on.updateOperation);
                intf.incoming(event.on.equalKeyButtonPress).forward(event.on.compute);
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
                    <h1 style = { component.props.style.h1 }>v0.2</h1>
                    <Keypad/>
                </div>
            </MuiThemeProvider>
        );
    }
});
export { CalculatorInterface };
