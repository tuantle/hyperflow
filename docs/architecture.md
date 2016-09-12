# Overview

----

Hyperflow is a set of tools and library for universal app development that uses many fundamental software development concepts to streamline app development for various platforms. The core concepts of Hyperflow are: reactive uni-directional data flow handling ( inspired by Flux and Cycle.js), flat design using factory and composite pattern, and immutable and persistent app state. Hyperflow was designed to help developers organize and partition the apps into specific business domains, which is the last core concept of Hyperflow.  

### Reactive Uni-directional Data Flow & App Business Logic Partitioning
In Hyperflow architecture, the data flow of the app is strictly uni-directional and complex app business logic is partition into what are called "domains". In each domain, the business logic would handle a specific app feature and will have a localized uni-directional data flow for its state.
The simpleness domain is a stateless one. Below is a data flow diagram of a stateless domain.
![Stateless Data Flow ][image-1]

![Stateful Data Flow ][image-2]

![App Data Flow ][image-3]

### Flat Design with Factory and Composite Patterns

### Immutable and Persistent State

### Future Considerations
One concept that would be nice to have as the core of Hyperflow is being truly functional. Hyperflow, as of now, is reactionary for most part and somewhat functional.

[image-1]:	https://raw.githubusercontent.com/tuantle/hyperflow/develop/docs/diagrams/stateless-data-flow.png
[image-2]:	https://raw.githubusercontent.com/tuantle/hyperflow/develop/docs/diagrams/stateful-data-flow.png
[image-3]:	https://raw.githubusercontent.com/tuantle/hyperflow/develop/docs/diagrams/app-data-flow.png
