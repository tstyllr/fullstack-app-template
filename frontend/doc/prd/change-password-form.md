# 修改密码表单组件需求文档

## 组件属性

```ts
interface FromData {
   phone: string; // 手机号码
   code: string; // 手机验证码
   password: string; // 密码
   confirm: string; // 密码（需要和password一致）
}
interface Props {
   phone: string; // 手机号码
   onSubmitFormData: (data: FormData) => void;
}
```

## 显示的字段

修改密码表单需要显示如下字段：

- 手机号码
- 手机验证码
- 密码
- 确认密码

其中手机号码只显示，不允许修改（修改传入的手机号码）

## 字段验证

- 手机号码、手机验证码、密码、确认密码都是必选项
- 密码必须是6-20位数字和字母的组合
- 密码和确认密码必须完全一样

## 第三方库

请使用react-hook-form和zod实现该组件
