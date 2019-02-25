/* eslint quotes: 0 */

module.exports = function (api) {
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
        '@babel/plugin-proposal-class-properties'
    ];

    api.cache(true);

    return {
        presets,
        plugins
    };
};
