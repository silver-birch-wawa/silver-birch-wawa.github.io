title: 怎么定位java内存溢出/Full GC/死锁/死循环
author: SaltedMdFiveSh
tags:
  - JAVA
categories:
  - JAVA
date: 2026-01-22 18:12:00
---
## OOM 定位

### 定位是那种OOM

看报错日志定位

### meta空间OOM

1.AOP代理生成了太多代理类。

2.依赖包太多

### 直接内存OOM

IO连接是否释放？

jvm直接内存配置小了？

### 堆OOM

jstat 查看堆内存和GC情况（2s刷新一次）

jmap 查看堆中的对象类型和数量，内存占用。

磁盘上有堆快照，需要提前配置jvm，走MAT分析

---

## Full GC 定位

### 定位类型

1.老年代（Old Gen）空间不足；

2.永久代 / 元空间（Metaspace）不足（JDK 8+ 为 Metaspace）；

3.显示调用 System.gc()（代码或框架触发）；

4.CMS GC 时出现「Concurrent Mode Failure」；

5.G1 GC 的混合回收或 Full GC 触发条件满足。

### 定位步骤

1.jstat（最常用）：实时输出 GC 统计数据

2.分析 GC 日志（定位 Full GC 触发原因）

搜 oldgen/ metaspace / System.gc () 等关键词

如果 GC 日志显示老年代无法释放内存，大概率是内存泄漏或大对象堆积，需要导出堆快照（hprof 文件）分析。

* MAT看什么指标？

Dominator Tree：查看占用内存最多的对象（如大量未释放的 HashMap、List、自定义业务对象）；

Histogram：按类统计对象数量和大小，找到异常堆积的类；

Path to GC Roots：查看对象的引用链，找到为什么对象无法被 GC 回收（如静态集合持有对象引用、线程池未关闭导致线程持有对象）。

---

## 最终原因定位

* 内存泄漏场景：

静态集合（如 static Map）未清理，持续添加对象；

线程池、连接池未配置合理的超时 / 回收机制，导致线程 / 连接持有大量对象；

资源未释放（如 IO 流、数据库连接、Redis 连接）；

第三方框架使用不当（如 MyBatis 结果集未关闭、Spring Bean 单例持有大量临时对象）。

* 大对象场景：

一次性加载大量数据（如查询全表数据、读取大文件）；

频繁创建大对象（如大字符串拼接、大数组），直接进入老年代；

缓存使用不当（如缓存大量大对象，未设置过期时间）。