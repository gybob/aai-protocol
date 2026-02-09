# 错误处理

Gateway 应返回标准化的错误响应。

## 错误响应格式

```json
{
  "jsonrpc": "2.0",
  "id": 3,
  "error": {
    "code": -32001,
    "message": "Automation failed",
    "data": {
      "type": "EXECUTION_FAILED",
      "detail": "Script execution timed out after 30 seconds"
    }
  }
}
```

## 错误码定义

| 错误码 | 类型                     | 描述                                           |
| ------ | ------------------------ | ---------------------------------------------- |
| -32001 | AUTOMATION_FAILED        | 自动化脚本执行失败                              |
| -32002 | APP_NOT_FOUND            | 目标应用未安装或无法找到                         |
| -32003 | TOOL_NOT_FOUND           | 请求的工具在 aai.json 中不存在                   |
| -32004 | PERMISSION_DENIED        | 权限不足，需要用户授权                           |
| -32005 | INVALID_PARAMS           | 参数校验失败                                    |
| -32006 | AUTOMATION_NOT_SUPPORTED | 平台不支持指定的自动化类型                       |
| -32007 | AAI_JSON_INVALID         | aai.json 格式错误或不符合 Schema                 |
| -32008 | TIMEOUT                  | 操作超时                                        |
| -32009 | APP_NOT_RUNNING          | 应用未运行且无法启动                             |
| -32010 | SCRIPT_PARSE_ERROR       | 脚本解析错误                                    |
| -32011 | AUTH_REQUIRED            | 需要 OAuth 授权，用户需通过浏览器进行授权         |
| -32012 | AUTH_EXPIRED             | OAuth 令牌已过期且刷新失败                       |
| -32013 | API_REQUEST_FAILED       | REST API 请求失败（HTTP 4xx/5xx）                |
| -32014 | AUTH_CONFIG_INVALID      | 认证配置无效（缺少 env_var、OAuth 配置错误等）    |

---

[返回规范索引](./README.md)
