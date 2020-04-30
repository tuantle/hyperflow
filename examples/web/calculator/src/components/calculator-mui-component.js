'use strict'; // eslint-disable-line

import {
    isNumeric
} from 'hyperflow/libs/utils/common-util';

import React from 'react';

import {
    Box,
    Paper,
    Grid,
    Button,
    Typography
} from '@material-ui/core';

import {
    MuiThemeProvider,
    createMuiTheme
} from '@material-ui/core/styles';

import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles(() => ({
    root: {
        justifyContent: `center`,
        alignContent: `center`,
        alignItems: `center`,
        alignSelf: `center`,
        height: `600px`,
        width: `480px`
    },
    displayResult: {
        justifyContent: `center`,
        alignContent: `center`,
        alignItems: `center`,
        margin: `10px`,
        paddingLeft: `20px`,
        paddingRight: `20px`,
        textAlign: `right`
    },
    displayComputes: {
        justifyContent: `center`,
        alignContent: `center`,
        alignItems: `center`,
        height: `30px`,
        paddingLeft: `20px`,
        paddingRight: `20px`,
        textAlign: `right`
    },
    keypad: {
        display: `flex`,
        alignContent: `center`,
        alignItems: `center`,
        alignSelf: `center`
    },
    keypadButton: {
        height: `40px`,
        width: `60px`,
        margin: `5px`
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

const KEY_PAD_LABELS = [
    [ `C`, ``, ``, `÷` ],
    [ `7`, `8`, `9`, `×` ],
    [ `4`, `5`, `6`, `-` ],
    [ `1`, `2`, `3`, `+` ],
    [ `0`, ``, `.`, `=` ]
];

const KeypadButton = ({
    label,
    onClick
}) => {
    const classes = useStyles();

    if (label === ``) {
        return (
            <Box className = { classes.keypadButton }/>
        );
    }
    return (
        <Button
            key = { label }
            className = { classes.keypadButton }
            variant = 'contained'
            color = { isNumeric(label) || label === `.` ? `primary` : `secondary` }
            onClick = { onClick }
        >{ label }</Button>
    );
};

const Keypad = ({
    onReset,
    onOperation,
    onPerand,
    onCompute
}) => {
    const classes = useStyles();

    return (
        KEY_PAD_LABELS.map((cells, col) => (
            <Grid key = { col } className = { classes.keypad } item xs = { 8 }>{
                cells.map((cellLabel, index) => (
                    <React.Fragment key = { index }>
                        <Grid item xs = { 8 }>
                            <KeypadButton
                                label = { cellLabel }
                                onClick = {() => {
                                    if (cellLabel === `C`) {
                                        onReset();
                                    } else if (cellLabel === `÷` || cellLabel === `×` || cellLabel === `+` || cellLabel === `-`) {
                                        onOperation(cellLabel);
                                    } else if (isNumeric(cellLabel) || cellLabel === `.` || cellLabel === `Pi` || cellLabel === `±`) {
                                        onPerand(cellLabel);
                                    } else if (cellLabel === `=`) {
                                        onCompute();
                                    }
                                }}
                            />
                        </Grid>
                    </React.Fragment>
                ))
            }</Grid>
        ))
    );
};

const Calculator = ({
    displayResult,
    displayComputes,
    onReset,
    onOperation,
    onPerand,
    onCompute
}) => {
    const classes = useStyles();

    return (
        <MuiThemeProvider theme = { theme }>
            <Grid className = { classes.root } container spacing = { 5 }>
                <Grid item xs = { 10 }>
                    <Paper className = { classes.displayResult }>
                        <Typography variant = 'h2' gutterBottom >{ displayResult }</Typography>
                    </Paper>
                </Grid>
                <Grid item xs = { 10 }>
                    <Box className = { classes.displayComputes }>
                        <Typography variant = 'h4' gutterBottom >{ displayComputes }</Typography>
                    </Box>
                </Grid>
                <Keypad
                    onReset = { onReset }
                    onOperation = { onOperation }
                    onPerand = { onPerand }
                    onCompute = { onCompute }
                />
            </Grid>
            <Typography variant = 'h6' gutterBottom > Version: 0.6  </Typography>
        </MuiThemeProvider>
    );
};
export default Calculator;
