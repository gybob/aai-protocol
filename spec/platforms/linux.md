# Linux: DBus

## Automation Mechanism

**DBus** is the standard message bus system for Linux desktop environments, supported by most desktop applications.

**IPC Method: DBus IPC**

- DBus provides inter-process message passing
- This is the standard IPC mechanism for Linux desktops

## Example

### Python

```python
import dbus

bus = dbus.SessionBus()
mail_obj = bus.get_object('org.example.Mail', '/org/example/Mail')
mail_iface = dbus.Interface(mail_obj, 'org.example.Mail')

mail_iface.send_email("alice@example.com", "Hello", "Hi Alice...")
```

## Integration Guide

### Existing automation support

If the application already supports DBus, **zero code** is needed to integrate with AAI:

1. Confirm DBus service name, object path, interface
2. Write `aai.json` configuration file
3. Place in `~/.aai/<appId>/aai.json`
4. Done!

### No automation support

If the application has no automation support, you need to:

1. Implement DBus interface
2. Write `aai.json` configuration file

## aai.json Fields

| Field                                   | Type    | Description                                                   |
| --------------------------------------- | ------- | ------------------------------------------------------------- |
| `platforms.linux.automation`            | string  | Automation type: `dbus`                                       |
| `platforms.linux.service`               | string  | DBus service name (e.g., `org.example.Mail`)                  |
| `platforms.linux.object`                | string  | DBus object path (e.g., `/org/example/Mail`)                  |
| `platforms.linux.interface`             | string  | DBus interface name (e.g., `org.example.Mail`)                |
| `platforms.linux.tools[].method`        | string  | DBus method name (e.g., `SendEmail`)                          |
| `platforms.linux.tools[].output_parser` | string  | Output parsing method: `json` (assumes JSON return), `string` |
| `platforms.linux.tools[].timeout`       | integer | Timeout in seconds, default 30                                |

---

[Back to Spec Index](../README.md) | [Back to Platforms](./macos.md)
