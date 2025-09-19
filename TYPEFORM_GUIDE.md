# Typeform 集成使用指南

## 🎯 概述

你的微气候应用现在支持两种反馈收集方式：
1. **自定义Typeform风格表单**（已实现）
2. **真实Typeform表单嵌入**（需要配置）

## 📋 使用真实Typeform的步骤

### 1. 创建Typeform表单

1. 访问你的Typeform工作区：
   ```
   https://admin.typeform.com/accounts/01K5GBS1PTZY5EW1D4DJ8Y9JRX/workspaces/yMjVGn
   ```

2. 点击"Create typeform"创建新表单

3. 建议的问题结构：
   - **问题1**：整体体验评价（多选题）
     - 选项：非常好😊 / 还不错👍 / 一般般😐 / 不太满意😕
   
   - **问题2**：最喜欢的功能（多选题）
     - 选项：呼吸引导 / 背景音效 / 计时器 / 整体氛围
   
   - **问题3**：使用场景（多选题）
     - 选项：工作间隙放松 / 睡前冥想 / 焦虑时刻 / 日常练习
   
   - **问题4**：建议和想法（长文本）
     - 占位符：请分享你的想法和建议...

### 2. 获取表单ID

1. 在Typeform编辑器中，点击"Share"
2. 复制表单URL，格式如：`https://form.typeform.com/to/ABC123XYZ`
3. 表单ID就是URL最后的部分：`ABC123XYZ`

### 3. 配置应用

1. 打开 `typeform-config.js` 文件
2. 将 `FORM_ID: 'YOUR_FORM_ID'` 替换为你的实际表单ID：
   ```javascript
   FORM_ID: 'ABC123XYZ', // 替换为你的表单ID
   ```
3. 保存文件

### 4. 测试表单

1. 刷新你的应用页面
2. 完成一次微气候体验
3. 在反馈页面选择"详细反馈"
4. 你应该能看到真实的Typeform表单

## 🔧 配置选项

在 `typeform-config.js` 中可以调整：

```javascript
EMBED_OPTIONS: {
    opacity: 0,        // 透明度
    height: '400px',   // 高度
    width: '100%',     // 宽度
    hideHeaders: true, // 隐藏头部
    hideFooter: true   // 隐藏底部
}
```

## 📊 数据收集

### Typeform后台数据
- 登录Typeform后台查看回复
- 可导出为Excel、CSV等格式
- 支持实时数据分析

### 本地数据（自定义表单）
在浏览器控制台使用：
```javascript
viewDetailedFeedback()  // 查看自定义表单数据
```

## 🎨 样式自定义

### Typeform表单样式
在Typeform编辑器中：
1. 点击"Design"选项卡
2. 选择主题颜色和字体
3. 建议使用与应用一致的配色方案

### 嵌入容器样式
在 `styles.css` 中已包含相关样式，可根据需要调整。

## 🔍 故障排除

### 表单不显示
1. 检查表单ID是否正确
2. 确认表单已发布（Published）
3. 检查网络连接

### 样式不匹配
1. 在Typeform编辑器中调整主题
2. 修改CSS中的嵌入容器样式

### 数据收集问题
1. 确认表单设置允许收集回复
2. 检查Typeform账户权限

## 💡 最佳实践

1. **问题设计**：保持问题简洁明了
2. **选项设置**：提供合适数量的选择项
3. **数据分析**：定期查看和分析反馈数据
4. **用户体验**：确保表单加载速度快
5. **隐私保护**：遵守数据保护相关法规

## 🚀 高级功能

### 条件逻辑
在Typeform中设置条件跳转，根据用户回答显示不同问题。

### 集成Webhook
设置Webhook将数据实时发送到你的服务器。

### 自定义感谢页面
设置完成表单后的自定义感谢页面。

---

如有问题，请参考Typeform官方文档或联系技术支持。