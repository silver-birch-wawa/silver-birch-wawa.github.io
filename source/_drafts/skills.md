title: skills vs hooks
author: SaltedMdFiveSh
date: 2026-01-31 20:39:08
tags:
---
---


![upload successful](/images/pasted-145.png)

一个 Skill 本质上就是一个 Markdown 文件（文件名固定为 SKILL.md），内容几乎只由下面三段组成：

```
---
name: your-skill-name
description: What it does and when Claude should use it
---

# Skill Title

## Instructions
Clear, concrete, actionable rules.

## Examples
- Example usage 1
- Example usage 2

## Guidelines
- Guideline 1
- Guideline 2
```

字段	|必需	|作用
-|-|-
name	|是	|唯一标识，小写+连字符
description	|是	|触发条件（最重要）
allowed-tools	|否	|限制可用工具
model	|否	|指定模型
context	|否	|fork = 独立上下文
agent	|否	|fork 时使用的子代理
hooks	|否	|Skill 生命周期钩子
user-invocable	|否	|是否显示在 / 菜单