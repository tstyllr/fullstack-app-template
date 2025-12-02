# 聊天机器人 API 文档

## 概述

本API提供基于LLM的聊天机器人功能，支持：
- ✅ 多模型支持（GPT-4o, Claude 3.5 Sonnet, DeepSeek等）
- ✅ 流式输出
- ✅ 会话管理（创建、查询、更新、删除）
- ✅ 消息历史记录
- ✅ 全文搜索
- ✅ Token用量统计
- ✅ 自动生成会话标题
- ✅ 速率限制（每分钟10次，每小时100次）
- ✅ 30天自动清理

## 技术栈

- **Vercel AI SDK** - AI集成和流式响应
- **OpenRouter** - 统一的AI模型API网关
- **MySQL** - 数据持久化
- **Prisma** - ORM

## 环境配置

在 `.env` 文件中添加：

```env
OPENROUTER_API_KEY="your-openrouter-api-key"
DATABASE_URL="mysql://user:password@localhost:3306/database_name"
```

获取OpenRouter API Key: https://openrouter.ai/keys

## 支持的模型

| 模型 ID | 名称 | 特点 |
|---------|------|------|
| `openai/gpt-4o` | GPT-4o | OpenAI最新模型，性能强大 |
| `openai/gpt-4o-mini` | GPT-4o Mini | 快速且经济的模型 |
| `anthropic/claude-3.5-sonnet` | Claude 3.5 Sonnet | 擅长长文本和推理 |
| `anthropic/claude-3.5-haiku` | Claude 3.5 Haiku | 快速响应 |
| `deepseek/deepseek-chat` | DeepSeek Chat | 国内模型，成本低 |

## API 端点

所有端点都需要认证（需要在请求头中包含有效的session cookie）。

### 1. 创建会话

**POST** `/api/chat/conversations`

创建一个新的聊天会话。

**请求体：**
```json
{
  "model": "openai/gpt-4o",
  "title": "我的聊天" // 可选
}
```

**响应：**
```json
{
  "id": "clxxx...",
  "userId": "clxxx...",
  "title": null,
  "model": "openai/gpt-4o",
  "createdAt": "2025-12-02T10:00:00.000Z",
  "updatedAt": "2025-12-02T10:00:00.000Z"
}
```

### 2. 获取会话列表

**GET** `/api/chat/conversations?page=1&limit=20`

获取当前用户的所有会话（分页）。

**查询参数：**
- `page` (可选): 页码，默认1
- `limit` (可选): 每页数量，默认20

**响应：**
```json
{
  "conversations": [
    {
      "id": "clxxx...",
      "userId": "clxxx...",
      "title": "关于AI的讨论",
      "model": "openai/gpt-4o",
      "createdAt": "2025-12-02T10:00:00.000Z",
      "updatedAt": "2025-12-02T10:05:00.000Z",
      "messageCount": 8,
      "lastMessage": "这是最后一条消息..."
    }
  ],
  "total": 15,
  "page": 1,
  "totalPages": 1
}
```

### 3. 获取会话详情

**GET** `/api/chat/conversations/:id`

获取单个会话及其所有消息。

**响应：**
```json
{
  "id": "clxxx...",
  "userId": "clxxx...",
  "title": "关于AI的讨论",
  "model": "openai/gpt-4o",
  "createdAt": "2025-12-02T10:00:00.000Z",
  "updatedAt": "2025-12-02T10:05:00.000Z",
  "messages": [
    {
      "id": "clxxx...",
      "role": "user",
      "content": "你好",
      "tokenCount": null,
      "createdAt": "2025-12-02T10:00:00.000Z"
    },
    {
      "id": "clxxx...",
      "role": "assistant",
      "content": "你好！我能帮你什么？",
      "tokenCount": 15,
      "createdAt": "2025-12-02T10:00:01.000Z"
    }
  ]
}
```

### 4. 更新会话

**PUT** `/api/chat/conversations/:id`

更新会话标题。

**请求体：**
```json
{
  "title": "新的标题"
}
```

**响应：**
```json
{
  "id": "clxxx...",
  "userId": "clxxx...",
  "title": "新的标题",
  "model": "openai/gpt-4o",
  "createdAt": "2025-12-02T10:00:00.000Z",
  "updatedAt": "2025-12-02T10:10:00.000Z"
}
```

### 5. 删除会话

**DELETE** `/api/chat/conversations/:id`

删除会话及其所有消息。

**响应：**
```json
{
  "success": true
}
```

### 6. 发送消息（流式响应）⭐

**POST** `/api/chat/conversations/:id/messages`

发送消息并接收流式AI响应。

**请求体：**
```json
{
  "message": "什么是人工智能？"
}
```

**响应：**

返回流式响应（Server-Sent Events格式），前端可以实时接收AI生成的文本。

**速率限制：**
- 每分钟最多10条消息
- 每小时最多100条消息

**响应头：**
```
X-RateLimit-Limit-Minute: 10
X-RateLimit-Remaining-Minute: 9
X-RateLimit-Limit-Hour: 100
X-RateLimit-Remaining-Hour: 99
```

### 7. 搜索消息

**GET** `/api/chat/messages/search?q=关键词&page=1&limit=20`

在所有会话中搜索消息内容。

**查询参数：**
- `q` (必需): 搜索关键词
- `page` (可选): 页码，默认1
- `limit` (可选): 每页数量，默认20

**响应：**
```json
{
  "results": [
    {
      "id": "clxxx...",
      "conversationId": "clxxx...",
      "conversationTitle": "关于AI的讨论",
      "role": "assistant",
      "content": "人工智能是...",
      "createdAt": "2025-12-02T10:00:01.000Z"
    }
  ],
  "page": 1,
  "query": "人工智能"
}
```

### 8. 获取用量统计

**GET** `/api/chat/usage`

获取当前用户的总体用量统计。

**响应：**
```json
{
  "totalConversations": 15,
  "totalMessages": 120,
  "totalTokens": 45000,
  "totalCost": 0.85,
  "usageByModel": [
    {
      "model": "openai/gpt-4o",
      "count": 50,
      "tokens": 30000,
      "cost": 0.60
    },
    {
      "model": "deepseek/deepseek-chat",
      "count": 70,
      "tokens": 15000,
      "cost": 0.25
    }
  ]
}
```

## 错误响应

所有API在出错时返回标准错误格式：

```json
{
  "error": "错误类型",
  "message": "详细错误信息",
  "details": {} // 可选，包含验证错误等详情
}
```

**常见状态码：**
- `400` - 请求参数错误
- `401` - 未认证
- `404` - 资源不存在
- `429` - 速率限制超出
- `500` - 服务器内部错误

## 前端集成示例

### 使用 Fetch API 发送流式消息

```typescript
async function sendMessage(conversationId: string, message: string) {
  const response = await fetch(`/api/chat/conversations/${conversationId}/messages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ message }),
    credentials: 'include', // 包含认证cookie
  });

  if (!response.ok) {
    throw new Error('Failed to send message');
  }

  // 处理流式响应
  const reader = response.body?.getReader();
  const decoder = new TextDecoder();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value);
    // 处理接收到的文本片段
    console.log('Received chunk:', chunk);
  }
}
```

### 使用 Vercel AI SDK (React)

```tsx
import { useChat } from 'ai/react';

function ChatComponent({ conversationId }: { conversationId: string }) {
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: `/api/chat/conversations/${conversationId}/messages`,
    credentials: 'include',
  });

  return (
    <div>
      {messages.map((message) => (
        <div key={message.id}>
          <strong>{message.role}:</strong> {message.content}
        </div>
      ))}

      <form onSubmit={handleSubmit}>
        <input
          value={input}
          onChange={handleInputChange}
          disabled={isLoading}
        />
        <button type="submit" disabled={isLoading}>
          发送
        </button>
      </form>
    </div>
  );
}
```

## 自动化功能

### 会话标题自动生成

当会话有2-3条消息时，系统会自动使用AI生成简短的会话标题（最多60字符）。

### 30天自动清理

可以设置定时任务（cron job）来自动清理30天前的会话：

```typescript
import { conversationService } from './services/conversation.service';

// 每天凌晨2点执行
async function cleanupOldConversations() {
  const deletedCount = await conversationService.cleanupOldConversations(30);
  console.log(`Cleaned up ${deletedCount} old conversations`);
}
```

## 性能优化建议

1. **数据库索引** - 已在Schema中配置关键索引
2. **分页加载** - 会话列表和消息历史使用分页
3. **流式响应** - 减少用户等待时间
4. **速率限制** - 防止滥用
5. **全文搜索** - MySQL FULLTEXT索引加速搜索

## 安全考虑

- ✅ 所有接口需要认证
- ✅ 用户只能访问自己的会话
- ✅ 速率限制防止滥用
- ✅ 消息内容长度限制（最大10000字符）
- ✅ 会话标题长度限制（最大255字符）

## 开发调试

查看日志：
```bash
# 查看实时日志
tail -f logs/combined.log

# 查看错误日志
tail -f logs/error.log
```

## 相关文件

- `backend/src/types/chat.ts` - TypeScript类型定义
- `backend/src/lib/openrouter.ts` - OpenRouter配置
- `backend/src/repositories/` - 数据访问层
- `backend/src/services/` - 业务逻辑层
- `backend/src/controllers/chat.controller.ts` - 请求处理
- `backend/src/routes/chat.ts` - 路由定义
- `backend/src/middleware/chatRateLimit.ts` - 速率限制
- `backend/prisma/schema.prisma` - 数据库Schema
