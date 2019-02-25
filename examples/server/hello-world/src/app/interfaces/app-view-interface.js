'use strict'; // eslint-disable-line

import { Hf } from 'hyperflow';

import React from 'react';

const AppViewInterface = Hf.Interface.augment({
    composites: [
        Hf.React.ComponentComposite
    ],
    render () {
        const component = this;
        const {
            name
        } = component.props;
        return (
            <html>
                <head>
                    <meta charSet='UTF-8'/>
                    <title>Example Server</title>
                </head>
                <body>
                    <div className={name}>
                        <h2 style={{
                            color: `gray`,
                            fontFamily: `helvetica`,
                            fontSize: 32,
                            textAlign: `left`
                        }}>
                            Hello World!
                        </h2>
                    </div>
                </body>
            </html>
        );
    }
});

export default AppViewInterface;
