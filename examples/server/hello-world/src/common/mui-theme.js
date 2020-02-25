'use strict'; // eslint-disable-line

import { createMuiTheme } from '@material-ui/core/styles';

const theme = createMuiTheme({
    palette: {
        primary: {
            main: `#03a9f4`
        },
        secondary: {
            main: `#ff3d00`
        },
        error: {
            main: `#fff000`
        },
        background: {
            default: `#ffffff`
        }
    }
});

export default theme;
