# [Hyperflow](https://github.com/tuantle/hyperflow)
## A state flow and mutation management toolkit & library for developing universal app

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
    - Added the optional Hf.Event.create method. This allows a more opinionated way of naming event Id.  
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
    - Minor tweak to Hf.Event.create method return object. Property key names are uppercased.
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
    - Changed how Hf.Event.create method read in event map object.
Improvements:
Bug fixes:
    - Fixed repeat method in EventStreamComposite. The method only repeat once for first event. It is now fixed and will repeat for all incoming events.
```
**Development Beta Version 0.1.0-beta8 (9/22/2016)**
```
Notes:
New Features:
Breaking Changes:
    - Changed how Hf.Event.create method read in event map object.
Improvements:
Bug fixes:
    - Fixed Hf.Event.create method. Incorrectly generate event Ids for RESPONSE.TO.*.ERROR.
```
**Development Beta Version 0.1.0-beta9 (9/26/2016)**
```
Notes:
New Features:
Breaking Changes:
Improvements:
    - Added NOT_MODIFIED response in Hf.Event.create method.
    - Methods registerComponentLib and reflectStateOf now return an instance of the interface in InterfaceFactory.
    - Reimplemented how Hf object is imported.
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
**Development Beta Version 0.1.0-beta12 (10/20/2016)**
```
Notes: Renamed Hflow to just Hf.
New Features:
Breaking Changes:
    - Renamed Hflow to just Hf.
Improvements:
    - Added flow type check to all source files.
    - Optimized code by moving function declaration inside other functions to the outside.
    - Reduced unnecessary console log for EventStreamComposite.
Bug fixes:
    - Fixed non-functional oneOF and oneTypeOf constrainable descriptors for DataElement.
```
**Development Beta Version 0.1.0-beta13 (10/25/2016)**
```
    Notes:
    New Features:
        - Added Added throttle stream operator method to EventStreamComposite.
        - Added delete query method to PGComposite.
    Breaking Changes:
    Improvements:
        - Code cleanups.
    Bug fixes:
        - Fixed propTypes and defaultProps for toPureComponent method. Allowed React factory function access to getInterface method. for ReactComponentComposite.
        - Fixed query results return for insert and update method for PGComposite.
```
**Development Beta Version 0.1.0-beta14 (11/02/2016)**
```
    Notes:
    New Features:
        - Added non empty check methods for string, array, and object for CommonElement.
        - Added reconfigState and reconfigStateAtPath methods for CompositeElement. reconfigState and reconfigStateAtPath methods can change the schema of state, where as mutateState and mutateStateAtPath cannot.
    Breaking Changes:
        - Renamed and reimplemented methods mutateState and mutateStateAtPath to reduceState and reduceStateAtPath for CompositeElement.
        - Code changed for read and format methods. Removed mutable flag for DataElement.
    Improvements:
    Bug fixes:
        - Reimplemented setContentItem method and fixed bugs in recallContentItem method for DataCursorElement.
        - Fixed typos in React propTypes setup and minor code cleanups. Removed unnecessary warning checks for ReactComponentComposite.
```
**Development Beta Version 0.1.0-beta15 (11/10/2016)**
```
    Notes:
    New Features:
        - Added resetState and flushState methods to CompositeElement.
        - Added reset method to StateReducerComposite and StateReconfigurationComposiste.
    Breaking Changes:
    Improvements:
        - Updated log method and added log history log cache to CommonElement.
        - Improved warning messages for deepStateReconfiguration method in CompositeElement.
    Bug fixes:
        - Fixed warning message in stronglyTypedPreset when setting null value.
        - Added mount stage flag to ReactComponentComposite. This prevents incoming stream from calling setState when component is about to unmount.
```
**Development Beta Version 0.1.0-beta16 (11/17/2016)**
```
    Notes:
    New Features:
        - Added implementations for toStandaloneComponent method for ReactAppComponentComposite (client web and native).
    Breaking Changes:
        - Renamed app run method to app stop in AppFactory.
    Improvements:
        - Added options arg start method in AppFactory and DomainFactory.
        - Added option to skip non-mutation referrals when updating mutation map in DataElement.
        - Improved all state reduce and re-config methods for CompositeElement.
    Bug fixes:
        - Removed all delay and debounce from event stream for DomainFactory, InterfaceFactory.
        - Fixed recallContentItem and recallAllContentItems methods in DataCursorElement.
```
**Development Beta Version 0.1.0-beta17 (11/27/2016)**
```
Notes:
New Features:
    - Added new stream diversion feature for incoming and outgoing stream operator in EventStreamComposite.
    - Added new backPressure operator to EventStreamComposite.
Breaking Changes:
Improvements:
    - Added debug option to log method in CommonElement.
Bug fixes:
    - Added back delay to store and services event streams in DomainFactory.
    - Fixed schema checking for register method in DomainFactory and AgentFactory.
    - Fixed React.PropTypes creations in ReactComponentComposite.
    - Fixed root write bug for write methods in AsyncStorageComposite and WebStorageComposite.
```
**Development Beta Version 0.1.0-beta18 (12/07/2016)**
```
Notes:
New Features:
    - Added stream diversion feature to stream operator in EventStreamComposite.
    - Added factory support for static definition.
    - Added excludedPathIds option to skip referrals at pathIds to refer method in TreeNodeElement.
    - Added freeze method for deep freezing object to CommonElement.
Breaking Changes:
    - Renames getStream to registerStream in EventStreamComposite.
Improvements:
    - Improved event stream activation sequence in start method for DomainFactory.
    - Improved reconfigState and reduceState methods in CompositeElement.
    - Removed updateStateAccessor method in CompositeElement. It is now merged into reduceState and reconfigState methods.
    - Improved collect and _deepMutate methods for CommonElement.
    - Moved state update into componentWillMount instead of componentDidMount for ReactComponentComposite.
Bug fixes:
    - Fixed bugs in timeTraverse method for StateTimeTraversalComposite.
```
**Development Beta Version 0.1.0-beta19 (01/04/2017)**
```
Notes:
New Features:
    - Added camelcaseToDash and dashToCamelcase methods to CommonElement.
Breaking Changes:
Improvements:
    - Updated to node 7.x preset dependencies. Added babelrc file.
    - Added support for pure component for InterfaceFactory.
    - Added support for force update event for ReactComponentComposite.
    - Added forceMutationEvent option to reconfig method.
Bug fixes:
    - Fixed peer domains registration for DomainFactory.
    - Added missing filter and flatMap to backPressure operator for EventStreamComposite.
```
**Development Beta Version 0.1.0-beta20 (01/07/2017)**
```
Notes:
New Features:
Breaking Changes:
Improvements:
Bug fixes:
    - Fixed implementation of toStandaloneComponent method for ReactAppComponentComposite.
    - Added property filter when updating component property during componentWillMount and componentWillReceiveProps calls for ReactComponentComposite.
```
**Development Beta Version 0.1.0-beta21 (01/08/2017)**
```
Notes:
New Features:
Breaking Changes:
Improvements:
    - Removed no empty object or array restriction when set content item for DataElement. Empty object or array is now reconfigurable like null.  
Bug fixes:
```
**Development Beta Version 0.1.0-beta22 (01/17/2017)**
```
Notes:
New Features:
Breaking Changes:
Improvements:
    - Added options to reset store & service state when stopping domain in DomainFactory.
    - Added option to app.stop when un-mounting component for toStandaloneComponent method in ReactAppComponentComposite.
    - Added timeout warning messages for start, stop, and restart methods in DomainFactory.
    - Cleanup and refactored restart method in AppFactory.
Bug fixes:
```
**Development Beta Version 0.1.0-beta23 (01/24/2017)**
```
Notes:
New Features:
Breaking Changes:
    - Removed toStandaloneComponent method from ReactAppComponentComposite. Reimplemented getTopComponent with option to covert to standalone component.
Improvements:
    - Added option to covert to standalone component for toComponent method in ReactComponentComposite.
Bug fixes:
```
**Development Beta Version 0.1.0-beta24 (01/25/2017)**
```
Notes:
New Features:
Breaking Changes:
Improvements:
    - Code refactoring of how module dependencies are imported.
Bug fixes:
    - Hf.DEVELOPMENT flag should have the correct value after Hf.init is called.
```
