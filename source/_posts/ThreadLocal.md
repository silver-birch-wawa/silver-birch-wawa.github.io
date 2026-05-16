title: ThreadLocal
author: SaltedMdFiveSh
tags:
  - JAVA
categories:
  - JAVA
date: 2026-01-04 22:17:00
---
---


* 在多线程场景下，若多个线程共享同一个变量，需通过 synchronized 或 Lock 保证线程安全，但会带来性能损耗；而 ThreadLocal 提供了「空间换时间」的思路

* 线程池中的线程会被复用，若上一个线程未调用 remove()，下一个线程可能获取到脏数据。也可能会发生内存泄漏。

ThreadLocalMap 类：Entry 的 key 是 ThreadLocal 对象，value 是线程对应的变量副本。

![upload successful](/images/pasted-146.png)


### 使用场景

用户上下文存储：Web 开发中，将登录用户信息（UserContext）存入 ThreadLocal，请求链路中任意方法可直接获取，无需层层传递参数；

数据库连接隔离：每个线程持有独立的 Connection 对象，避免多线程共用连接导致的事务混乱；

日期格式化工具隔离：SimpleDateFormat 非线程安全，通过 ThreadLocal 为每个线程创建独立实例，避免并发问题；

分布式追踪：TraceId 贯穿整个线程执行链路，通过 ThreadLocal 存储和获取。


### 弱引用为什么会内存泄漏

Map的key是弱引用，如果key = null 被回收，但是value没回收导致内存泄漏。


### 怎么解决/避免内存泄漏

1.使用完 ThreadLocal 后及时调用 remove()


2.避免使用 ThreadLocal 存储大对象

---

### 为什么key是弱引用，value不是

在 ThreadLocal 实例不再被使用时，让它能被 GC 自动回收，避免因为强引用 key 导致的 ThreadLocal 实例泄漏。

value 是 “有用的数据”，必须强引用保证不被意外回收；key 是 “器具（ThreadLocal 实例）”，用完后要自动回收，所以用弱引用。

### 在ThreadLocal.get()的时候发生GC之后key是为null吗？

不一定为null，关键在于外部是否还持有ThreadLocal的强引用。

✅ 外部有强引用：即使GC，ThreadLocal对象不会被回收，Entry的key不会变为null

❌ 外部无强引用：GC后ThreadLocal对象被回收，Entry的key变为null