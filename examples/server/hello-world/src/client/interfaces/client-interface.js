'use strict'; // eslint-disable-line

import { Hf } from 'hyperflow';

import React from 'react';

import ReactComponentInterfaceComposite from 'hyperflow/libs/composites/interfaces/react-component-interface-composite';

import ReactDomInterfaceComposite from 'hyperflow/libs/composites/interfaces/react-dom-interface-composite';

import { MuiThemeProvider } from '@material-ui/core/styles';

import theme from '../../common/mui-theme';

const ClientApp = function ({
    getChildInterfacedComponents
}) {
    const [ App ] = getChildInterfacedComponents(`app-interface`);
    React.useEffect(() => {
        const jssStyles = document.querySelector(`#jss-server-side`);
        if (jssStyles) {
            jssStyles.parentElement.removeChild(jssStyles);
        }
    }, []);
    return (
        <MuiThemeProvider theme = { theme }>
            <App/>
        </MuiThemeProvider>
    );
};

const ClientInterface = Hf.Interface.augment({
    composites: [
        ReactComponentInterfaceComposite,
        ReactDomInterfaceComposite
    ],
    $init () {
        const intf = this;

        intf.register({
            component: ClientApp
        });
    },
    setup (done) {
        done();
    }
});

export default ClientInterface;
