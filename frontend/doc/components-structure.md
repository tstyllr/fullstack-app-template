# Components 目录结构规范

## 概述

本项目采用**原子设计模式（Atomic Design）**组织 React Native 组件，该模式由 Brad Frost 提出，将 UI 组件分为 5 个层级，从简单到复杂递进。

## 目录结构

```
components/
├── atoms/           # 原子组件
├── molecules/       # 分子组件
├── organisms/       # 有机体组件
├── templates/       # 模板组件
└── pages/           # 页面组件（可选，通常在 app/ 目录）
```

---

## 各层级定义

### 1. Atoms（原子组件）

**定义**：UI 的最小单元，不可再分的基础组件。

**特征**：

- 单一职责，功能明确
- 高度可复用
- 无业务逻辑
- 通常是无状态组件

**示例**：

- `Button` - 按钮
- `Input` - 输入框
- `Icon` - 图标
- `Text` - 文本
- `Image` - 图片
- `Label` - 标签
- `Badge` - 徽章
- `Avatar` - 头像
- `Spinner` - 加载指示器

---

### 2. Molecules（分子组件）

**定义**：由多个原子组件组合而成的简单组合体。

**特征**：

- 由 2-5 个原子组件组成
- 完成一个简单的功能单元
- 可包含简单的交互逻辑
- 高度可复用

**示例**：

- `SearchBar` - 搜索框（Input + Icon + Button）
- `FormField` - 表单字段（Label + Input + ErrorText）
- `ListItem` - 列表项（Avatar + Text + Icon）
- `CardHeader` - 卡片头部（Avatar + Text + Button）
- `Checkbox` - 复选框（Icon + Text）
- `RadioButton` - 单选按钮（Icon + Text）
- `Toast` - 轻提示（Icon + Text）

---

### 3. Organisms（有机体组件）

**定义**：由分子和原子组件组成的相对复杂的 UI 组件。

**特征**：

- 较复杂的组合结构
- 有明确的业务含义
- 可包含状态管理
- 在特定上下文中可复用

**示例**：

- `LoginForm` - 登录表单
- `ProductCard` - 产品卡片
- `NavigationBar` - 导航栏
- `UserProfile` - 用户资料卡
- `CommentList` - 评论列表
- `FilterPanel` - 筛选面板
- `ShoppingCart` - 购物车

---

### 4. Templates（模板组件）

**定义**：页面级的布局模板，定义页面的骨架结构。

**特征**：

- 定义页面布局结构
- 包含多个有机体组件
- 不包含具体数据
- 展示页面的线框图/框架

**示例**：

- `AuthLayout` - 认证页面布局
- `DashboardLayout` - 仪表盘布局
- `DetailPageLayout` - 详情页布局
- `ListPageLayout` - 列表页布局

---

### 5. Pages（页面组件）

**说明**：在本项目中，页面组件通常位于 `app/` 目录（Expo Router 文件路由），而非 `components/` 目录。

---

## 命名规范

### 文件命名

1. **组件文件**：使用 PascalCase
   - ✅ `Button.tsx`
   - ✅ `SearchBar.tsx`
   - ❌ `button.tsx`
   - ❌ `search-bar.tsx`

### 组件命名

```typescript
// ✅ 正确：PascalCase 命名
export const Button = () => { ... }
export const SearchBar = () => { ... }

// ❌ 错误：camelCase 命名
export const button = () => { ... }
export const searchBar = () => { ... }
```

### Props 类型命名

```typescript
// ✅ 正确：组件名 + Props
export interface ButtonProps {
   title: string;
   onPress: () => void;
}

// ✅ 也可以
export type SearchBarProps = {
   placeholder?: string;
};
```

---

## 组件升级路径

随着需求变化，组件可能需要在层级间迁移：

```
Atom → Molecule → Organism
```

**示例**：

1. 开始：`Button` 是一个简单的原子组件
2. 需求变化：需要一个带图标的按钮 → 创建 `IconButton` 分子组件
3. 更复杂：需要一个带图标、徽章和下拉菜单的按钮 → 升级为 `MenuButton` 有机体组件

---

## 判断组件层级的技巧

### 问自己以下问题：

1. **是否可以再拆分？**
   - 不能 → Atom
   - 能 → 继续

2. **是否由 2-5 个简单组件组成？**
   - 是，且功能简单 → Molecule
   - 是，且功能复杂 → Organism

3. **是否定义页面布局结构？**
   - 是 → Template

4. **是否包含完整的页面逻辑和数据？**
   - 是 → Page（放在 `app/` 目录）

---
