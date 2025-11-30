# Frontend - Expo + Tamagui 应用

这是一个使用 Expo 和 Tamagui 构建的跨平台应用前端，支持 iOS、Android 和 Web。

## 技术栈

- **Expo**: SDK 54 - 跨平台应用框架
- **Expo Router**: v6 - 文件路由系统
- **Tamagui**: v1.138 - 高性能 UI 组件库
- **React Native Reanimated**: v4 - 动画库
- **TypeScript**: v5.9 - 类型安全
- **Bun**: 包管理器和运行时

## 项目特性

✅ 文件路由系统（Expo Router）
✅ 支持 iOS、Android、Web 三端
✅ Tamagui UI 组件库（预设主题）
✅ 自动适配系统 Light/Dark 模式
✅ 动画支持（Reanimated）
✅ Lucide 图标库
✅ 系统默认字体（无需外部字体加载）
✅ TypeScript 类型安全

## 开发命令

### 启动开发服务器

```bash
# 启动 Expo 开发服务器（选择平台）
bun run start

# 直接启动 Web 版本
bun run web

# 运行 iOS（需要 Mac 和 Xcode）
bun run ios

# 运行 Android（需要 Android Studio）
bun run android
```

### 类型检查

```bash
# 运行 TypeScript 类型检查
bun run tc
```

## 项目结构

```
frontend/
├── app/                    # Expo Router 页面
│   ├── _layout.tsx        # 根布局（TamaguiProvider）
│   ├── (tabs)/            # 底部标签页分组
│   │   ├── _layout.tsx    # 标签布局
│   │   ├── index.tsx      # 首页
│   │   └── settings.tsx   # 设置页
│   └── +not-found.tsx     # 404 页面
├── components/            # React 组件
│   └── ui/               # UI 组件库
│       ├── ThemeButton.tsx
│       ├── FeatureCard.tsx
│       └── index.ts
├── assets/               # 静态资源
├── tamagui.config.ts     # Tamagui 配置
├── metro.config.js       # Metro 配置
├── babel.config.js       # Babel 配置
├── app.json              # Expo 配置
├── tsconfig.json         # TypeScript 配置
└── package.json
```

## Tamagui 配置

项目使用 Tamagui 的预设主题和系统字体：

- **主题**: 使用 `@tamagui/themes` 预设主题（包含 light/dark 及多种颜色变体）
- **字体**: 系统默认字体（iOS: SF Pro, Android: Roboto, Web: system-ui）
- **动画**: React Native Reanimated 驱动
- **图标**: Lucide Icons

## 环境要求

- **Node.js**: 18+ 或 **Bun**: 1.0+
- **iOS**: Mac + Xcode（仅 iOS 开发需要）
- **Android**: Android Studio + Android SDK

## 首次运行

1. 安装依赖（已完成）：
   ```bash
   bun install
   ```

2. 启动开发服务器：
   ```bash
   bun run start
   ```

3. 选择运行平台：
   - 按 `w` 打开 Web
   - 按 `i` 打开 iOS 模拟器
   - 按 `a` 打开 Android 模拟器
   - 扫描二维码在真机上运行（需安装 Expo Go）

## 注意事项

### TypeScript 严格模式

当前 `tsconfig.json` 启用了严格模式 (`"strict": true`)。如果遇到类型错误，可以：

1. 临时关闭严格模式用于开发
2. 或者逐步修复类型问题

### 网络环境

项目已配置为使用系统字体和国内可访问的依赖，无需访问 Google 服务。

## 相关文档

- [Expo 文档](https://docs.expo.dev/)
- [Expo Router 文档](https://docs.expo.dev/router/introduction/)
- [Tamagui 文档](https://tamagui.dev/)
- [React Native Reanimated 文档](https://docs.swmansion.com/react-native-reanimated/)

## License

MIT
