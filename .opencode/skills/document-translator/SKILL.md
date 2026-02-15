---
name: document-translator
description: Guide for translating English documentation to Chinese, following existing Chinese documentation patterns in the AAI protocol project
disable-model-invocation: false
---

# AAI 文档翻译助手

## 我能做什么
- 将英文文档翻译为中文，遵循项目现有的中文文档风格和规范
- 确保翻译后的文档与项目中文目录结构保持一致
- 保持技术术语的准确性和一致性
- 处理专业文档特有的格式和结构
- **自动检测需要翻译或同步的文档**（无需询问用户）

## 何时使用我
- 当项目中有新增的英文文档需要翻译为中文时
- 当需要更新或完善现有中文文档的翻译质量时
- 当需要确保新翻译的文档与项目中文文档风格保持一致时
- 当用户说"翻译文档"时，**自动执行**，不要询问翻译哪个文件

## 项目文档清单

### 根目录
| 英文文档 | 中文文档 | 状态 |
|----------|----------|------|
| `README.md` | `README.zh-CN.md` | ✅ 已翻译 |

### spec/ 目录
| 英文文档 | 中文文档 | 状态 |
|----------|----------|------|
| `spec/README.md` | `spec/zh-CN/README.md` | ✅ 已翻译 |
| `spec/overview.md` | `spec/zh-CN/overview.md` | ✅ 已翻译 |
| `spec/architecture.md` | `spec/zh-CN/architecture.md` | ✅ 已翻译 |
| `spec/aai-json.md` | `spec/zh-CN/aai-json.md` | ✅ 已翻译 |
| `spec/call-flow.md` | `spec/zh-CN/call-flow.md` | ✅ 已翻译 |
| `spec/discovery.md` | `spec/zh-CN/discovery.md` | ✅ 已翻译 |
| `spec/security.md` | `spec/zh-CN/security.md` | ✅ 已翻译 |
| `spec/error-codes.md` | `spec/zh-CN/error-codes.md` | ✅ 已翻译 |
| `spec/glossary.md` | `spec/zh-CN/glossary.md` | ✅ 已翻译 |

### spec/platforms/ 目录
| 英文文档 | 中文文档 | 状态 |
|----------|----------|------|
| `spec/platforms/web.md` | `spec/zh-CN/platforms/web.md` | ✅ 已翻译 |
| `spec/platforms/macos.md` | `spec/zh-CN/platforms/macos.md` | ✅ 已翻译 |
| `spec/platforms/linux.md` | `spec/zh-CN/platforms/linux.md` | ✅ 已翻译 |
| `spec/platforms/windows.md` | `spec/zh-CN/platforms/windows.md` | ✅ 已翻译 |

### 自动执行流程

当收到"翻译文档"指令时：
1. **扫描项目**：检查是否有新增英文文档
2. **对比检测**：找出中文文档缺失或需要同步的文件
3. **直接执行**：无需询问，直接开始翻译/同步工作
4. **报告结果**：完成后告知翻译了哪些文件

## 翻译原则

### 1. 目录结构对应
- 英文文档 `README.md` → 中文文档 `README.zh-CN.md`
- 英文文档在 `spec/` 目录 → 中文文档在 `spec/zh-CN/` 目录
- 保持相同的文件名和路径结构

### 2. 文档风格保持
- 参考现有中文文档的语气和表达方式
- 保持技术术语的翻译一致性
- 确保表格、列表等格式结构与原文档一致

### 3. 内容处理原则
- **保留技术术语**：API、JSON、MCP 等技术术语保持英文或使用通用中文译法
- **格式转换**：Markdown 格式保持不变，包括标题、表格、代码块等
- **链接更新**：相对链接指向对应的中文文档路径
- **图片引用**：保持图片路径不变，图片应提供中文说明

## 翻译步骤

### 步骤1：确定翻译目标
1. 识别需要翻译的英文文档路径
2. 确定对应的中文文档输出路径
3. 检查是否已有对应的中文文档

### 步骤2：参考现有中文文档
1. 阅读 `README.zh-CN.md` 了解项目中文表达风格
2. 查看其他中文技术文档的术语使用习惯
3. 了解项目的中文文档结构和格式规范

### 步骤3：执行翻译
1. 按章节逐段翻译，保持原文结构
2. 确保技术术语的准确翻译
3. 保持代码示例和配置不变
4. 调整表达方式使其符合中文技术文档习惯

### 步骤4：格式和链接调整
1. 更新文档链接指向对应中文路径
2. 调整表格格式为中文显示
3. 检查图片路径是否正确

### 步骤5：质量检查
1. 对比英文原文检查是否有遗漏
2. 检查技术术语翻译的一致性
3. 确保文档结构和格式正确

## 技术术语翻译规范

### 通用技术术语
| 英文 | 中文推荐 |
|------|----------|
| Agent | Agent（保持英文，中文语境下可加"代理"说明） |
| API | API（保持英文，或"应用程序接口"） |
| JSON | JSON（保持英文） |
| MCP | MCP（保持英文） |
| Web App | Web应用 |
| Desktop App | 桌面应用 |
| Protocol | 协议 |
| Interface | 接口 |
| Descriptor | 描述符 |
| Gateway | 网关 |

### 项目特定术语
| 英文 | 中文推荐 |
|------|----------|
| AAI Protocol | AAI 协议 |
| aai.json | aai.json（保持文件名不变） |
| Gateway | 网关 |
| tool definition | 工具定义 |

## 输出要求

### 文件命名
- 主文档：`README.md` → `README.zh-CN.md`
- 技术文档：`spec/README.md` → `spec/zh-CN/README.md`
- 其他文档：保持相同文件名，但放在中文目录下

### 内容格式
- 使用 Markdown 格式
- 中文标点符号（全角符号）
- 表格格式适配中文显示
- 代码块保持原样，仅在注释中添加中文说明

### 质量标准
- 翻译准确，避免机器翻译的生硬表达
- 术语使用一致
- 符合中文技术文档的表达习惯
- 保持技术内容的准确性

## 使用示例

### 翻译 README.md
```bash
# 1. 确定翻译目标
源文件: ./README.md
目标文件: ./README.zh-CN.md

# 2. 参考现有中文文档风格
# 阅读 README.zh-CN.md 了解项目风格

# 3. 执行翻译
# 按章节翻译，保持结构

# 4. 更新链接
# 将英文链接指向对应中文路径
```

### 翻译技术文档
```bash
# 1. 确定翻译目标
源文件: ./spec/architecture.md
目标文件: ./spec/zh-CN/architecture.md

# 2. 参考现有技术文档
# 查看 ./spec/zh-CN/ 目录下的其他文档

# 3. 保持技术准确性
# 确保 API、架构等概念翻译准确
```

## 注意事项

1. **保持技术准确性**：技术概念和术语的翻译必须准确
2. **保持一致性**：与项目中现有中文文档的风格和术语保持一致
3. **结构完整性**：保持原文档的所有章节和内容结构
4. **链接有效性**：确保翻译后的文档链接指向正确的中文资源
5. **版本同步**：当英文文档更新时，及时更新对应的中文文档

## 后续步骤

完成翻译后：
1. 检查文档的格式和链接
2. 与团队成员审阅翻译质量
3. 提交到版本控制系统
4. 更新项目文档索引（如果需要）