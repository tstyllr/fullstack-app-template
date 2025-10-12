# Toast 使用指南

本项目已集成 `react-native-toast-message`，并提供了统一的错误提示方案。

## 📋 方案概述

项目采用分层错误提示策略：

### 1. Toast 提示（非阻塞式）- 主要方式 ✅

**适用场景：**
- 网络请求失败（非关键）
- 操作成功/失败提示
- 后台自动保存结果
- 一般性错误信息

**特点：**
- 默认 4 秒自动消失
- 非阻塞，用户可继续操作
- 自动触觉反馈（移动端）
- 支持暗色模式

### 2. Dialog/Alert（阻塞式）- 辅助方式

**适用场景：**
- 需要用户确认的危险操作（删除、退出）
- 关键业务失败（登录失败、支付失败）
- 需要用户做出选择的情况

**使用：** 使用项目现有的 `ThemedDialog` 组件

### 3. Inline Error（内联错误）- 已实现

**适用场景：**
- 表单字段验证错误

**使用：** `ThemedInput` 组件的 `error` 属性

---

## 🚀 快速开始

### 基本用法

```typescript
import { showSuccess, showError, showWarning, showInfo } from '@/lib/utils/toast';

// 成功提示
showSuccess({
  title: '操作成功',
  message: '数据已保存'
});

// 错误提示
showError({
  title: '操作失败',
  message: '请检查网络连接'
});

// 警告提示
showWarning({
  title: '注意',
  message: '当前操作可能影响数据'
});

// 信息提示
showInfo({
  title: '提示',
  message: '验证码已发送到您的手机'
});
```

### API 错误处理（推荐）

项目提供了 `showApiError` 工具函数，可自动从错误对象中提取错误信息：

```typescript
import { showApiError } from '@/lib/utils/toast';

const handleSubmit = async () => {
  try {
    await someApi();
  } catch (error) {
    // 自动提取错误信息并显示
    showApiError(error, '操作失败');
  }
};
```

### 完整示例

```typescript
import { showSuccess, showApiError } from '@/lib/utils/toast';

const handleLogin = async (data: LoginForm) => {
  setIsLoading(true);
  try {
    const response = await loginApi(data);

    // 显示成功提示
    showSuccess({
      title: '登录成功',
      message: `欢迎回来，${response.user.name}`
    });

  } catch (error) {
    // 显示错误提示
    showApiError(error, '登录失败');
  } finally {
    setIsLoading(false);
  }
};
```

---

## 🎨 高级选项

### 自定义显示时长

```typescript
showSuccess({
  title: '操作成功',
  duration: 3000  // 3秒后消失（默认 4000ms）
});
```

### 禁用触觉反馈

```typescript
showError({
  title: '操作失败',
  haptics: false  // 禁用触觉反馈（默认 true）
});
```

---

## 📝 API 参考

### Toast 选项

```typescript
interface ToastOptions {
  /**
   * 主标题（必填）
   */
  title: string;

  /**
   * 副标题/详细描述（可选）
   */
  message?: string;

  /**
   * 显示时长（毫秒），默认 4000ms
   */
  duration?: number;

  /**
   * 是否启用触觉反馈，默认 true（仅移动端）
   */
  haptics?: boolean;
}
```

### 可用函数

| 函数 | 说明 | 触觉反馈 |
|------|------|----------|
| `showSuccess(options)` | 显示成功提示 | Success |
| `showError(options)` | 显示错误提示 | Error |
| `showWarning(options)` | 显示警告提示 | Warning |
| `showInfo(options)` | 显示信息提示 | Light |
| `showApiError(error, title?)` | 显示 API 错误 | Error |
| `extractErrorMessage(error)` | 提取错误信息 | - |

---

## 🎯 使用建议

### ✅ 推荐做法

```typescript
// ✅ 使用 showApiError 处理 API 错误
try {
  await api.call();
} catch (error) {
  showApiError(error, '操作失败');
}

// ✅ 成功提示简洁明了
showSuccess({ title: '保存成功' });

// ✅ 错误提示包含解决建议
showError({
  title: '网络请求失败',
  message: '请检查网络连接后重试'
});
```

### ❌ 避免做法

```typescript
// ❌ 避免使用 Alert.alert（除非需要用户交互）
Alert.alert('错误', '操作失败');

// ❌ 避免过长的提示信息
showError({
  title: '错误',
  message: '这是一段非常非常非常非常长的错误信息...'  // 太长了
});

// ❌ 避免频繁显示提示
for (let i = 0; i < 10; i++) {
  showSuccess({ title: '成功' });  // 会叠加显示
}
```

---

## 🔧 主题定制

Toast 样式已集成项目主题系统，自动支持：

- ✅ 暗色模式
- ✅ 主题颜色（成功、错误、警告、信息）
- ✅ 统一的间距和圆角
- ✅ 响应式字体

配置文件：`components/molecules/toast-config.tsx`

---

## 📦 已迁移文件

以下文件已更新使用新的 Toast 系统：

- ✅ `app/(auth)/login.tsx`
- ✅ `app/(app)/settings/change-password.tsx`
- ✅ `app/(app)/settings/account.tsx`

---

## 🆘 故障排除

### Toast 不显示

1. 检查 `app/_layout.tsx` 是否已添加 `<Toast />` 组件
2. 确认导入路径正确：`from '@/lib/utils/toast'`

### 触觉反馈不工作

触觉反馈仅在移动端（iOS/Android）生效，Web 端不支持。

### 样式不符合主题

检查 `components/molecules/toast-config.tsx` 中的主题配置。

---

## 📚 相关资源

- [react-native-toast-message 官方文档](https://github.com/calintamas/react-native-toast-message)
- [项目主题系统](../constants/theme.ts)
- [错误处理最佳实践](./error-handling.md)
