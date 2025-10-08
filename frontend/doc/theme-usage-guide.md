# 主题系统使用指南

本指南介绍如何在项目中正确使用主题系统，包括颜色、间距和圆角规范。

## 一、添加支持暗黑模式的新颜色

### 1. 在 `constants/theme.ts` 中添加颜色

在 `Colors` 对象中同时定义 `light` 和 `dark` 模式的颜色：

```typescript
export const Colors = {
  light: {
    text: '#11181C',
    background: '#fff',
    // 添加新颜色
    primaryButton: '#007AFF',
    dangerText: '#FF3B30',
    successBackground: '#34C759',
  },
  dark: {
    text: '#ECEDEE',
    background: '#151718',
    // 对应的暗色模式颜色
    primaryButton: '#0A84FF',
    dangerText: '#FF453A',
    successBackground: '#32D74B',
  },
}
```

### 2. 在组件中使用颜色

#### 方式一：使用 `useThemeColor` hook（推荐）

用于需要动态获取主题颜色的场景：

```typescript
import { useThemeColor } from '@/hooks/use-theme-color';

function MyComponent() {
  const buttonColor = useThemeColor({}, 'primaryButton');
  const textColor = useThemeColor({}, 'text');

  return (
    <View style={{ backgroundColor: buttonColor }}>
      <Text style={{ color: textColor }}>按钮文本</Text>
    </View>
  );
}
```

#### 方式二：支持覆盖的颜色

```typescript
import { useThemeColor } from '@/hooks/use-theme-color';

function MyComponent() {
  // 可以通过 props 覆盖默认颜色
  const backgroundColor = useThemeColor(
    { light: '#f0f0f0', dark: '#2c2c2c' },
    'background'
  );

  return <View style={{ backgroundColor }} />;
}
```

#### 方式三：直接导入（仅限不需要响应主题变化的场景）

```typescript
import { Colors } from '@/constants/theme';

// ⚠️ 这种方式不会响应主题切换，不推荐在运行时使用
const staticColor = Colors.light.text;
```

## 二、避免硬编码 margin/padding/borderRadius

### 1. 使用 Spacing 常量

避免硬编码数字，使用统一的间距系统：

```typescript
import { Spacing } from '@/constants/theme';

function MyComponent() {
  return (
    <View
      style={{
        padding: Spacing.md,          // 16px
        marginTop: Spacing.lg,        // 24px
        marginHorizontal: Spacing.sm, // 8px
      }}
    >
      <Text>内容</Text>
    </View>
  );
}
```

#### 可用的间距值：

| 名称  | 值   | 用途示例           |
| ----- | ---- | ------------------ |
| `xs`  | 4px  | 小间隙、边框间距   |
| `sm`  | 8px  | 紧凑布局的间距     |
| `md`  | 16px | 常规内边距、外边距 |
| `lg`  | 24px | 卡片间距、段落间距 |
| `xl`  | 32px | 大区块间距         |
| `xxl` | 48px | 页面级大间距       |

### 2. 使用 BorderRadius 常量

统一圆角规范：

```typescript
import { BorderRadius } from '@/constants/theme';

function MyButton() {
  return (
    <Pressable
      style={{
        borderRadius: BorderRadius.md, // 8px
        padding: Spacing.md,
      }}
    >
      <Text>按钮</Text>
    </Pressable>
  );
}

function Avatar() {
  return (
    <Image
      source={{ uri: avatarUrl }}
      style={{
        width: 40,
        height: 40,
        borderRadius: BorderRadius.round, // 完全圆形
      }}
    />
  );
}
```

#### 可用的圆角值：

| 名称    | 值      | 用途示例                 |
| ------- | ------- | ------------------------ |
| `sm`    | 4px     | 小标签、输入框           |
| `md`    | 8px     | 按钮、卡片               |
| `lg`    | 12px    | 大卡片、模态框           |
| `xl`    | 16px    | 特殊容器                 |
| `round` | 9999px  | 圆形头像、圆形按钮、徽章 |

## 三、完整示例

### 示例：带主题的卡片组件

```typescript
import { View, Text, Pressable } from 'react-native';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Spacing, BorderRadius } from '@/constants/theme';

export function ThemedCard({ title, description, onPress }) {
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const borderColor = useThemeColor({}, 'border');

  return (
    <Pressable
      onPress={onPress}
      style={{
        backgroundColor,
        padding: Spacing.md,
        marginBottom: Spacing.md,
        borderRadius: BorderRadius.lg,
        borderWidth: 1,
        borderColor,
      }}
    >
      <Text style={{ color: textColor, fontSize: 18, fontWeight: 'bold' }}>
        {title}
      </Text>
      <Text
        style={{
          color: textColor,
          opacity: 0.7,
          marginTop: Spacing.sm,
        }}
      >
        {description}
      </Text>
    </Pressable>
  );
}
```

## 四、最佳实践

### ✅ 推荐做法

```typescript
// 使用主题常量
import { Spacing, BorderRadius } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';

style={{
  padding: Spacing.md,
  borderRadius: BorderRadius.md,
  backgroundColor: useThemeColor({}, 'background'),
}}
```

### ❌ 避免的做法

```typescript
// 硬编码数值
style={{
  padding: 16,
  borderRadius: 8,
  backgroundColor: '#fff',
}}
```

### 注意事项

1. **颜色必须同时定义 light 和 dark 模式**，确保暗黑模式下的正确显示
2. **优先使用 `useThemeColor` hook** 获取颜色，而不是直接 import Colors
3. **所有间距使用 `Spacing` 常量**，保持设计一致性
4. **所有圆角使用 `BorderRadius` 常量**，避免视觉不统一
5. **特殊需求时可以使用倍数**，如 `padding: Spacing.md * 2`（32px）

## 五、扩展主题系统

如果需要添加更多设计 token（如字体大小、阴影等），可以在 `constants/theme.ts` 中继续扩展：

```typescript
// 示例：添加字体大小系统
export const FontSize = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 24,
} as const;

// 示例：添加阴影系统
export const Shadow = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
} as const;
```
