'use strict'; // eslint-disable-line

import { Hf } from 'hyperflow';

import React from 'react';

import ReactComponentInterfaceComposite from 'hyperflow/libs/composites/interfaces/react-component-interface-composite';

import ReactDomServerInterfaceComposite from 'hyperflow/libs/composites/interfaces/react-dom-server-interface-composite';

import { ServerStyleSheets, MuiThemeProvider } from '@material-ui/core/styles';

import EVENT from '../../common/event';

import theme from '../../common/mui-theme';

const styleSheets = new ServerStyleSheets();

const ServerApp = function ({
    getChildInterfacedComponents
}) {
    const [ App ] = getChildInterfacedComponents(`app-interface`);

    return (
        styleSheets.collect(
            <MuiThemeProvider theme = { theme }>
                <App/>
            </MuiThemeProvider>
        )
    );
};

export default Hf.Interface.augment({
    composites: [
        ReactComponentInterfaceComposite,
        ReactDomServerInterfaceComposite
    ],
    $init () {
        const intf = this;

        intf.register({
            component: ServerApp
        });
    },
    setup (done) {
        const intf = this;

        intf.incoming(`on-component-${intf.name}-render-to-target`).handle((html) => {
            const renderedTarget = {
                html,
                css: styleSheets.toString()
            };
            return renderedTarget;
        }).relay(EVENT.DO.BROADCAST_RENDERED_TARGET);

        done();
    }
});
