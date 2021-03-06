/* eslint no-process-env: 0 */
/* eslint quotes: 0 */

module.exports = function (api) {
    api.cache.using(() => process.env.NODE_ENV);

    const presets = [
        '@babel/react',
        [
            '@babel/preset-env',
            {
                targets: {
                    node: 'current'
                }
            }
        ]
    ];

    const plugins = [
        '@babel/plugin-transform-strict-mode',
        '@babel/plugin-proposal-object-rest-spread',
        '@babel/plugin-proposal-class-properties',
        '@babel/plugin-proposal-optional-chaining',
        '@babel/plugin-proposal-nullish-coalescing-operator'
    ];

    // const env = {};

    return {
        comments: false,
        sourceMaps: 'inline',
        presets,
        plugins
    //    env,
    };
};
