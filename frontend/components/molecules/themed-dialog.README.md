# ThemedDialog 组件

一个功能完整、跨平台的对话框组件，支持 iOS、Android 和 Web 平台，自动适配暗黑模式。

## 特性

- ✅ **跨平台支持**: 在 iOS、Android 和 Web 上表现一致
- 🎨 **主题集成**: 自动支持暗黑模式，遵循项目主题规范
- 🔧 **高度可定制**: 支持自定义内容、颜色、按钮等
- 📱 **响应式设计**: 在不同屏幕尺寸上自适应
- ✨ **平滑动画**: 支持淡入淡出等动画效果
- 🎯 **易于使用**: 简洁的 API 设计

## 基础用法

```tsx
import { ThemedDialog } from '@/components/molecules/themed-dialog';
import { useState } from 'react';

function MyComponent() {
   const [visible, setVisible] = useState(false);

   return (
      <>
         <ThemedButton title="打开对话框" onPress={() => setVisible(true)} />

         <ThemedDialog
            visible={visible}
            onClose={() => setVisible(false)}
            title="提示"
            description="这是一条提示信息"
            primaryButton={{
               text: '确定',
               onPress: () => setVisible(false),
            }}
         />
      </>
   );
}
```

## API 参考

### Props

| 属性                   | 类型                          | 必填 | 默认值   | 说明                       |
| ---------------------- | ----------------------------- | ---- | -------- | -------------------------- |
| `visible`              | `boolean`                     | ✅   | -        | 控制对话框显示/隐藏        |
| `onClose`              | `() => void`                  | ✅   | -        | 关闭对话框的回调函数       |
| `title`                | `string`                      | -    | -        | 对话框标题                 |
| `description`          | `string`                      | -    | -        | 对话框描述文本             |
| `children`             | `ReactNode`                   | -    | -        | 自定义内容区域             |
| `primaryButton`        | `ButtonConfig`                | -    | -        | 主要按钮配置               |
| `secondaryButton`      | `ButtonConfig`                | -    | -        | 次要按钮配置               |
| `closeOnOverlayPress`  | `boolean`                     | -    | `true`   | 点击遮罩层时是否关闭对话框 |
| `animationType`        | `'fade' \| 'slide' \| 'none'` | -    | `'fade'` | 动画类型                   |
| `lightOverlayColor`    | `string`                      | -    | -        | 浅色模式遮罩层颜色         |
| `darkOverlayColor`     | `string`                      | -    | -        | 暗黑模式遮罩层颜色         |
| `lightBackgroundColor` | `string`                      | -    | -        | 浅色模式对话框背景色       |
| `darkBackgroundColor`  | `string`                      | -    | -        | 暗黑模式对话框背景色       |

### ButtonConfig

```typescript
{
   text: string;          // 按钮文本
   onPress: () => void;   // 点击回调
   loading?: boolean;     // 是否显示加载状态（仅主要按钮支持）
}
```

## 使用场景

### 1. 简单提示对话框

```tsx
<ThemedDialog
   visible={visible}
   onClose={() => setVisible(false)}
   title="成功"
   description="操作已成功完成！"
   primaryButton={{
      text: '知道了',
      onPress: () => setVisible(false),
   }}
/>
```

### 2. 确认对话框

```tsx
<ThemedDialog
   visible={visible}
   onClose={() => setVisible(false)}
   title="确认删除"
   description="确定要删除这个项目吗？此操作无法撤销。"
   primaryButton={{
      text: '删除',
      onPress: handleDelete,
   }}
   secondaryButton={{
      text: '取消',
      onPress: () => setVisible(false),
   }}
   closeOnOverlayPress={false}
/>
```

### 3. 带表单的对话框

```tsx
<ThemedDialog
   visible={visible}
   onClose={() => setVisible(false)}
   title="输入信息"
   primaryButton={{
      text: '提交',
      onPress: handleSubmit,
      loading: isSubmitting,
   }}
   secondaryButton={{
      text: '取消',
      onPress: () => setVisible(false),
   }}
>
   <ThemedInput
      value={value}
      onChangeText={setValue}
      placeholder="请输入内容"
   />
</ThemedDialog>
```

### 4. 完全自定义内容

```tsx
<ThemedDialog
   visible={visible}
   onClose={() => setVisible(false)}
   title="自定义内容"
>
   <View>
      <ThemedText>你可以放置任何自定义内容：</ThemedText>
      <Image source={...} style={styles.image} />
      <ThemedButton
         title="关闭"
         onPress={() => setVisible(false)}
      />
   </View>
</ThemedDialog>
```

## 设计规范

组件遵循项目的设计系统：

- **间距**: 使用 `Spacing` 常量（xs, sm, md, lg, xl, xxl）
- **圆角**: 使用 `BorderRadius` 常量（sm, md, lg, xl）
- **颜色**: 自动适配主题的 `Colors.light` 和 `Colors.dark`
- **排版**: 标题使用 `Typography.subtitle`
- **最大宽度**: 使用 `Layout.maxWidth.sm` (640px)

## 平台差异

### iOS

- 使用原生的 `shadowColor`、`shadowOffset`、`shadowOpacity` 实现阴影

### Android

- 使用 `elevation` 实现阴影

### Web

- 使用 CSS `boxShadow` 实现阴影
- 添加 1px 边框以增强视觉效果

## 最佳实践

1. **状态管理**: 使用 `useState` 管理对话框的显示状态
2. **异步操作**: 使用 `loading` 属性显示加载状态，并在加载时禁用关闭
3. **用户体验**: 对于重要操作，设置 `closeOnOverlayPress={false}` 防止误操作
4. **无障碍**: 组件已包含 `onRequestClose` 处理（Android 返回键支持）

## 完整示例

查看 [themed-dialog.example.tsx](./themed-dialog.example.tsx) 获取更多使用示例。

## 相关组件

- `ThemedButton`: 用于对话框按钮
- `ThemedText`: 用于文本内容
- `ThemedInput`: 可用于表单输入
- `ThemedCard`: 对话框容器使用了类似的样式
