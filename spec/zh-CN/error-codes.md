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

| 错误码     | 类型                     | 说明                                                  |
| ---------- | ------------------------ | ----------------------------------------------------- |
| -32001     | AUTOMATION_FAILED        | 自动化脚本执行失败                                      |
| -32002     | APP_NOT_FOUND            | 目标应用未安装或无法找到                                  |
| -32003     | TOOL_NOT_FOUND           | 请求的工具在 aai.json 中不存在                           |
| -32004     | PERMISSION_DENIED        | 权限不足，需要用户授权                                   |
| -32005     | INVALID_PARAMS           | 参数校验失败                                            |
| -32006     | AUTOMATION_NOT_SUPPORTED | 平台不支持指定的自动化类型                                |
| -32007     | AAI_JSON_INVALID         | aai.json 格式错误或不符合 Schema                        |
| -32008     | TIMEOUT                  | 操作超时                                               |
| -32009     | APP_NOT_RUNNING          | 应用未运行且无法启动                                     |
| -32010     | SCRIPT_PARSE_ERROR       | 脚本解析错误                                            |

---

[← 返回规范索引](./README.md)
