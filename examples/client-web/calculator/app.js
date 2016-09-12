/**
 *------------------------------------------------------------------------
 *
 * @description -  Calculator app example.
 *
 * @author Tuan Le (tuan.t.lei@gmail.com)
 *
 *------------------------------------------------------------------------
 */
'use strict'; // eslint-disable-line

import { Hflow } from 'hyperflow';

import React from 'react';

import ReactDOM from 'react-dom';

import { CalculatorDomain } from './domains/calculator-domain';

const calculator = Hflow.App.augment({
    composites: [
        Hflow.React.RendererComposite,
        Hflow.React.AppComponentComposite
    ],
    /**
     * @description - Bootstrap calculator app.
     *
     * @method $init
     * @return void
     */
    $init: function $init () {
        const app = this;
        app.register({
            domain: CalculatorDomain({
                name: app.name
            }),
            component: {
                library: {
                    React
                },
                renderer: ReactDOM
            }
        });
    }
})({
    name: `calculator`
});
export { calculator as app };
