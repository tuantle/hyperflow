'use strict'; // eslint-disable-line

import React from 'react';

import { Button } from '@material-ui/core';

const App = ({
    language,
    message,
    onSayHelloWorld
}) => (
    <React.Fragment>
        <div
            style = {{
                display: `flex`,
                flexDirection: `column`,
                justifyContent: `center`,
                alignItems: `center`
            }}
        >
            <h1 style = {{
                color: `gray`,
                fontFamily: `helvetica`,
                fontSize: 32,
                textAlign: `left`
            }}>{ `${language} - ${message}` }</h1>
            <Button
                variant = 'contained'
                color = 'primary'
                onClick = { onSayHelloWorld }
            > Say It! </Button>
        </div>
        <h2 style = {{
            color: `gray`,
            fontFamily: `helvetica`,
            fontSize: 12,
            textAlign: `left`,
            paddingRight: 175
        }}> Version: 0.1 </h2>
    </React.Fragment>
);

export default App;
