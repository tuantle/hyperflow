'use strict'; // eslint-disable-line

import { Hf } from 'hyperflow';

import React from 'react';

import ReactDOMServer from 'react-dom/server';

import PropTypes from 'prop-types';

import AppDomain from './domains/app-domain';

const HelloWorldServerApp = Hf.App.augment({
    composites: [
        Hf.React.AppRendererComposite,
        Hf.React.AppComponentComposite
    ],
    $init () {
        const app = this;
        app.register({
            domain: AppDomain({
                name: app.name
            }),
            component: {
                lib: {
                    React,
                    PropTypes
                },
                renderer: ReactDOMServer
            }
        });
    }
})({
    name: `HelloWorldServer`
});

export default HelloWorldServerApp;
