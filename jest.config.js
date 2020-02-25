/* eslint quotes: 0 */

module.exports = {
    clearMocks: true,
    coverageDirectory: 'coverage',
    testEnvironment: 'node',
    moduleFileExtensions: [
        'js',
        'jsx',
        'json'
    ],
    transform: {
        '^.+\\.(js|jsx|ts|tsx)$': '<rootDir>/node_modules/babel-jest'
    },
    moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/src/$1'
    },
    transformIgnorePatterns: [ '<rootDir>/node_modules/' ]
};
