# Themed 组件使用规范

## 概述

本项目使用 `ThemedView` 和 `ThemedText` 组件替代 React Native 原生的 `View` 和 `Text` 组件,以实现统一的主题管理和视觉风格。

**⚠️ 重要规范:在项目中应始终优先使用 Themed 组件,避免直接使用原生组件。**

## 为什么使用 Themed 组件?

### 1. 自动适配深色模式

Themed 组件会根据系统主题自动切换颜色,无需在每个组件中手动处理:

```tsx
// ❌ 不推荐:需要手动处理主题
const isDark = useColorScheme() === 'dark';
<View style={{ backgroundColor: isDark ? '#000' : '#fff' }}>
  <Text style={{ color: isDark ? '#fff' : '#000' }}>内容</Text>
</View>

// ✅ 推荐:自动适配主题
<ThemedView>
  <ThemedText>内容</ThemedText>
</ThemedView>
```

### 2. 统一的视觉风格

`ThemedText` 提供预设的文字样式,确保整个应用的字体风格一致:

```tsx
<ThemedText type="title">页面标题</ThemedText>
<ThemedText type="subtitle">副标题</ThemedText>
<ThemedText type="default">正文内容</ThemedText>
<ThemedText type="link">链接文本</ThemedText>
```

### 3. 集中管理主题

未来如需调整主题颜色或样式,只需修改:
- `hooks/use-theme-color.ts` - 主题颜色定义
- `components/atoms/themed-text.tsx` - 文字样式定义
- `components/atoms/themed-view.tsx` - 视图样式定义

无需在整个代码库中搜索和修改。

### 4. 减少重复代码

避免在每个组件中重复编写主题切换逻辑,提高开发效率和代码可维护性。

## 使用指南

### ThemedView

替代 `View` 组件,支持主题背景色:

```tsx
import { ThemedView } from '@/components/atoms/themed-view';

// 基础用法
<ThemedView style={{ padding: 16 }}>
  {/* 内容 */}
</ThemedView>

// 自定义主题颜色
<ThemedView
  lightColor="#f5f5f5"
  darkColor="#1a1a1a"
  style={{ borderRadius: 8 }}
>
  {/* 内容 */}
</ThemedView>
```

**Props:**
- `lightColor?: string` - 浅色模式背景色
- `darkColor?: string` - 深色模式背景色
- 继承所有 `ViewProps`

### ThemedText

替代 `Text` 组件,支持主题文字颜色和预设样式:

```tsx
import { ThemedText } from '@/components/atoms/themed-text';

// 使用预设样式
<ThemedText type="title">大标题</ThemedText>
<ThemedText type="subtitle">副标题</ThemedText>
<ThemedText type="defaultSemiBold">半粗体文本</ThemedText>
<ThemedText type="link">链接文本</ThemedText>
<ThemedText>普通文本</ThemedText>

// 自定义主题颜色
<ThemedText
  lightColor="#333333"
  darkColor="#ffffff"
  type="default"
>
  自定义颜色文本
</ThemedText>
```

**Props:**
- `type?: 'default' | 'title' | 'defaultSemiBold' | 'subtitle' | 'link'` - 预设样式类型
- `lightColor?: string` - 浅色模式文字颜色
- `darkColor?: string` - 深色模式文字颜色
- 继承所有 `TextProps`

**预设样式规格:**

| Type | 字号 | 行高 | 字重 | 用途 |
|------|------|------|------|------|
| `default` | 16px | 24 | 400 | 普通正文 |
| `defaultSemiBold` | 16px | 24 | 600 | 强调文本 |
| `title` | 32px | 32 | bold | 页面主标题 |
| `subtitle` | 20px | - | bold | 区块副标题 |
| `link` | 16px | 30 | 400 | 链接文本(蓝色 #0a7ea4) |

## 开发规范

### ✅ 推荐做法

```tsx
import { ThemedView } from '@/components/atoms/themed-view';
import { ThemedText } from '@/components/atoms/themed-text';

export function MyComponent() {
  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">欢迎</ThemedText>
      <ThemedText>这是一段描述文字</ThemedText>
    </ThemedView>
  );
}
```

### ❌ 避免做法

```tsx
// ❌ 不要直接从 react-native 导入 View 和 Text
import { View, Text } from 'react-native';

export function MyComponent() {
  return (
    <View>
      <Text>这样无法自动适配主题</Text>
    </View>
  );
}
```

### 特殊情况

以下场景可以使用原生组件:

1. **第三方库要求**: 某些库的 props 类型严格要求原生组件
2. **特殊布局需求**: 需要使用原生组件的特定属性(如 `ScrollView`, `FlatList` 等)
3. **性能优化**: 经过测试确认需要使用原生组件优化性能的场景

```tsx
// 这些布局组件仍使用原生版本
import { ScrollView, FlatList, SafeAreaView } from 'react-native';

// 但文本和普通容器应使用 Themed 版本
import { ThemedView } from '@/components/atoms/themed-view';
import { ThemedText } from '@/components/atoms/themed-text';
```

## ESLint 配置(可选)

可以通过 ESLint 规则强制执行此规范:

```js
// .eslintrc.js
module.exports = {
  rules: {
    'no-restricted-imports': ['error', {
      paths: [{
        name: 'react-native',
        importNames: ['View', 'Text'],
        message: '请使用 @/components/atoms/themed-view 的 ThemedView 和 @/components/atoms/themed-text 的 ThemedText 替代原生组件'
      }]
    }]
  }
};
```

## 常见问题

### Q: 如果需要不受主题影响的固定颜色怎么办?

A: 可以通过 `lightColor` 和 `darkColor` 设置相同的值:

```tsx
<ThemedView lightColor="#ff0000" darkColor="#ff0000">
  {/* 始终显示红色背景 */}
</ThemedView>
```

或者直接通过 style 覆盖:

```tsx
<ThemedView style={{ backgroundColor: '#ff0000' }}>
  {/* style 优先级更高 */}
</ThemedView>
```

### Q: 预设的文字样式不符合需求怎么办?

A: 有两种方式:

1. **扩展预设样式**: 在 `themed-text.tsx` 中添加新的 type
2. **使用 style 覆盖**: 通过 style prop 覆盖预设样式

```tsx
<ThemedText type="default" style={{ fontSize: 18, fontWeight: '700' }}>
  自定义样式
</ThemedText>
```

### Q: 如何为自定义组件添加主题支持?

A: 使用 `useThemeColor` hook:

```tsx
import { useThemeColor } from '@/hooks/use-theme-color';

export function CustomComponent() {
  const borderColor = useThemeColor({}, 'border');
  const textColor = useThemeColor({}, 'text');

  return (
    <View style={{ borderColor, borderWidth: 1 }}>
      <Text style={{ color: textColor }}>内容</Text>
    </View>
  );
}
```

## 总结

使用 Themed 组件是本项目的核心规范之一,它能够:

- ✅ 确保整个应用自动适配深色模式
- ✅ 保持视觉风格的一致性
- ✅ 简化主题管理和样式维护
- ✅ 提高代码质量和开发效率

**请在开发过程中严格遵守此规范,并在代码审查中相互提醒。**