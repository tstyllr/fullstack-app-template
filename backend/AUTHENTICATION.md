# 认证系统使用文档

本项目使用 [Better Auth](https://www.better-auth.com/) 实现手机号认证，支持两种登录方式：

1. **手机号 + 短信验证码登录**（无需密码）
2. **手机号 + 密码登录**

## 📱 API 端点

所有认证 API 都挂载在 `/api/auth/` 路径下。

### 1. 发送短信验证码

**请求：**

```http
POST /api/auth/phone-number/send-otp
Content-Type: application/json

{
  "phoneNumber": "+8613800138000"
}
```

**响应（成功）：**

```json
{
   "success": true
}
```

**说明：**

- 手机号必须使用国际格式（以 + 开头）
- 验证码有效期：5分钟
- 验证码长度：6位数字
- 每个验证码最多允许验证 3 次

---

### 2. 验证短信验证码（登录/注册）

**请求：**

```http
POST /api/auth/phone-number/verify
Content-Type: application/json

{
  "phoneNumber": "+8613800138000",
  "code": "123456"
}
```

**响应（成功）：**

```json
{
   "user": {
      "id": "clxxx...",
      "phoneNumber": "+8613800138000",
      "phoneNumberVerified": true,
      "email": "8613800138000@phone.local",
      "emailVerified": false,
      "name": "用户8000",
      "image": null,
      "createdAt": "2025-01-01T00:00:00.000Z",
      "updatedAt": "2025-01-01T00:00:00.000Z"
   },
   "session": {
      "id": "clyyy...",
      "userId": "clxxx...",
      "expiresAt": "2025-02-01T00:00:00.000Z",
      "token": "session_token...",
      "ipAddress": "127.0.0.1",
      "userAgent": "Mozilla/5.0..."
   }
}
```

**说明：**

- 首次验证会自动创建新用户（自动注册）
- 自动生成临时邮箱：`{手机号去掉+}@phone.local`
- 自动生成用户名：`用户{手机号后4位}`
- 验证成功后自动创建 session（保持登录状态）

---

### 3. 手机号 + 密码登录

**请求：**

```http
POST /api/auth/sign-in/phone-number
Content-Type: application/json

{
  "phoneNumber": "+8613800138000",
  "password": "your-password"
}
```

**响应（成功）：**

```json
{
   "user": {
      /* 用户信息 */
   },
   "session": {
      /* 会话信息 */
   }
}
```

**说明：**

- 用户需要先通过验证码登录创建账户
- 然后可以设置密码（通过其他 API 端点）
- 此后可以选择使用密码登录或继续使用验证码登录

---

### 4. 获取当前会话

**请求：**

```http
GET /api/auth/get-session
Cookie: better-auth.session_token=xxx
```

**响应（已登录）：**

```json
{
   "user": {
      /* 用户信息 */
   },
   "session": {
      /* 会话信息 */
   }
}
```

**响应（未登录）：**

```json
{
   "user": null,
   "session": null
}
```

**说明：**

- 使用 Cookie 方式传递 session token
- Better Auth 会自动处理 session 的创建和验证
- Session 有效期：30天
- Session 每24小时自动更新一次

---

### 5. 登出

**请求：**

```http
POST /api/auth/sign-out
Cookie: better-auth.session_token=xxx
```

**响应（成功）：**

```json
{
   "success": true
}
```

**说明：**

- 清除当前 session
- 清除浏览器中的 session cookie

---

## 🔐 认证流程

### 流程一：验证码登录/注册

```
1. 客户端调用 /api/auth/phone-number/send-otp
   ↓
2. 用户收到短信验证码（腾讯云短信）
   ↓
3. 客户端调用 /api/auth/phone-number/verify-otp
   ↓
4. 如果是新用户，自动创建账户
   ↓
5. 返回 user 和 session，设置 Cookie
   ↓
6. 客户端保存 session，后续请求自动携带
```

### 流程二：密码登录

```
1. 用户已有账户（通过验证码创建）
   ↓
2. 客户端调用 /api/auth/sign-in/phone-number
   ↓
3. 验证手机号和密码
   ↓
4. 返回 user 和 session，设置 Cookie
```

---

## 🛠️ 开发与测试

### 环境变量配置

确保 `.env` 文件中配置了以下变量：

```env
# Better Auth
BETTER_AUTH_SECRET="your-secret-key"
BETTER_AUTH_URL="http://localhost:3000"

# Tencent Cloud SMS
TENCENT_SMS_SECRET_ID="your-secret-id"
TENCENT_SMS_SECRET_KEY="your-secret-key"
TENCENT_SMS_APP_ID="your-app-id"
TENCENT_SMS_SIGN_NAME="your-sign-name"
TENCENT_SMS_TEMPLATE_ID="your-template-id"
TENCENT_SMS_REGION="ap-guangzhou"
TENCENT_SMS_CODE_TIMEOUT="2"
```

### 启动服务器

```bash
cd backend
bun run dev
```

服务器将在 `http://localhost:3000` 启动。

### 使用 curl 测试

**发送验证码：**

```bash
curl -X POST http://localhost:3000/api/auth/phone-number/send-otp \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber": "+8613800138000"}'
```

**验证登录：**

```bash
curl -X POST http://localhost:3000/api/auth/phone-number/verify \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber": "+8613800138000", "code": "123456"}' \
  -c cookies.txt
```

**获取会话（使用保存的 cookie）：**

```bash
curl -X GET http://localhost:3000/api/auth/get-session \
  -b cookies.txt
```

---

## 📋 数据库结构

### Users 表

| 字段                | 类型          | 说明                |
| ------------------- | ------------- | ------------------- |
| id                  | String (cuid) | 用户唯一标识        |
| phoneNumber         | String        | 手机号（国际格式）  |
| phoneNumberVerified | Boolean       | 手机号是否已验证    |
| email               | String        | 邮箱（临时生成）    |
| emailVerified       | Boolean       | 邮箱是否已验证      |
| name                | String?       | 用户昵称            |
| image               | String?       | 头像 URL            |
| password            | String?       | 密码（bcrypt 加密） |
| createdAt           | DateTime      | 创建时间            |
| updatedAt           | DateTime      | 更新时间            |

### Sessions 表

存储用户会话信息，包括 token、过期时间、IP 地址等。

### Accounts 表

存储账户关联信息，支持多种认证方式（phone, email, OAuth 等）。

### Verifications 表

存储验证码等临时验证信息。

---

## ⚠️ 注意事项

1. **手机号格式**：必须使用国际格式，如 `+8613800138000`
2. **验证码有效期**：5分钟，超时需重新发送
3. **验证次数限制**：每个验证码最多尝试3次
4. **短信频率限制**：腾讯云有发送频率限制（30秒/次，10次/天等）
5. **Session 管理**：Better Auth 使用 httpOnly Cookie 存储 session，更安全
6. **临时邮箱**：系统生成的临时邮箱格式为 `{手机号}@phone.local`，不能用于实际邮件发送

---

## 🔄 迁移说明

如果从旧的认证系统迁移：

1. **ID 类型改变**：User ID 从 `Int` 改为 `String (cuid)`
2. **字段改名**：`phone` → `phoneNumber`
3. **新增字段**：`phoneNumberVerified`, `email`, `emailVerified`, `image`
4. **Session 管理**：不再使用 JWT，改用 Better Auth 的 session 管理
5. **密码存储**：Better Auth 使用 bcrypt 加密（与旧系统相同）

---

## 📚 更多信息

- [Better Auth 官方文档](https://www.better-auth.com/)
- [Phone Number Plugin 文档](https://www.better-auth.com/docs/plugins/phone-number)
- [腾讯云短信服务](https://cloud.tencent.com/document/product/382)
