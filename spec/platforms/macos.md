# macOS: AppleScript / JXA

## Automation Mechanism

**AppleScript** is macOS's native scripting language, supported by almost all system applications and many third-party applications.

**JXA (JavaScript for Automation)** is AppleScript's modern alternative using JavaScript syntax, more popular among developers.

**IPC Method: AppleEvents**

- AppleScript uses AppleEvents for inter-process communication underneath
- This is macOS's native IPC mechanism with excellent performance

## Examples

### AppleScript

```applescript
tell application "Mail"
    set newMessage to make new outgoing message with properties {subject:"Hello", content:"Hi Alice...", visible:false}
    tell newMessage
        make new to recipient at beginning of to recipients with properties {address:"alice@example.com"}
        send
    end tell
end tell
```

### JXA (JavaScript for Automation)

```javascript
const Mail = Application('Mail');
Mail.activate();
const msg = Mail.OutgoingMessage({
  subject: 'Hello',
  content: 'Hi Alice...',
  visible: false,
});
Mail.outgoingMessages.push(msg);
msg.toRecipients.push(Mail.Recipient({ address: 'alice@example.com' }));
msg.send();
```

## Integration Guide

### Existing automation support

If the application already supports AppleScript or JXA, **zero code** is needed to integrate with AAI:

1. Write `aai.json` configuration file
2. Place in `~/.aai/<appId>/aai.json`
3. Done!

### No automation support

If the application has no automation support, you need to:

1. Enable AppleScript in `Info.plist`:
   ```xml
   <key>NSAppleScriptEnabled</key>
   <true/>
   ```
2. Implement script commands (Swift/ObjC) or leverage JXA
3. Write `aai.json` configuration file

## aai.json Fields

| Field                                   | Type    | Description                                                                       |
| --------------------------------------- | ------- | --------------------------------------------------------------------------------- |
| `platforms.macos.automation`            | string  | Automation type: `applescript` or `jxa`                                           |
| `platforms.macos.tools[].script`        | string  | Script template, supports `${param}` placeholders                                 |
| `platforms.macos.tools[].output_parser` | string  | Output parsing method: `result as text` (string), `result as record` (dictionary) |
| `platforms.macos.tools[].timeout`       | integer | Timeout in seconds, default 30                                                    |

---

[Back to Spec Index](../README.md) | [Back to Platforms](./windows.md)
