title: java内存模型（JMM）
author: SaltedMdFiveSh
tags:
  - JAVA
categories:
  - JAVA
date: 2025-12-29 14:08:00
---
---

* CAS无法保证可见性和执行顺序，只能保证原子性

* volatile，各种Lock 和 final 可以实现可见性

* synchronized 和 volatile 保证执行有序性

### 规则

1.程序次序规则：单线程内，代码按书写顺序执行（前序操作先行发生于后序操作）；

2.volatile 变量规则：对 volatile 变量的写操作，先行发生于后续对该变量的读操作；

3.锁规则：解锁（unlock）操作先行发生于后续对同一把锁的加锁（lock）操作；

4.线程启动规则：Thread.start()先行发生于线程内的所有操作；

5.线程终止规则：线程内的所有操作先行发生于Thread.join()的返回。

### 具体编码

volatile

final

ReentrantLock/Synchronized（lock() / unlock() 内部依赖 CAS + park/unpark → 满足 unpark 先于 park 的可见性）

Thread.join()

CountDownLatch

