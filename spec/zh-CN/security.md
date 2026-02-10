# 安全模型

AAI 针对桌面应用和 Web/SaaS 应用采用不同的安全机制：

- **桌面应用**：操作系统原生授权（TCC、UAC、Polkit）
- **Web/SaaS 应用**：OAuth 2.0 / API Key 认证，由 Gateway 管理

## 桌面应用授权

| 平台        | 授权机制                                           | 用户体验                                                                               |
| ----------- | -------------------------------------------------- | -------------------------------------------------------------------------------------- |
| **macOS**   | 系统 TCC（Transparency, Consent, and Control）      | 首次使用自动化工具时弹窗："AAI Gateway wants to control Mail" -> [允许]/[拒绝]            |
| **Windows** | UAC（User Account Control）或应用自身的安全提示      | 部分应用在首次使用 COM 时显示安全警告                                                     |
| **Linux**   | Polkit 或桌面环境安全框架                            | 系统级安全提示                                                                          |

### macOS TCC 授权流程

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

### Windows COM 安全流程

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

## Web / SaaS 应用授权

对于基于 Web 的应用，Gateway 负责处理 OAuth 2.0 认证或 API Key 管理。

### 用户确认（域名与证书验证）

在为 Web 应用发起任何认证流程之前，Gateway **必须**向用户显示域名和证书信息：

```
1. Agent 首次调用 Web 应用工具
   ↓
2. Gateway 显示域名验证提示：
    ┌──────────────────────────────────────────────┐
    │  AAI Gateway - Web 应用授权          │
    │                                              │
    │  域名：       api.notion.com                │
    │  SSL 证书：     ✅ 有效（由 DigiCert 签发） │
    │  应用名称：     Notion                        │
    │  权限范围：  read_content, update_content  │
    │                                              │
    │  [取消]                    [授权]           │
    └──────────────────────────────────────────────┘
   ↓
3a. 用户点击 [取消] → 返回 AUTH_REQUIRED 错误
3b. 用户点击 [授权] → 进入 OAuth 或 API Key 流程
```

这确保用户知晓他们正在授予访问权限的域名，并可以验证 SSL 证书是否有效。

### OAuth 2.0 授权流程

```
1. Agent calls a web tool (e.g., Notion search)
   ↓
2. Gateway checks: does ~/.aai/tokens/com.notion.api.json exist?
   ↓
3a. Token exists and valid → inject into request, proceed to step 7
3b. Token exists but expired → auto-refresh via token_url, proceed to step 7
3c. No token → start OAuth flow (step 4)
   ↓
4. Gateway opens browser for user authorization:
   ┌──────────────────────────────────────┐
   │  Notion wants you to grant access    │
   │                                      │
   │  AAI Gateway is requesting:          │
   │  • Read your content                 │
   │  • Update your content               │
   │                                      │
   │  [Cancel]            [Allow Access]  │
   └──────────────────────────────────────┘
   ↓
5. User clicks [Allow Access]
   ↓
6. Gateway receives auth code → exchanges for access + refresh tokens
   → stores in ~/.aai/tokens/<appId>.json
   ↓
7. Gateway sends API request with token in Authorization header
   ↓
8. SaaS app returns response → Gateway returns to Agent
```

### API Key / Bearer Token 流程

```
1. Agent calls a web tool
   ↓
2. Gateway reads API key from environment variable (defined in aai.json auth.env_var)
   ↓
3a. Key found → inject into request header/query
3b. Key not found → return PERMISSION_DENIED error with instructions
   ↓
4. Send API request → return response to Agent
```

### 令牌存储

| 平台 | 路径 |
|------|------|
| macOS / Linux | `~/.aai/tokens/<appId>.json` |
| Windows | `%USERPROFILE%\.aai\tokens\<appId>.json` |

令牌文件内容：
```json
{
  "access_token": "...",
  "refresh_token": "...",
  "expires_at": 1700000000,
  "token_type": "Bearer"
}
```

### 安全原则

- **Gateway 绝不在 aai.json 中存储客户端密钥** -- 密钥单独存储在 Gateway 配置中
- **令牌存储在本地**用户主目录中，不会传输给 Agent 或 LLM
- **Agent 只能看到 API 响应**，永远看不到原始令牌
- **用户可随时撤销访问权限**，通过 SaaS 提供商的设置页面或删除令牌文件
- **权限范围在 aai.json 中显式声明**，让用户知晓请求了哪些访问权限

---

[返回规范索引](./README.md)
