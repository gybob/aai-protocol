# AAI Gateway Development Plan

基于 README.md 中的 TODO 列表制定的详细开发计划

---

## Phase 0: 项目初始化 (Week 1)

### 0.1 技术栈选择

**决策**: 选择 TypeScript + Node.js 作为主实现语言

**理由**:

- MCP TypeScript SDK 官方支持完善
- 跨平台支持良好
- 类型安全，适合复杂的协议实现
- 社区生态丰富

**技术栈确定**:

```
- MCP Server: @modelcontextprotocol/sdk
- aai.json 解析: ajv (JSON Schema 验证)
- macOS: osascript CLI + child_process
- Windows: node-ffi-napi (COM 调用)
- Linux: dbus-typescript
- 构建: vite 或 rollup
- 测试: vitest
- 日志: pino (结构化日志)
```

### 0.2 项目初始化

**任务**:

- [x] 初始化 npm 项目 (package.json)
- [x] 配置 TypeScript (tsconfig.json)
- [x] 配置 ESLint + Prettier
- [x] 配置 vitest 测试环境
- [x] 配置 vite 构建工具
- [x] 创建基础目录结构
- [x] 配置 Git hooks (husky + lint-staged) (Skipped for v1.0)

**输出**:
...

- [x] 实现基础请求/响应处理
- [x] 添加健康检查端点 (Skipped: Use standard MCP ping)

**文件**: `src/mcp/server.ts`

**API 端点**:

- `ping` - 健康检查
- `resources/list` - 列出所有应用
- `resources/read` - 读取应用配置
- `tools/call` - 执行工具调用

### 1.2 Resource: resources/list

**功能**: 列出所有可用的 AAI 应用

**任务**:

- [x] 扫描 `~/.aai/` 目录
- [x] 读取所有 aai.json 文件
- [x] 解析 appId, name, description
- [x] 返回 MCP resource 列表格式

**返回格式**:

```json
{
  "resources": [
    {
      "uri": "app:com.apple.mail",
      "name": "Mail",
      "description": "Apple's native email client",
      "mimeType": "application/aai+json"
    }
  ]
}
```

**测试用例**:

- 空目录返回空列表
- 无效的 aai.json 应被跳过
- 正确解析有效的配置

### 1.3 Resource: resources/read

**功能**: 读取特定应用的 aai.json 内容

**任务**:

- [x] 解析 URI 格式 `app:<appId>`
- [x] 验证 appId 存在
- [x] 读取并返回 aai.json 内容
- [x] 支持平台过滤 (只返回当前平台的配置)

**错误处理**:

- APP_NOT_FOUND (-32002)
- AAI_JSON_INVALID (-32007)

**测试用例**:

- 返回完整 aai.json
- 返回单平台配置
- 处理不存在的 appId

### 1.4 Tool: tools/call (基础框架)

**功能**: 执行应用工具调用

**任务**:

- [x] 解析工具名称格式 `<appId>:<toolName>`
- [x] 验证工具存在
- [x] 参数验证
- [x] 路由到对应执行器

**验证标准**:

- 工具名称格式正确
- 参数符合 schema
- 错误码返回规范

**验收标准**:

- MCP 服务器可以正常启动
- resources/list 返回应用列表
- resources/read 返回应用配置
- tools/call 基础路由正常

---

## Phase 2: 核心执行器实现 (Week 4-6)

### 2.1 执行器抽象接口

**任务**:

- [x] 定义 AutomationExecutor 接口
- [x] 定义执行参数类型
- [x] 定义执行结果类型
- [x] 实现执行器工厂模式

**文件**: `src/executors/base.ts`

**接口定义**:

```typescript
interface AutomationExecutor {
  execute(script: string, params: Record<string, any>): Promise<ExecutionResult>;
}
```

### 2.2 macOS 执行器 (AppleScript/JXA)

**任务**:

- [x] 实现 AppleScript 参数替换 (`${param}`)
- [x] 实现 osascript CLI 调用
- [x] 处理 TCC 权限请求
- [x] 解析输出结果 (JSON/string)
- [x] 实现输出解析器 (output_parser)

**文件**: `src/executors/macos.ts`

**功能**:

- 支持 AppleScript 和 JXA 两种模式
- 自动处理单行和多行脚本
- 超时控制 (默认 30 秒)

**测试**:

- 使用系统应用 (Mail, Calendar)
- 测试参数替换
- 测试输出解析
- 模拟 TCC 权限拒绝

### 2.3 Windows 执行器 (COM)

**任务**:

- [x] 实现 COM 对象创建
- [x] 实现结构化脚本执行
- [x] 处理 UAC 提示 (via PowerShell error handling)
- [x] 实现 ProgID 映射
- [x] 解析返回值

### 2.4 Linux 执行器 (DBus)

**任务**:

- [x] 实现 DBus 连接
- [x] 实现方法调用
- [x] 解析服务名、对象路径、接口
- [x] 处理异步响应
- [x] JSON 输出解析

### 2.5 移动平台执行器 (Android + iOS)

**状态**: 已移除 (本次迭代不包含移动平台支持)

**文件**: `src/executors/ios.ts`

**依赖**: xcode, iOS Simulator

**验收标准**:

- 所有平台执行器接口一致
- 参数替换正常
- 输出解析正确
- 错误处理完善

---

## Phase 3: 应用发现和配置管理 (Week 7-8)

### 3.1 目录扫描

**任务**:

- [x] 递归扫描 `~/.aai/` 目录
- [x] 加载所有有效的 aai.json
- [x] 缓存配置信息
- [x] 监听文件变化 (Implemented)

**文件**: `src/config/discovery.ts`

**功能**:

- 支持自定义扫描路径
- 文件变化时自动重新加载
- 无效配置文件跳过并记录日志

### 3.2 自动发现功能 (macOS 示例)

**任务**:

- [x] 扫描系统应用目录
- [x] 检测 AppleScript/JXA 支持
- [x] 提取应用元数据
- [x] 生成基础 aai.json 模板

**文件**: `src/config/auto-discovery/macos.ts`

**检测方法**:

- 读取应用 Info.plist
- 检查 NSAppleScriptEnabled
- 尝试 osascript -e 'tell application "xxx"'

### 3.3 AI 驱动的描述符生成

**任务**:

- [x] 集成 LLM API (可选)
- [x] 分析应用自动化接口
- [x] 生成工具描述
- [x] 生成参数 schema

**文件**: `src/config/ai-generator.ts`

**输入**:

- 应用元数据
- AppleScript 术语字典 (sdef)
- 应用文档链接

**输出**:

- 完整的 aai.json 文件
- 工具描述
- 参数 schema

### 3.4 配置文件支持

**任务**:

- [x] 实现 `~/.aai/config.json` 加载
- [x] 支持配置项:
  - scanPaths: string[]
  - defaultTimeout: number
  - logLevel: string
  - aiApiEndpoint: string (可选)
- [x] 配置验证

**文件**: `src/config/gateway-config.ts`

**配置示例**:

```json
{
  "scanPaths": ["~/.aai"],
  "defaultTimeout": 30,
  "logLevel": "INFO",
  "aiApiEndpoint": ""
}
```

### 3.5 定期扫描和手动触发

**任务**:

- [x] 实现定时扫描任务
- [x] 实现 CLI 命令手动触发扫描
- [x] Web UI 触发扫描 (Phase 4)
- [x] CLI 生成命令 (`aai-gateway generate`)

**CLI 命令**:

```bash
aai-gateway scan          # 手动扫描
aai-gateway discover        # 自动发现
aai-gateway generate <app>  # AI 生成配置
```

**验收标准**:

- 能够扫描并加载所有应用
- 自动发现至少 macOS 应用
- AI 生成功能可用
- 配置文件正常工作

---

## Phase 4: 错误处理和日志系统 (Week 9)

### 4.1 标准化错误处理

**任务**:

- [x] 实现 AutomationError 类
- [x] 定义所有错误码 (-32001 到 -32010)
- [x] 实现错误码到消息映射
- [x] 添加重试机制

**文件**: `src/errors/automation-error.ts`
...

### 4.4 操作日志存储

**任务**:

- [x] 记录所有工具调用
- [x] 存储请求/响应 (Web UI 使用)
- [x] 支持过滤和查询 (In-memory implementation)
- [x] 日志轮转 (In-memory circular buffer)

**文件**: `src/utils/call-history.ts`

**存储格式**:

```typescript
interface CallLog {
  id: string;
  timestamp: Date;
  appId: string;
  tool: string;
  params: Record<string, any>;
  success: boolean;
  error?: string;
  duration: number;
}
```

**验收标准**:

- 所有错误码都有映射
- 重试机制正常工作
- 日志格式规范
- 可以查询历史记录

---

## Phase 5: Web UI (Week 10-11)

### 5.1 HTTP 服务器

**任务**:

- [x] 在 MCP 服务器基础上添加 HTTP 端点
- [x] 静态文件服务 (前端资源)
- [x] API 路由
- [x] WebSocket 支持 (Skipped for v1.0)

**文件**: `src/web/server.ts`

**端点**:

- `GET /` - Web UI 主页
- `GET /api/apps` - 应用列表
- `GET /api/apps/:appId` - 应用详情
- `POST /api/apps/:appId` - 保存应用配置
- `DELETE /api/apps/:appId` - 删除应用
- `GET /api/config` - Gateway 配置
- `POST /api/config` - 更新配置
- `GET /api/scan` - 触发扫描
- `GET /api/history` - 调用历史

### 5.2 前端界面

**任务**:

- [x] 技术栈选择 (React/Vue/Svelte, 推荐 React + Vite) (实际上使用了原生 HTML/JS)
- [x] 应用列表页面
- [x] 应用配置编辑器 (Read-only implemented)
- [x] 配置设置页面 (Read-only implemented)
- [x] 调用历史查看器

**文件**: `src/web/frontend/`

**页面**:

1. **应用管理** (`/apps`)
   - 列出所有应用
   - 添加/编辑/删除应用
   - 测试工具调用

2. **配置** (`/settings`)
   - 扫描路径配置
   - 超时设置
   - 日志级别

3. **历史** (`/history`)
   - 调用记录列表
   - 按应用/工具/时间过滤
   - 查看请求/响应详情

4. **测试工具** (`/test`)
   - 选择应用和工具
   - 填写参数
   - 执行并查看结果

### 5.3 实时更新 (可选)

**任务**:

- [x] WebSocket 连接 (Skipped for v1.0)
- [x] 扫描进度实时显示 (Skipped for v1.0)
- [x] 日志实时推送 (Skipped for v1.0)
- [x] 调用结果实时通知 (Skipped for v1.0)

**验收标准**:

- [x] Web UI 可以访问
- [x] 所有配置都可以通过 UI 管理 (查看)
- [x] 调用历史可以查看
- [x] 测试工具可用 (API端点就绪)

---

## Phase 6: 测试和质量保证 (Week 12)

### 6.1 单元测试

**任务**:

- [x] 执行器单元测试 (macOS, param-transform)
- [x] aai.json 解析测试
- [x] 错误处理测试
- [x] 日志系统测试
- [x] 配置加载测试
- [x] 自动发现测试

### 6.2 集成测试

**任务**:

- [x] MCP 服务器集成测试 (E2E covered this)
- [x] 端到端工具调用测试 (Reminders E2E)
- [x] 多平台执行器测试 (使用模拟) (Skipped: Lack of environment)
- [x] Web UI API 测试

### 6.3 E2E 测试

**任务**:

- [x] 完整工作流测试
  - 启动 Gateway
  - Agent 调用工具
  - 验证执行结果
- [x] Web UI 用户流程测试 (Skipped: Requires browser automation setup)

### 6.4 性能测试

(暂缓)
**任务**:

- [x] 并发调用测试 (Benchmark implemented)
- [x] 超时处理测试
- [x] 内存泄漏检测 (Script created: `scripts/memory-check.ts`)
- [x] 响应时间基准测试

---

## Phase 7: 文档和发布 (Week 13)

### 7.1 API 文档

**任务**:

- [x] 使用 TypeScript 类型生成 API 文档 (Manual markdown created)
- [x] 添加使用示例
- [x] 错误码文档
- [x] 配置文件文档

**工具**: TypeDoc (Optional, manual docs created in `docs/`)

### 7.2 用户文档

**任务**:

- [x] 安装指南
- [x] 快速开始
- [x] 配置说明
- [x] 故障排除
- [x] 常见问题 (Included in troubleshooting)

**更新 README.md**
...

- [x] CHANGELOG.md
- [x] 发布说明
- [x] Docker 镜像 (Skipped for v1.0)
- [x] NPM 包发布 (Ready)

**发布检查清单**:

- [x] 所有测试通过
- [x] 文档完整
- [x] 版本号更新
- [x] CHANGELOG 更新
- [x] tag 创建 (Ready)

---

## Phase 8: 后续优化 (Week 14+)

### 8.1 性能优化

- [x] 连接池管理 (Skipped for v1.0)
- [x] 结果缓存
- [x] 懒加载优化 (Implemented via progressive discovery)
- [x] 内存占用优化 (Skipped for v1.0)

### 8.2 安全加固

- [x] 输入验证增强 (Skipped for v1.0)
- [x] 权限审计日志 (Skipped for v1.0)
- [x] 沙箱模式 (Skipped for v1.0)
- [x] 速率限制

### 8.3 监控和指标

- [x] Prometheus 指标导出
- [x] 健康检查增强 (Skipped for v1.0)
- [x] 性能监控 dashboard (Skipped for v1.0)
- [x] 告警机制 (Skipped for v1.0)

---

## 里程碑总结

| 里程碑             | 周期       | 交付物                   |
| ------------------ | ---------- | ------------------------ |
| M1: 项目初始化     | Week 1     | 基础设施，目录结构       |
| M2: MCP 核心服务器 | Week 2-3   | MCP 通信，资源管理       |
| M3: 执行器实现     | Week 4-6   | 5 平台执行器完成         |
| M4: 应用发现       | Week 7-8   | 自动发现，AI 生成        |
| M5: 错误和日志     | Week 9     | 完善的错误处理，日志系统 |
| M6: Web UI         | Week 10-11 | 完整的管理界面           |
| M7: 测试和 QA      | Week 12    | 全面的测试覆盖           |
| M8: 发布           | Week 13    | v1.0.0 发布              |

---

## 技术债务和风险

### 技术债务

1. **跨平台测试**: 需要在每个平台上测试
2. **AI 集成**: LLM API 依赖，可能不稳定
3. **Web UI 复杂度**: 前端开发可能延长周期

### 风险

1. **平台权限**: TCC, UAC 可能影响用户体验
2. **应用兼容性**: 不是所有应用都支持自动化
3. **性能瓶颈**: 频繁的脚本调用可能影响性能

### 缓解措施

- 提供详细的权限指南
- 建立应用兼容性列表
- 实现结果缓存和连接池

---

## 资源需求

### 人力

- 1-2 名全栈开发者
- 1 名测试工程师 (可选)

### 硬件

- macOS 机器 (开发 + 测试)
- Windows 虚拟机 (测试)
- Linux 虚拟机 (测试)
- Android 设备/模拟器 (测试)

### 软件服务

- AI API 密钥 (可选)
- CI/CD 服务 (GitHub Actions)
- NPM 账号 (发布)

---

## 下一步行动

1. **确认技术栈**: TypeScript + Node.js
2. **初始化项目**: package.json, tsconfig.json
3. **实现 MCP 基础**: 使用 @modelcontextprotocol/sdk
4. **实现 macOS 执行器**: 作为第一个平台
5. **端到端测试**: 完整调用流程
6. **迭代其他平台**: Windows, Linux, 移动端

**预期**: 13 周完成 v1.0.0 MVP
