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
    - Renamed method toPromises to asPromised for EventStreamComposite.
Improvements:
Bug fixes:
    - Added 10ms delay to event stream from domain to services and store for DomainFactory. This is a temp fix.
```
**Development Beta Version 0.1.0-beta5 (9/19/2016)**
```
Notes:
New Features:
Breaking Changes:
Improvements:
    - Minor tweak to Hflow.Event.create method return object. Property key names are uppercased.
    - Clean up asPromised method in EventStreamComposite.
Bug fixes:
    - Added correct delay instead of debounce method to event stream from domain to services and store for DomainFactory.
```
**Development Beta Version 0.1.0-beta6 (9/20/2016)**
```
Notes:
New Features:
Breaking Changes:
    - Rename ReactRendererComposite to ReactAppRendererComposite.
    - Rename method getTopComponentRenderer to getRenderer and removed getComponentLib method in AppFactory.
    - Interface will register component library during app registration in AppFactory.
Improvements:
    - Clean up renderToTarget method for ReactRender
    - Updated getTopComponent method in ReactAppComponentComposite to match changes in AppFactory.
    - Updated renderToTarget method in ReactAppRendererComposite to match changes in AppFactory.
Bug fixes:
    - Fixed repeat method in EventStreamComposite. The method only repeat once for first event. It is now fixed and will repeat for all incoming events.
```
**Development Beta Version 0.1.0-beta7 (9/21/2016)**
```
Notes:
New Features:
Breaking Changes:
    - Changed how Hflow.Event.create method read in event map object.
Improvements:
Bug fixes:
    - Fixed repeat method in EventStreamComposite. The method only repeat once for first event. It is now fixed and will repeat for all incoming events.
```
**Development Beta Version 0.1.0-beta8 (9/22/2016)**
```
Notes:
New Features:
Breaking Changes:
    - Changed how Hflow.Event.create method read in event map object.
Improvements:
Bug fixes:
    - Fixed Hflow.Event.create method. Incorrectly generate event Ids for RESPONSE.TO.*.ERROR.
```
**Development Beta Version 0.1.0-beta9 (9/26/2016)**
```
Notes:
New Features:
Breaking Changes:
Improvements:
    - Added NOT_MODIFIED response in Hflow.Event.create method.
    - Methods registerComponentLib and reflectStateOf now return an instance of the interface in InterfaceFactory.
    - Reimplemented how Hflow object is imported.
    - Reimplemented how operators are applied to event stream for EventStreamComposite. This new implementation prevents operator methods from executing twice.
Bug fixes:
    - Fixed props mutation calls in methods componentWillMount, componentDidMount, and componentWillReceiveProps for ReactComponentComposite. The fix was to allow fallback to current props of the new props mutator.
```
**Development Beta Version 0.1.0-beta10 (10/03/2016)**
```
Notes:
New Features:
Breaking Changes:
    - Removed default style state object from InterfaceFactory.
    - Removed method getComponentLib from exception keys for ReactComponentComposite. Component will not have access to interface's getComponentLib method.
    - Added methods incoming & outgoing to exception keys for ReactComponentComposite. Component will have access to interface's event stream incoming & outgoing methods.
Improvements:
Bug fixes:
```
**Development Beta Version 0.1.0-beta11 (10/14/2016)**
```
Notes:
New Features:
    - Added toPureComponent method for ReactComponentComposite.
    - Added oneOf and oneOfType React PropTypes checking.
Breaking Changes:
    - Removed methods incoming & outgoing from exception keys for ReactComponentComposite. Component will NOT have access to interface's event stream incoming & outgoing methods.
Improvements:
    - Refactored DataElement descriptors and presets. 
Bug fixes:
```
