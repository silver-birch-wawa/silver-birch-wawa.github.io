title: Atomic
author: SaltedMdFiveSh
tags:
  - JAVA
categories:
  - JAVA
date: 2026-02-01 20:38:00
---
---

Java Atomic类底层靠CAS指令+volatile实现无锁并发，核心是Unsafe类直接操作内存和CPU原子指令。
 
1.核心：CAS（Compare-And-Swap）是CPU原子指令，对比内存值与预期值，一致则更新，不一致则自旋重试，无锁无阻塞

2.基础保障：成员变量用volatile修饰，保证内存可见性，避免多线程缓存不一致

3.底层支撑：依赖Unsafe类的compareAndSwapXXX方法，直接调用native方法对接CPU CAS指令（如x86的cmpxchg）

4.延伸：复杂原子类（AtomicReference/AtomicIntegerArray）同理，原子累加类（LongAdder）高并发下拆分为多个cell分段CAS，减少自旋冲突

#### 如果想在32位系统保证64位的int64的原子性怎么办？

总线锁，保证两次32位的set没有其他操作并行。拆成两次32位的操作。