title: Cache Aside 怎么设计延迟双删
author: SaltedMdFiveSh
tags:
  - SYSTEM DESIGN
categories:
  - SYSTEM DESIGN
date: 2026-02-10 16:24:00
---
---

### 问题1. 延迟多久二删比较好？

为什么会有脏内存数据？

1.写请求：更新Mysql主库

2.写请求：第一次删除redis缓存key

3.读请求：并发读到老的mysql数据

4.写请求：二次删除了redis缓存key

5.读请求：更新了redis缓存

延迟双删需要大于读请求的执行时间（3-5）+Mysql的主从延迟（1-4）。 

* 延迟时间不是越长越好 —— 过长会导致后续读请求仍读到脏数据（直到二次删除）；过短则无法覆盖脏回写，依然会有一致性问题。

### 问题2. 压测怎么测延迟？

脏缓存只发生在：同一个 key 被高频读写并发

单热点 key（比如商品 ID=1）

读写混合并发（写：读 = 1:20 ~ 1:50）

```
while true:
    db_val = 查询数据库 select ... where id=1
    cache_val = 查询Redis get key
    if db_val != cache_val and cache_val 不为空:
        记录【脏缓存出现】
```

### 问题3. 如何设计一个缓存系统可以支持近实时更新？

1.双写，先写数据库，再写缓存更新。

2.延迟双删