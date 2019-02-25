'use strict'; // eslint-disable-line

import { Hf } from 'hyperflow';

import React from 'react';

import ReactDOM from 'react-dom';

import PropTypes from 'prop-types';

import CounterDomain from './domains/counter-domain';

const CounterApp = Hf.App.augment({
    composites: [
        Hf.React.AppRendererComposite,
        Hf.React.AppComponentComposite
    ],
    $init () {
        const app = this;
        app.register({
            domain: CounterDomain({
                name: app.name
            }),
            component: {
                lib: {
                    React,
                    PropTypes
                },
                renderer: ReactDOM
            }
        });
    }
})({
    name: `counter`
});

export default CounterApp;
