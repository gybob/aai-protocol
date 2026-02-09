# Linux：DBus

## 自动化机制

**DBus** 是 Linux 桌面环境的标准消息总线系统，大多数桌面应用都支持。

**IPC 方式：DBus IPC**

- DBus 提供进程间消息传递
- 这是 Linux 桌面的标准 IPC 机制

## 示例

### Python

```python
import dbus

bus = dbus.SessionBus()
mail_obj = bus.get_object('org.example.Mail', '/org/example/Mail')
mail_iface = dbus.Interface(mail_obj, 'org.example.Mail')

mail_iface.send_email("alice@example.com", "Hello", "Hi Alice...")
```

## 集成指南

### 已有自动化支持

如果应用已经支持 DBus，集成 AAI **无需编写任何代码**：

1. 确认 DBus 服务名、对象路径、接口
2. 编写 `aai.json` 配置文件
3. 放置到 `~/.aai/<appId>/aai.json`
4. 完成！

### 无自动化支持

如果应用没有自动化支持，你需要：

1. 实现 DBus 接口
2. 编写 `aai.json` 配置文件

## aai.json 字段

| 字段                                    | 类型    | 说明                                                          |
| --------------------------------------- | ------- | ------------------------------------------------------------- |
| `platforms.linux.automation`            | string  | 自动化类型：`dbus`                                            |
| `platforms.linux.service`               | string  | DBus 服务名（例如 `org.example.Mail`）                        |
| `platforms.linux.object`                | string  | DBus 对象路径（例如 `/org/example/Mail`）                     |
| `platforms.linux.interface`             | string  | DBus 接口名（例如 `org.example.Mail`）                        |
| `platforms.linux.tools[].method`        | string  | DBus 方法名（例如 `SendEmail`）                               |
| `platforms.linux.tools[].output_parser` | string  | 输出解析方式：`json`（假定返回 JSON）、`string`               |
| `platforms.linux.tools[].timeout`       | integer | 超时时间（秒），默认 30                                       |

---

[← 返回规范索引](../README.md) | [macOS 平台 →](./macos.md)
