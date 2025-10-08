# IconSymbol 组件使用规范

## 概述

`IconSymbol` 是一个跨平台图标组件,在不同平台上自动使用最优的原生图标系统:

- **iOS**: 使用 SF Symbols (Apple 官方图标系统)
- **Android/Web**: 使用 Material Icons (Google 官方图标系统)

**⚠️ 重要规范:使用 IconSymbol 组件可以确保应用在各平台上都拥有原生外观,同时避免打包额外的图标资源。**

## 为什么使用 IconSymbol?

### 1. 平台原生体验

每个平台使用各自的原生图标系统,确保视觉一致性:

- iOS 用户看到熟悉的 SF Symbols
- Android/Web 用户看到熟悉的 Material Icons

### 2. 性能优化

- 不需要打包图标字体文件
- 利用系统内置的图标资源
- 更小的应用体积

### 3. 自动平台适配

React Native 根据文件后缀自动选择对应实现:

- `icon-symbol.ios.tsx` → iOS 平台
- `icon-symbol.tsx` → Android/Web 平台

## 基本用法

```tsx
import { IconSymbol } from '@/components/atoms/icon-symbol';

export function MyComponent() {
  return (
    <IconSymbol
      name="house.fill"
      size={24}
      color="#000000"
    />
  );
}
```

## Props 参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| `name` | `IconSymbolName` | ✅ | - | 图标名称 (基于 SF Symbol 命名) |
| `size` | `number` | ❌ | `24` | 图标尺寸 (宽高相等) |
| `color` | `string \| OpaqueColorValue` | ✅ | - | 图标颜色 |
| `style` | `StyleProp<TextStyle \| ViewStyle>` | ❌ | - | 自定义样式 |
| `weight` | `SymbolWeight` | ❌ | `'regular'` | 图标粗细 (仅 iOS 支持) |

### `weight` 参数 (iOS 专属)

iOS 上的 SF Symbols 支持多种粗细:

- `'ultraLight'`
- `'thin'`
- `'light'`
- `'regular'` (默认)
- `'medium'`
- `'semibold'`
- `'bold'`
- `'heavy'`
- `'black'`

```tsx
<IconSymbol
  name="house.fill"
  size={24}
  color="#000"
  weight="bold"  // 仅在 iOS 上生效
/>
```

## 可用图标

当前已映射的图标 (定义在 `icon-symbol.tsx`):

| SF Symbol 名称 | Material Icon 名称 | 用途 |
|----------------|-------------------|------|
| `house.fill` | `home` | 首页 |
| `paperplane.fill` | `send` | 发送 |
| `chevron.left.forwardslash.chevron.right` | `code` | 代码 |
| `chevron.right` | `chevron-right` | 右箭头 |
| `gear.circle.fill` | `settings` | 设置 |

### 添加新图标

要添加新图标,需要在 `icon-symbol.tsx` 的 `MAPPING` 对象中添加映射:

```typescript
const MAPPING = {
  'house.fill': 'home',
  'paperplane.fill': 'send',
  // ... 现有映射

  // 添加新图标映射
  'star.fill': 'star',           // 星标
  'person.fill': 'person',       // 用户
  'bell.fill': 'notifications',  // 通知
} as IconMapping;
```

**查找图标资源:**

- SF Symbols: 下载 [SF Symbols App](https://developer.apple.com/sf-symbols/)
- Material Icons: 访问 [Icons Directory](https://icons.expo.fyi)

## 使用示例

### 基础示例

```tsx
import { IconSymbol } from '@/components/atoms/icon-symbol';
import { ThemedView } from '@/components/atoms/themed-view';

export function HomeButton() {
  return (
    <ThemedView style={{ padding: 10 }}>
      <IconSymbol
        name="house.fill"
        size={28}
        color="#007AFF"
      />
    </ThemedView>
  );
}
```

### 结合主题色

```tsx
import { IconSymbol } from '@/components/atoms/icon-symbol';
import { useThemeColor } from '@/hooks/useThemeColor';

export function ThemedIcon() {
  const iconColor = useThemeColor({}, 'icon');

  return (
    <IconSymbol
      name="gear.circle.fill"
      size={24}
      color={iconColor}
    />
  );
}
```

### 按钮中使用

```tsx
import { TouchableOpacity } from 'react-native';
import { IconSymbol } from '@/components/atoms/icon-symbol';
import { ThemedText } from '@/components/atoms/themed-text';

export function IconButton() {
  return (
    <TouchableOpacity
      style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}
      onPress={() => console.log('pressed')}
    >
      <IconSymbol name="paperplane.fill" size={20} color="#007AFF" />
      <ThemedText>发送</ThemedText>
    </TouchableOpacity>
  );
}
```

### 自定义样式

```tsx
import { IconSymbol } from '@/components/atoms/icon-symbol';

export function StyledIcon() {
  return (
    <IconSymbol
      name="house.fill"
      size={32}
      color="#FF6B6B"
      style={{
        opacity: 0.8,
        transform: [{ rotate: '45deg' }],
      }}
    />
  );
}
```

## 开发规范

### ✅ 推荐做法

```tsx
// ✅ 使用已映射的图标名称
<IconSymbol name="house.fill" size={24} color="#000" />

// ✅ 结合主题色使用
const color = useThemeColor({}, 'icon');
<IconSymbol name="gear.circle.fill" size={24} color={color} />

// ✅ 在添加新图标前先更新 MAPPING
const MAPPING = {
  // ...
  'new.icon': 'new-material-icon',
};
```

### ❌ 避免做法

```tsx
// ❌ 不要使用未映射的图标名称 (Android/Web 上会报错)
<IconSymbol name="some.unmapped.icon" size={24} color="#000" />

// ❌ 不要直接使用 MaterialIcons 或 SymbolView (失去跨平台优势)
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
<MaterialIcons name="home" size={24} />

// ❌ 不要在 Android/Web 上依赖 weight 参数
<IconSymbol name="house.fill" weight="bold" /> // 仅 iOS 生效
```

## 平台差异注意事项

### iOS 特有功能

- ✅ 支持 `weight` 参数 (粗细调节)
- ✅ 使用 SF Symbols 的所有特性 (可变颜色、动画等)
- ✅ `style` 类型为 `ViewStyle`

### Android/Web

- ❌ 不支持 `weight` 参数
- ⚠️ 需要手动维护 SF Symbol → Material Icon 映射
- ✅ `style` 类型为 `TextStyle`

### 确保跨平台一致性

1. **优先选择通用图标**: 尽量使用在两个平台上都有对应图标的符号
2. **测试双平台**: 添加新图标后在 iOS 和 Android/Web 上都要测试
3. **保持视觉相似**: 选择映射时确保 Material Icon 与 SF Symbol 视觉含义相近

## TypeScript 类型

```typescript
type IconSymbolName =
  | 'house.fill'
  | 'paperplane.fill'
  | 'chevron.left.forwardslash.chevron.right'
  | 'chevron.right'
  | 'gear.circle.fill';

type SymbolWeight =
  | 'ultraLight'
  | 'thin'
  | 'light'
  | 'regular'
  | 'medium'
  | 'semibold'
  | 'bold'
  | 'heavy'
  | 'black';
```

## 常见问题

### Q: 如何知道某个 SF Symbol 对应哪个 Material Icon?

A:
1. 在 [SF Symbols App](https://developer.apple.com/sf-symbols/) 中找到想要的图标
2. 在 [Icons Directory](https://icons.expo.fyi) 中搜索含义相近的 Material Icon
3. 在 `MAPPING` 中添加映射关系

### Q: 为什么图标在 Android 上显示不出来?

A: 检查是否在 `MAPPING` 对象中添加了对应的映射。Android/Web 需要手动映射每个图标。

### Q: 可以使用自定义 SVG 图标吗?

A: `IconSymbol` 专门用于系统原生图标。如需使用自定义 SVG,请考虑使用 `react-native-svg` 或其他 SVG 组件。

### Q: 图标颜色能自动适配深色模式吗?

A: `IconSymbol` 本身不处理主题,需要配合 `useThemeColor` hook 使用:

```tsx
const iconColor = useThemeColor({}, 'icon');
<IconSymbol name="house.fill" color={iconColor} />
```

## 总结

使用 `IconSymbol` 组件的优势:

- ✅ 自动适配各平台的原生图标系统
- ✅ 减小应用体积,提升性能
- ✅ 保持平台原生视觉风格
- ✅ 统一的 API,简化开发

记住:在添加新图标时,务必同时更新 `MAPPING` 对象以确保 Android/Web 平台的兼容性!
