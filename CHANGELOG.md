# [Hyperflow](https://github.com/tuantle/hyperflow)
## A toolkit & library for developing universal app.

----

**Development Beta Version 0.1.0-beta1 (9/8/2016)**
```
Notes:
    - Initial commit (APIs close to stabilization).
New Features:
Breaking Changes:
Improvements:
Bug fixes:
```
**Development Beta Version 0.1.0-beta2 (9/14/2016)**
```
Notes:
New Features:
    - Added the optional Hflow.Event.create method. This allows a more opinionated way of naming event Id.  
Breaking Changes:
    - Commented out getState & getComposite in Composer, and getStateAccessor & getStateSchema in CompositeElement. Will be removed if find no use case.
Improvements:
Bug fixes:
```
**Development Beta Version 0.1.0-beta3 (9/17/2016)**
```
Notes:
    - Removed toStandaloneComponent method from AppFactory. And moved it to ReactAppComponentComposite for client web & native.
New Features:
    - Implemented mounting, dismounting, and update life cycle handler methods to InterfaceFactory and ReactComponentComposite.
        preMountStage
        postMountStage
        preDismountStage
        postDismountStage
        preUpdateStage
        postUpdateStage
Breaking Changes:
Improvements:
Bug fixes:
```
**Development Beta Version 0.1.0-beta4 (9/18/2016)**
```
Notes:
New Features:
Breaking Changes:
    - Renamed toPromises to asPromised for EventStreamComposite.
Improvements:
Bug fixes:
    - Added 10ms delay to event stream from domain to services and store. This is a temp fix.
```
