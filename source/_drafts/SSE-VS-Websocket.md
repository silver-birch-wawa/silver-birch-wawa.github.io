title: SSE VS Websocket
author: SaltedMdFiveSh
date: 2026-01-18 15:51:47
tags:
---
SSE是基于HTTP的单向推送协议，仅支持服务器→客户端的单方向数据传输，主打“轻松、低成本、内置重连”；

WebSocket是独立的全双工通信协议，协助客户端↔服务器双向实时通信，主打“低延迟、高灵活、双向交互”。两者的核心差异源于协议设计目标：SSE聚焦“极简的单向推送”，WebSocket聚焦“全场景的双向实时交互”。


![upload successful](/images/pasted-132.png)


### websocket协议

WebSocket分“握手+通信”两步：

握手阶段：客户端发送HTTP请求，携带Upgrade: websocket、Sec-WebSocket-Key等头，服务器验证后返回101 Switching Protocols，连接升级为WebSocket；

通信阶段：双方通过“帧（Frame）”传输数据（如文本帧、二进制帧、ping/pong帧），帧头仅2-10字节，远轻于HTTP头，且支持分片传输大数据。

### SSE的底层工作逻辑

SSE的核心是“HTTP长连接的响应流”：

客户端发起GET请求，服务器返回200 OK并设置text/event-stream响应头，且不关闭连接；

服务器持续向客户端推送格式化文本（如data: 订单状态更新为已发货\n\n），每段数据以\n\n结尾，浏览器的EventSource会自动解析并触发onmessage事件；

连接断开后，浏览器根据retry字段（默认3秒）自动重新发起请求，无需前端写重连代码。