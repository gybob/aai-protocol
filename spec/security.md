# Security Model

AAI uses operating system's native security mechanisms, no additional authorization protocol needed.

## Platform Authorization Overview

| Platform    | Authorization Mechanism                                | User Experience                                                                            |
| ----------- | ------------------------------------------------------ | ------------------------------------------------------------------------------------------ |
| **macOS**   | System TCC (Transparency, Consent, and Control)        | First-time automation tool use popup: "AAI Gateway wants to control Mail" -> [Allow]/[Deny] |
| **Windows** | UAC (User Account Control) or application's own prompt | Some apps show security warning when using COM for the first time                          |
| **Linux**   | Polkit or desktop environment security framework       | System-level security prompt                                                               |

## macOS TCC Authorization Flow

```
1. Agent requests to call Mail application
   ↓
2. Gateway executes AppleScript
   ↓
3. macOS detects automation call
   ↓
4. System popup (first time):
   ┌─────────────────────────────────────┐
   │  "AAI Gateway" wants to control "Mail"   │
   │                                     │
   │  If you don't trust this application, │
   │  please deny it.                     │
   │                                     │
   │  [Deny]               [OK]          │
   └─────────────────────────────────────┘
   ↓
5. User clicks [OK]
   ↓
6. System records authorization
   ↓
7. Subsequent calls don't require popup
```

## Windows COM Security Flow

```
1. Agent requests to call Outlook
   ↓
2. Gateway creates COM object
   ↓
3. Windows checks COM security settings
   ↓
4. Some apps show popup (first time):
   ┌─────────────────────────────────────┐
   │  Allow this website to open Outlook?   │
   │                                     │
   │  [Don't Allow]       [Allow]         │
   └─────────────────────────────────────┘
   ↓
5. User clicks [Allow]
   ↓
6. Subsequent calls may still require confirmation (depends on app settings)
```

**Note:** AAI doesn't enforce Gateway identity verification, fully trusting the operating system and the application's own security mechanisms.

---

[Back to Spec Index](./README.md)
