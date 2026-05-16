title: A2A协议
author: SaltedMdFiveSh
tags:
  - LLM
categories:
  - LLM
date: 2026-01-18 15:12:00
---
---

## 基础通信元素

### 1. Agent Card（智能体名片）

JSON元数据文档，通常可在众所周知的URL（如/.well-known/agent.json）发现，描述A2A服务端的完整信息。

智能体身份（名称、描述）

服务端点URL和版本

支持的A2A能力（流式传输、推送通知）

具体技能列表

认证要求

### 2. Task（任务）

每个任务拥有智能体定义的唯一ID

任务具有状态性，可涉及多次消息交换

![upload successful](/images/pasted-130.png)

### 3. Message（消息）

角色区分: "user"（客户端发送）或"agent"（服务端发送）

内容载体: 包含一个或多个Part对象

唯一标识: 每条消息都有发送方设置的messageId

### 4.Artifact

由 Agent 在执行任务过程中生成的输出结果。它与 Message 的差别在于，Artifact 通常是「结果物」或产物，而 Message 常用于「对话或指令」。


### 5.Push Notification

可选功能，如果 Agent 支持 pushNotifications，就可以向客户端指定的 URL 主动发起任务进度更新，而无需客户端轮询。

### 6.Streaming

如果 Agent 支持 streaming 功能，就可以在处理某个任务时，通过 tasks/sendSubscribe 使用 SSE 进行分段或实时地输出状态与结果。


![怎么发现连接Agent Server](/images/pasted-133.png)


### 和MCP的关系

![upload successful](/images/pasted-131.png)