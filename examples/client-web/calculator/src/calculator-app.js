'use strict'; // eslint-disable-line

import { Hf } from 'hyperflow';

import React from 'react';

import ReactDOM from 'react-dom';

import PropTypes from 'prop-types';

import CalculatorDomain from './domains/calculator-domain';

const CalculatorApp = Hf.App.augment({
    composites: [
        Hf.React.AppRendererComposite,
        Hf.React.AppComponentComposite
    ],
    $init () {
        const app = this;
        app.register({
            domain: CalculatorDomain({
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
    name: `calculator`
});

export default CalculatorApp;
