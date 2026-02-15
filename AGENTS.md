# AGENTS.md - AAI Protocol Repository Guide

This guide is for AI agents working on the AAI (Agent App Interface) protocol repository.

## Core Principle: No Redundancy

**CRITICAL: This project values brevity and clarity above all.**

- Every word must earn its place
- If something is explained elsewhere, link to it instead of repeating
- Prefer tables and bullet points over paragraphs
- Remove any content that doesn't add new information
- The spec should be minimal, not comprehensive

When in doubt, cut.

## Project Overview

AAI is an open protocol that makes any application accessible to AI Agents through standardized `aai.json` descriptors.

**Key Concepts:**
- `aai.json` - Cross-platform descriptor file
- Gateway - Discovers apps, executes tool calls
- MCP (Model Context Protocol) - Agent communication standard
- Platforms: macOS, Windows, Linux (desktop), Web Apps (REST API)

## Repository Structure

```
aai-protocol/
├── README.md, README.zh-CN.md    # Main project overview
├── spec/                         # Protocol specification documents
│   ├── README.md, overview.md, architecture.md, aai-json.md
│   ├── security.md, discovery.md, error-codes.md, call-flow.md, glossary.md
│   ├── platforms/                # macos.md, windows.md, linux.md, web.md
│   └── zh-CN/                    # Chinese translations (mirrors structure)
├── schema/aai.schema.json        # JSON Schema for validation
├── examples/                     # Sample aai.json files
└── scripts/sync-to-website.sh    # Syncs to VitePress website
```

## Commands

### Validate JSON Schema

```bash
# Using ajv-cli (install: npm install -g ajv-cli)
ajv validate -s schema/aai.schema.json -d examples/com.apple.mail.aai.json

# Using Python jsonschema (install: pip install jsonschema)
python -m jsonschema -i examples/com.apple.mail.aai.json schema/aai.schema.json
```

### Sync to Website

```bash
# Syncs spec/ to aai-website/docs/ for VitePress rendering
# Requires sibling aai-website directory
bash scripts/sync-to-website.sh
```

### Translate Documentation

Use the `document-translator` skill for translating English docs to Chinese:

```
# In OpenCode, the skill auto-detects untranslated files
# Just say "translate docs" or "翻译文档"
```

## Documentation Style Guidelines

### Markdown Structure

1. **Headers**: Use `#` for title, `##` for sections, `###` for subsections
2. **Navigation**: Add `[Back to Spec Index](./README.md)` at the end of each spec page
3. **Code blocks**: Always specify language (```json, ```bash, etc.)

### Tables and Diagrams

Use pipe tables with alignment. Use ASCII art for architecture diagrams with box drawing characters. Document all JSON fields in table format with field path, type, and description.

## JSON Conventions

### aai.json Structure

```json
{
  "schema_version": "1.0",
  "appId": "com.example.app",
  "name": "App Name",
  "description": "Brief description",
  "version": "1.0",
  "platforms": {
    "macos": { ... },
    "windows": { ... },
    "linux": { ... },
    "web": { ... }
  }
}
```

### Naming Conventions

- **appId**: Reverse-DNS format (e.g., `com.apple.mail`, `com.notion.api`)
- **Tool names**: snake_case (e.g., `send_email`, `search_pages`)
- **Parameters**: snake_case matching JSON Schema conventions
- **Placeholders**: Use `${param}` syntax for dynamic values in scripts/body

## Bilingual Documentation

### File Naming

| English | Chinese |
|---------|---------|
| `README.md` | `README.zh-CN.md` |
| `spec/overview.md` | `spec/zh-CN/overview.md` |
| `spec/platforms/web.md` | `spec/zh-CN/platforms/web.md` |

### Translation Rules

1. **Keep technical terms in English**: API, JSON, MCP, OAuth, Agent, Gateway
2. **Translate common terms**:
   - Desktop App → 桌面应用
   - Web App → Web应用
   - Protocol → 协议
   - Tool → 工具
3. **Preserve all formatting**: Tables, code blocks, links
4. **Update relative links** to point to Chinese versions
5. **Use Chinese punctuation**: 。 ， ： instead of . , :

### Terminology

| English | Chinese |
|---------|---------|
| AAI Protocol | AAI 协议 |
| Agent | Agent |
| Gateway | 网关 |
| Descriptor | 描述符 |
| Desktop App | 桌面应用 |
| Web App | Web应用 |

## File Organization

### Adding New Content
- **Spec documents**: Create `spec/new-topic.md`, add to index, create Chinese translation
- **Examples**: Create `examples/com.vendor.app.aai.json`, validate against schema
- **Platforms**: Create platform doc, update schema, add example, translate

## Error Code Conventions

Error codes use JSON-RPC 2.0 format with custom codes in the -32000 range:
- `-32001` to `-32010`: Desktop automation errors
- `-32011` to `-32014`: Web App / Auth errors

Always include `type` and `detail` in error `data`.

## Validation Checklist

Before submitting changes:

- [ ] JSON files validate against `schema/aai.schema.json`
- [ ] Markdown has no broken links
- [ ] Chinese translations updated for modified English docs
- [ ] New spec pages added to index tables
- [ ] Code blocks have language specified
- [ ] Tables properly formatted

## Related Resources

- [JSON Schema Draft-07](https://json-schema.org/draft-07/json-schema-release-notes.html)
- [MCP Specification](https://modelcontextprotocol.io/)
- [VitePress](https://vitepress.dev/) - Used for website rendering
