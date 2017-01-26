# [Hyperflow](https://github.com/tuantle/hyperflow)
## A state flow and mutation management toolkit & library for developing universal app

Hyperflow enables you to build universal application experiences on client (native or browser) and server platforms using a consistent developer experience based on JavaScript.

Hyperflow was designed with [React](https://facebook.github.io/react/) or [React Native](https://facebook.github.io/react-native/) that powers the view layer and [RxJS](https://github.com/Reactive-Extensions/RxJS) that powers the domain layer's event-based communication using observable stream.

----

- [Influences](#influences)
- [Installation](#installation)
- [Documentation](#documentation)
- [Client Examples](#client-examples)
- [Native Examples](#native-examples)
- [Server Examples](#server-examples)
- [Change Log](#change-log)
- [License](#license)

### Influences

Hyperflow evolves the ideas of [Cycle](http://cycle.js.org/) and [Flux](http://facebook.github.io/flux/). Hyperflow was designed to provide a predictable and yet flexible methods of state management and complex data flow in modern web / mobile apps.

### Installation

- To install the stable version using [npm](https://www.npmjs.com/) package manager.

```
npm install --save hyperflow
```

- To install the stable version using module bundler [jspm](http://jspm.io/).

```
jspm install npm:hyperflow
```

- To install the stable version using module bundler [webpack](http://webpack.github.io/).

```
To be determine...
```

That’s it!

### Documentations

Documentations can be found at [Hyperflow wiki page](https://github.com/tuantle/hyperflow/wiki).

### Client Examples

To run client examples, you need to have npm, jspm or webpack, and live-server installed. All client code examples can be found at
[/examples/client](https://github.com/tuantle/hyperflow/tree/master/examples/client)

```
npm install -g live-server
git clone https://github.com/tuantle/hyperflow.git
cd ./hyperflow/examples/client
jspm install
npm run start-*
```
Note: * is the name of the example project. For example, npm run start-counter

Make sure that base URL is set to "/" in jspm config.js file.

```
{
    baseURL: "/"
}
```

- Click to run [Counter](http://localhost:8080/counter) app at localhost:8080/counter

- Click to run [Calculator](http://localhost:8080/calculator) app at localhost:8080/calculator


### Native Examples

(comming soon...)

### Server Examples

(comming soon...)

## Change Log
- Link to [change log](https://github.com/tuantle/hyperflow/tree/master/CHANGELOG.md)

## License

Hyperflow is [MIT licensed](./LICENSE).
