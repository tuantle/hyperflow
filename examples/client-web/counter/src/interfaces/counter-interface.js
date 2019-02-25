'use strict'; // eslint-disable-line

import { Hf } from 'hyperflow';

import React from 'react';

import FlatButton from 'material-ui/FlatButton';

import RaisedButton from 'material-ui/RaisedButton';

import TextField from 'material-ui/TextField';

import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';

import getMuiTheme from 'material-ui/styles/getMuiTheme';

import EVENT from '../events/counter-event';

const muiTheme = getMuiTheme({
    palette: {
        accent1Color: `#FF5722`
    }
});

const CounterInterface = Hf.Interface.augment({
    composites: [
        Hf.React.ComponentComposite
    ],
    setup (done) {
        done();
    },
    render () {
        const component = this;
        const {
            name
        } = component.props;
        const {
            undoable,
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
                    <RaisedButton
                        style = {{
                            margin: 10,
                            backgroundColor: `#FF5722`
                        }}
                        primary = { true }
                        label = '+'
                        disabled = { count > 1000 }
                        onClick = { () => component.outgoing(EVENT.ON.COUNT).emit(() => 1)}
                    />
                    <RaisedButton
                        style = {{
                            margin: 10,
                            backgroundColor: `#FF5722`
                        }}
                        primary = { true }
                        label = '-'
                        disabled = { count < -1000 }
                        onClick = { () => component.outgoing(EVENT.ON.COUNT).emit(() => -1)}
                    />
                    <div
                        className = { name }
                        style = {{
                            display: `flex`,
                            flexDirection: `row`,
                            justifyContent: `center`,
                            alignItems: `center`
                        }}
                    >
                        <FlatButton
                            style = {{
                                margin: 5,
                                color: undoable ? `#FF5722` : `gray`
                            }}
                            secondary = { true }
                            label = 'UNDO'
                            disabled = { !undoable }
                            onClick = {() => component.outgoing(EVENT.ON.UNDO).emit()}
                        />
                    </div>
                    <h1 style = {{
                        color: `gray`,
                        fontFamily: `helvetica`,
                        fontSize: 32,
                        textAlign: `left`
                    }}>Count = { count }</h1>
                    <h2 style = {{
                        color: `gray`,
                        fontFamily: `helvetica`,
                        fontSize: 12,
                        textAlign: `left`,
                        paddingRight: 175
                    }}>v0.5</h2>
                    <TextField
                        hintText = 'Integer'
                        floatingLabelText = 'Offset Value'
                        type = 'number'
                        value = { offset }
                        onChange = {(event) => component.outgoing(EVENT.ON.CHANGE_OFFSET).emit(() => parseInt(event.target.value, 10))}
                    />
                </div>
            </MuiThemeProvider>
        );
    }
});
export default CounterInterface;
