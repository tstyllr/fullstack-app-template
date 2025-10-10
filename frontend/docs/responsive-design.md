# 响应式设计指南

本项目采用移动优先的设计策略，同时为 Web 平台提供了响应式适配方案。

## 核心组件

### 1. Layout 常量（constants/theme.ts）

```typescript
export const Layout = {
   // 内容最大宽度 - 防止在大屏幕上内容过度拉伸
   maxWidth: {
      sm: 640, // 小型内容（如聊天框）
      md: 768, // 中等内容（如表单）
      lg: 1024, // 大型内容（如仪表盘）
      xl: 1280, // 超大内容（如数据展示）
   },
   // 断点 - 用于响应式设计
   breakpoints: {
      mobile: 0,
      tablet: 768,
      desktop: 1024,
   },
};
```

### 2. useResponsive Hook（hooks/use-responsive.ts）

提供屏幕尺寸和平台相关的响应式信息：

```typescript
const {
   width, // 当前窗口宽度
   isWeb, // 是否为 Web 平台
   isMobile, // 是否为移动端尺寸
   isTablet, // 是否为平板尺寸
   isDesktop, // 是否为桌面端尺寸
   shouldConstrainWidth, // 是否需要约束宽度（Web 且非移动尺寸）
} = useResponsive();
```

### 3. ResponsiveContainer 组件（components/atoms/responsive-container.tsx）

用于包裹页面内容，在 Web 平台上提供最大宽度约束和居中布局：

```tsx
<ResponsiveContainer
   maxWidth="md" // 最大宽度尺寸：sm | md | lg | xl
   enableHorizontalPadding={true} // 是否启用水平内边距
   style={customStyle} // 自定义样式
>
   <YourContent />
</ResponsiveContainer>
```

## 使用场景

### 场景 1：聊天页面（窄内容）

聊天界面在大屏幕上应该保持较窄的宽度，提供更好的阅读体验：

```tsx
// app/(app)/(tabs)/index.tsx
<ResponsiveContainer
   maxWidth="sm" // 640px
   enableHorizontalPadding={false}
>
   <ChatBot />
</ResponsiveContainer>
```

### 场景 2：表单页面（中等内容）

表单页面使用中等宽度，避免输入框过宽：

```tsx
// app/(auth)/login.tsx
<ResponsiveContainer maxWidth="md">
   <LoginForm />
</ResponsiveContainer>
```

### 场景 3：ParallaxScrollView（自动适配）

`ParallaxScrollView` 模板组件已内置响应式支持：

```tsx
// app/(app)/(tabs)/settings.tsx
<ParallaxScrollView
   maxWidth="md"  // 可选，默认为 'md'
   headerImage={...}
   headerBackgroundColor={...}
>
   <SettingsList />
</ParallaxScrollView>
```

### 场景 4：自定义响应式布局

使用 `useResponsive` Hook 创建自定义响应式行为：

```tsx
import { useResponsive } from '@/hooks/use-responsive';
import { Layout, Spacing } from '@/constants/theme';

function CustomComponent() {
   const { isDesktop, shouldConstrainWidth } = useResponsive();

   return (
      <View
         style={[
            styles.container,
            isDesktop && {
               flexDirection: 'row', // 桌面端横向布局
               gap: Spacing.lg,
            },
            shouldConstrainWidth && {
               maxWidth: Layout.maxWidth.lg,
            },
         ]}
      >
         {/* 内容 */}
      </View>
   );
}
```

## 设计原则

### 1. 移动优先

始终先设计移动端界面，然后逐步增强到更大的屏幕：

```tsx
// ✅ 推荐
<View style={[
   styles.mobileFirst,
   isDesktop && styles.desktopEnhancement
]}>
```

```tsx
// ❌ 不推荐
<View style={[
   styles.desktopFirst,
   isMobile && styles.mobileOverride
]}>
```

### 2. 内容宽度约束

在 Web 上限制内容最大宽度，提升可读性和视觉效果：

- **聊天、消息列表**：使用 `maxWidth="sm"`（640px）
- **表单、设置页**：使用 `maxWidth="md"`（768px）
- **内容页、列表页**：使用 `maxWidth="lg"`（1024px）
- **仪表盘、数据展示**：使用 `maxWidth="xl"`（1280px）

### 3. 断点选择

使用 `Layout.breakpoints` 常量确保一致性：

```typescript
const { width } = useResponsive();

if (width >= Layout.breakpoints.desktop) {
   // 桌面端布局
} else if (width >= Layout.breakpoints.tablet) {
   // 平板布局
} else {
   // 移动端布局
}
```

### 4. 平台检测

使用 `isWeb` 属性进行平台特定的优化：

```tsx
const { isWeb } = useResponsive();

return (
   <View>
      {isWeb ? <WebOptimizedComponent /> : <NativeOptimizedComponent />}
   </View>
);
```

## 最佳实践

### 1. 始终使用主题常量

```tsx
// ✅ 推荐
import { Layout, Spacing } from '@/constants/theme';

<View
   style={{
      maxWidth: Layout.maxWidth.md,
      padding: Spacing.md,
   }}
/>;
```

```tsx
// ❌ 不推荐 - 硬编码数值
<View
   style={{
      maxWidth: 768,
      padding: 16,
   }}
/>
```

### 2. 禁用不必要的内边距

某些组件（如聊天界面）自带内边距，应禁用容器的内边距：

```tsx
<ResponsiveContainer enableHorizontalPadding={false}>
   <GiftedChat {...props} />
</ResponsiveContainer>
```

### 3. 嵌套使用响应式容器

避免嵌套多个 `ResponsiveContainer`，在页面顶层使用一次即可：

```tsx
// ✅ 推荐
<ResponsiveContainer>
   <Header />
   <Content />
   <Footer />
</ResponsiveContainer>
```

```tsx
// ❌ 不推荐
<ResponsiveContainer>
   <ResponsiveContainer>
      <Content />
   </ResponsiveContainer>
</ResponsiveContainer>
```

### 4. 测试不同屏幕尺寸

在开发时测试以下尺寸：

- **移动端**：375px（iPhone SE）、414px（iPhone Plus）
- **平板**：768px（iPad 竖屏）、1024px（iPad 横屏）
- **桌面端**：1280px、1440px、1920px

## 示例代码

### 完整页面示例

```tsx
import { StyleSheet } from 'react-native';
import { ResponsiveContainer } from '@/components/atoms/responsive-container';
import { ThemedView } from '@/components/atoms/themed-view';
import { ThemedText } from '@/components/atoms/themed-text';
import { useResponsive } from '@/hooks/use-responsive';
import { Spacing } from '@/constants/theme';

export default function ExampleScreen() {
   const { isDesktop } = useResponsive();

   return (
      <ResponsiveContainer maxWidth="lg">
         <ThemedView
            style={[styles.content, isDesktop && styles.desktopLayout]}
         >
            <ThemedText type="title">示例页面</ThemedText>
            <ThemedText>
               这是一个响应式页面示例。
               在移动端显示为纵向布局，在桌面端显示为横向布局。
            </ThemedText>
         </ThemedView>
      </ResponsiveContainer>
   );
}

const styles = StyleSheet.create({
   content: {
      flex: 1,
      gap: Spacing.md,
   },
   desktopLayout: {
      flexDirection: 'row',
      gap: Spacing.xl,
   },
});
```

## 常见问题

### Q: 为什么在移动端也会约束宽度？

A: `ResponsiveContainer` 使用 `shouldConstrainWidth` 条件判断，只在 Web 平台且非移动尺寸时才应用宽度约束。

### Q: 如何为特定页面自定义断点？

A: 使用 `useResponsive` Hook 获取窗口宽度，然后自定义判断逻辑：

```tsx
const { width } = useResponsive();
const customBreakpoint = width > 900; // 自定义断点
```

### Q: 为什么不使用 CSS 媒体查询？

A: React Native 不支持 CSS 媒体查询。我们使用 JavaScript 和 `useWindowDimensions` 实现响应式设计，保证跨平台一致性。

### Q: ParallaxScrollView 已经有响应式支持，还需要 ResponsiveContainer 吗？

A: `ParallaxScrollView` 内部已实现响应式适配，无需额外包裹。对于不使用 `ParallaxScrollView` 的页面，应使用 `ResponsiveContainer`。
