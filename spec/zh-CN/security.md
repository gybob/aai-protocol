# 安全模型

AAI 使用操作系统的原生安全机制，无需额外的授权协议。

## 平台授权概览

| 平台        | 授权机制                                                   | 用户体验                                                                                   |
| ----------- | ---------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| **macOS**   | 系统 TCC（Transparency, Consent, and Control）              | 首次使用自动化工具时弹窗提示："AAI Gateway 想要控制 Mail" -> [允许]/[拒绝]                        |
| **Windows** | UAC（User Account Control）或应用程序自身的提示               | 部分应用在首次使用 COM 时会显示安全警告                                                         |
| **Linux**   | Polkit 或桌面环境安全框架                                    | 系统级安全提示                                                                               |

## macOS TCC 授权流程

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

## Windows COM 安全流程

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

**注意：** AAI 不强制执行 Gateway 身份验证，完全信任操作系统及应用程序自身的安全机制。

---

[← 返回规范索引](./README.md)
