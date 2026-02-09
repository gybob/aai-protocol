# Why AAI?

## GUI vs AAI: Two Interaction Paradigms

```
GUI Era:   Human <-> Visual Interface <-> Mouse/Keyboard <-> Event Handling <-> Business Logic
AAI Era:   Agent <-> Structured Commands (JSON) <-> Direct Invocation <-> Business Logic
```

AI Agents are becoming increasingly powerful -- capable of understanding complex tasks, planning execution steps, and coordinating multiple workflows. But when they need to operate actual applications, they are still forced to "watch screens and click buttons" like humans.

## Current Automation Limitations

| Tool Type | Examples | How It Works |
|-----------|----------|--------------|
| Browser Automation | Playwright MCP, Chrome DevTools MCP | DOM selectors or visual recognition -> Simulate clicks |
| Desktop Automation | Open Interpreter, Computer Use | Screenshots + visual recognition -> GUI interaction |

These tools still operate through the GUI layer, simulating human interactions rather than directly invoking application capabilities.

| Limitation | Description |
|------------|-------------|
| **Slow** | GUI automation takes seconds per operation; direct IPC takes milliseconds |
| **Cannot parallelize** | Desktop focus limitations prevent coordinating multiple apps simultaneously |
| **Fragile** | UI changes, popups, resolution differences break automation |

## Dual Interface Architecture

Future applications should provide two independent interfaces:

```
                Future Application
 ┌──────────────────┐    ┌──────────────────┐
 │  Human Visual UI  │    │  Agent Interface  │
 │     (GUI)         │    │     (AAI)         │
 │                   │    │                   │
 │  Buttons & Forms  │    │  Structured Tools │
 │  Drag & Drop      │    │  Native IPC       │
 │  Instant Feedback │    │  Parallel Support │
 └────────┬──────────┘    └────────┬──────────┘
          │                        │
          └──────────┬─────────────┘
                     │
          ┌──────────┴──────────┐
          │   Core Logic Layer   │
          │   (Business Logic)   │
          └──────────────────────┘
```

## AAI's Position in the Agent Stack

```
┌──────────────────────────────────────┐
│  Model (GPT/Claude) - Intelligence   │
├──────────────────────────────────────┤
│  Context (MCP) - Model gets info     │
├──────────────────────────────────────┤
│  Action (AAI) - Model executes ops   │  <-- This protocol
├──────────────────────────────────────┤
│  Platform (OS/Browser) - Carrier     │
└──────────────────────────────────────┘
```

AAI is the Agent execution layer, based on MCP standards, with zero intrusion to existing frameworks.
