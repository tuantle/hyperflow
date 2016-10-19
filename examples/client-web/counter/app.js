/**
 *------------------------------------------------------------------------
 *
 * @description -  Counter app example.
 *
 * @author Tuan Le (tuan.t.lei@gmail.com)
 *
 *------------------------------------------------------------------------
 */
'use strict'; // eslint-disable-line

import { Hf } from 'hyperflow';

import React from 'react';

import ReactDOM from 'react-dom';

import CounterDomain from './domains/counter-domain';

const counter = Hf.App.augment({
    composites: [
        Hf.React.AppRendererComposite,
        Hf.React.AppComponentComposite
    ],
    $init: function $init () {
        const app = this;
        app.register({
            domain: CounterDomain({
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
    name: `counter`
});
export { counter as app };
