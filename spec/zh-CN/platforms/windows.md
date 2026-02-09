# Windows：COM 自动化

## 自动化机制

**COM (Component Object Model)** 是 Windows 的二进制接口标准，几乎所有 Windows 应用和 Office 套件都支持。

**IPC 方式：COM IPC**

- COM 使用 IDispatch 接口进行跨进程调用
- 这是 Windows 原生的 IPC 机制，性能优异

## 示例

### PowerShell

```powershell
$outlook = New-Object -ComObject Outlook.Application
$mail = $outlook.CreateItem(0)
$mail.To = "alice@example.com"
$mail.Subject = "Hello"
$mail.Body = "Hi Alice..."
$mail.Send()
```

### Python (pywin32)

```python
import win32com.client

outlook = win32com.client.Dispatch("Outlook.Application")
mail = outlook.CreateItem(0)
mail.To = "alice@example.com"
mail.Subject = "Hello"
mail.Body = "Hi Alice..."
mail.Send()
```

## 集成指南

### 已有自动化支持

如果应用已经支持 COM，集成 AAI **无需编写任何代码**：

1. 确认应用的 ProgID（例如 `MyApp.Application`）
2. 编写 `aai.json` 配置文件
3. 放置到 `%USERPROFILE%\.aai\<appId>\aai.json`
4. 完成！

### 无自动化支持

如果应用没有自动化支持，你需要：

1. 实现 COM IDispatch 接口（C#/C++）
2. 注册 ProgID
3. 编写 `aai.json` 配置文件

## aai.json 字段

| 字段                                          | 类型    | 说明                                                                                                                             |
| --------------------------------------------- | ------- | -------------------------------------------------------------------------------------------------------------------------------- |
| `platforms.windows.automation`                | string  | 自动化类型：`com`                                                                                                                |
| `platforms.windows.progid`                    | string  | COM ProgID（例如 `Outlook.Application`）                                                                                         |
| `platforms.windows.tools[].script`            | array   | COM 操作序列                                                                                                                     |
| `platforms.windows.tools[].script[].action`   | string  | 操作类型：`create`（创建对象）、`call`（调用方法）、`set`（设置属性）、`get`（获取属性）、`return`（返回结果）                    |
| `platforms.windows.tools[].script[].var`      | string  | 变量名（用于存储返回值）                                                                                                         |
| `platforms.windows.tools[].script[].object`   | string  | 对象引用（例如 `mail`、`app`）                                                                                                   |
| `platforms.windows.tools[].script[].progid`   | string  | ProgID（仅用于 `create` 操作）                                                                                                   |
| `platforms.windows.tools[].script[].method`   | string  | 方法名（仅用于 `call` 操作）                                                                                                     |
| `platforms.windows.tools[].script[].property` | string  | 属性名（仅用于 `set`/`get` 操作）                                                                                                |
| `platforms.windows.tools[].script[].value`    | string  | 属性值（支持 `${param}` 占位符）                                                                                                 |
| `platforms.windows.tools[].script[].args`     | array   | 方法参数（支持 `${param}` 占位符）                                                                                               |
| `platforms.windows.tools[].output_parser`     | string  | 输出解析方式：`last_result`（最后一次操作的返回值）                                                                               |
| `platforms.windows.tools[].timeout`           | integer | 超时时间（秒），默认 30                                                                                                          |

---

[← 返回规范索引](../README.md) | [Linux 平台 →](./linux.md)
