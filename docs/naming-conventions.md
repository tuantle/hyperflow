# Event Stream Id Naming

----

# Interface:
For incoming and outgoing events, use the prefix _on-\*_. Use present tense verb for action. See the example below.  
> _on-save-button-press_

# Store/Service:
For incoming event, use the prefix _do-\*_. Use present tense verb for action. See the example below.  
> _do-update-state_  

For outgoing event, use the prefix _as-\*_. Use past tense verb for action. See the example below.  
> _as-state-mutated_  

For situations where request/response type messaging is needed. The prefixes are _request-for-\*_ and _response-with-\*_ or _response-to-\*_
> **Outgoing**: _request-for-server-data_  
> **Incoming**: _response-with-server-data_  

When the response event has success or error type. Use postfix _\*-success_ or _\*-error_. See the example below.
> **Outgoing**: _request-for-data-write_  
> **Incoming**: _response-to-data-write-ok  
> **Incoming**: _response-to-data-write-error_

Use present tense verb for action for request and response types.  

# Domain:
For domain to store/service, it has to maintain the conventions for incoming and outgoing events from store/service.
For domain to domain, use prefix _broadcast-\*_. . See the example below.\*
> **Outgoing**: _broadcast-data_
