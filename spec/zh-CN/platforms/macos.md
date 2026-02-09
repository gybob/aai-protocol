# macOS：AppleScript / JXA

## 自动化机制

**AppleScript** 是 macOS 的原生脚本语言，几乎所有系统应用和许多第三方应用都支持。

**JXA (JavaScript for Automation)** 是 AppleScript 的现代替代方案，使用 JavaScript 语法，在开发者中更为流行。

**IPC 方式：AppleEvents**

- AppleScript 底层使用 AppleEvents 进行进程间通信
- 这是 macOS 原生的 IPC 机制，性能优异

## 示例

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

## 集成指南

### 已有自动化支持

如果应用已经支持 AppleScript 或 JXA，集成 AAI **无需编写任何代码**：

1. 编写 `aai.json` 配置文件
2. 放置到 `~/.aai/<appId>/aai.json`
3. 完成！

### 无自动化支持

如果应用没有自动化支持，你需要：

1. 在 `Info.plist` 中启用 AppleScript：
   ```xml
   <key>NSAppleScriptEnabled</key>
   <true/>
   ```
2. 实现脚本命令（Swift/ObjC）或利用 JXA
3. 编写 `aai.json` 配置文件

## aai.json 字段

| 字段                                    | 类型    | 说明                                                                              |
| --------------------------------------- | ------- | --------------------------------------------------------------------------------- |
| `platforms.macos.automation`            | string  | 自动化类型：`applescript` 或 `jxa`                                                |
| `platforms.macos.tools[].script`        | string  | 脚本模板，支持 `${param}` 占位符                                                  |
| `platforms.macos.tools[].output_parser` | string  | 输出解析方式：`result as text`（字符串）、`result as record`（字典）               |
| `platforms.macos.tools[].timeout`       | integer | 超时时间（秒），默认 30                                                            |

---

[← 返回规范索引](../README.md) | [Windows 平台 →](./windows.md)
