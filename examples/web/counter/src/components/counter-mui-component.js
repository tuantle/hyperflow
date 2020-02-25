'use strict'; // eslint-disable-line

import React from 'react';

import {
    Button,
    TextField
} from '@material-ui/core';

import {
    MuiThemeProvider,
    createMuiTheme
} from '@material-ui/core/styles';

import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
    countingButton: {
        margin: theme.spacing(1)
    },
    undoButton: {
        margin: theme.spacing(1)
    },
    input: {
        display: `none`
    }
}));

const theme = createMuiTheme({
    palette: {
        primary: {
            main: `#03a9f4`
        },
        secondary: {
            main: `#ff3d00`
        }
    }
});

const CounterButtons = ({
    count,
    undoable,
    onIncrease,
    onDecrease,
    onUndo
}) => {
    const classes = useStyles();

    return ([
        <Button
            key = '+'
            className = { classes.countingButton }
            variant = 'contained'
            color = 'primary'
            disabled = { count > 100 }
            onClick = { onIncrease }
        > + </Button>,
        <Button
            key = '-'
            className = { classes.countingButton }
            variant = 'contained'
            color = 'primary'
            disabled = { count < -100 }
            onClick = { onDecrease }
        > - </Button>,
        <Button
            key = 'undo'
            className = { classes.undoButton }
            variant = 'contained'
            color = { undoable ? `secondary` : `default` }
            disabled = { !undoable }
            onClick = { onUndo }
        > UNDO </Button>
    ]);
};

const Counter = ({
    undoable,
    count,
    offset,
    // outgoing,
    // getComponensOfChildInterfaces
    onIncrease,
    onDecrease,
    onUndo,
    onChange
}) => {
    return (
        <MuiThemeProvider theme = { theme }>
            <div
                style = {{
                    display: `flex`,
                    flexDirection: `column`,
                    justifyContent: `center`,
                    alignItems: `center`
                }}
            >
                <CounterButtons
                    count = { count }
                    undoable = { undoable }
                    onIncrease = { onIncrease }
                    onDecrease = { onDecrease }
                    onUndo = { onUndo }
                />
                <TextField
                    label= 'Offset Value'
                    value = { offset }
                    type = 'number'
                    InputLabelProps = {{
                        shrink: true
                    }}
                    onChange = {(event) => onChange(parseInt(event.target.value, 10))}
                />
                <h1 style = {{
                    color: `gray`,
                    fontFamily: `helvetica`,
                    fontSize: 32,
                    textAlign: `left`
                }}> Count = { count } </h1>
                <h2 style = {{
                    color: `gray`,
                    fontFamily: `helvetica`,
                    fontSize: 12,
                    textAlign: `left`,
                    paddingRight: 175
                }}> Version: 0.6 </h2>
            </div>
        </MuiThemeProvider>
    );
};

export default Counter;
