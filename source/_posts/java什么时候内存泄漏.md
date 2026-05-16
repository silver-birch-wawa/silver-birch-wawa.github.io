title: java什么时候内存泄漏
author: SaltedMdFiveSh
tags:
  - JAVA
categories:
  - JAVA
date: 2026-01-15 18:01:00
---
---

1.静态集合类持有对象引用（最常见）

静态集合（如static List/Map）的生命周期与 JVM 进程一致，如果向静态集合中添加对象后不及时移除，这些对象会一直被持有，永远无法被 GC 回收。

2.未关闭的资源（IO / 数据库连接 / 网络连接）

Java 中的 IO 流、数据库连接（Connection）、Socket 连接等资源，若未显式关闭，不仅会占用文件句柄 / 连接资源，其对应的对象也可能无法被 GC 回收，导致内存泄漏。

3.ThreadLocal 使用后未清理

ThreadLocal 用于线程内共享数据，但如果线程复用（如线程池），且 ThreadLocal 未调用remove()，线程的 ThreadLocalMap 会一直持有对象引用，导致内存泄漏。