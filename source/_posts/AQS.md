title: AQS（AbstractQueuedSynchronizer）
author: SaltedMdFiveSh
date: 2025-12-29 19:42:29
tags:
---
位于 java.util.concurrent.locks 包下。JDK 中绝大多数并发工具（如 ReentrantLock、CountDownLatch、Semaphore、ReentrantReadWriteLock 等）的底层实现都依赖于 AQS。

### 一、AQS 核心设计思想

AQS 基于 “状态管理 + 队列等待” 模型实现同步，核心要素包括 同步状态、同步队列 和 模板方法模式。
同步状态（State）

* volatile int state

AQS 内部维护的变量，用于表示队列中节点的同步状态（如ReentrantLock里锁的持有次数、countDownLatch并发线程执行计数、Semaphore信号量的许可数等），具备以下特性：

volatile 保证状态的内存可见性，多线程能感知状态的实时变化。提供 getState()、setState()、compareAndSetState() 方法操作状态，其中 compareAndSetState() 基于 CAS 原子操作，保证状态修改的原子性。

* Node waitStatus

Node 节点状态|值|含义
-|-|-
CANCELLED | 1 | 表示线程已经取消获取锁。线程在等待获取资源时被中断、等待资源超时会更新为该状态。
SIGNAL | -1 | 表示后继节点需要当前节点唤醒。在当前线程节点释放锁之后，需要对后继节点进行唤醒。
CONDITION | -2 | 表示节点在等待 Condition。当其他线程调用了 Condition 的 signal() 方法后，节点会从等待队列转移到同步队列中等待获取资源。
PROPAGATE | -3 | 用于共享模式。在共享模式下，可能会出现线程在队列中无法被唤醒的情况，因此引入了 PROPAGATE 状态来解决这个问题。
 | 0 | 加入队列的新节点的初始状态。
 
如果 waitStatus > 0 ，表明节点的状态已经取消等待获取资源。

如果 waitStatus < 0 ，表明节点的状态处于正常的状态，即没有取消等待。


![upload successful](/images/pasted-148.png)

* 同步队列（CLH 队列）

当线程获取同步状态失败时，会被封装成 Node 节点，加入到 AQS 内部的 FIFO 双向同步队列（基于 CLH 锁的变种实现），然后进入阻塞状态等待被唤醒。

为什么双向链表？

1.唤醒时需要依赖前驱节点状态判断是否可以继续执行。双向链表可直接通过prev访问前驱节点，避免单向链表从头遍历的低效操作。

2.高效的节点删除与中断处理 当线程被中断或取消时，需要将对应节点从队列中移除。


![upload successful](/images/pasted-136.png)

* 模板方法模式

AQS 定义了一套模板方法，封装了同步队列的管理、线程阻塞 / 唤醒的通用逻辑，子类只需重写核心钩子方法，即可实现不同类型的同步器。

模板方法（由 AQS 实现，子类直接调用）：如 acquire()（独占式获取状态）、release()（独占式释放状态）、acquireShared()（共享式获取状态）等。

钩子方法（由子类重写，实现具体逻辑）：如 tryAcquire()（独占式尝试获取）、tryRelease()（独占式尝试释放）、tryAcquireShared()（共享式尝试获取）等。

---

### 二、AQS 两种核心同步模式

根据线程获取同步状态的方式，AQS 分为 独占式 和 共享式 两种模式，对应不同的并发工具场景。

独占：同一时刻，只有一个线程能获取同步状态，其他线程必须排队等待。

共享：同一时刻，有N个线程能获取同步状态，其他线程必须排队等待。


![upload successful](/images/pasted-134.png)

---

AQS 内部大量使用了 CAS 操作。AQS 内部通过队列来存储等待的线程节点。由于队列是共享资源，在多线程场景下，需要保证队列的同步访问。AQS 内部通过 CAS 操作来控制队列的同步访问，CAS 操作主要用于 控制队列初始化、线程节点入队 两个操作的并发安全。虽然利用 CAS 控制并发安全可以保证比较好的性能，但同时会带来比较高的编码复杂度。

AQS 为构建锁和同步器提供了一些通用功能的实现。因此，使用 AQS 能简单且高效地构造出应用广泛的大量的同步器，比如我们提到的 ReentrantLock，Semaphore，其他的诸如 ReentrantReadWriteLock，SynchronousQueue等等皆是基于 AQS 的。

---

### 线程池里面怎么决定哪个核心/非核心线程来处理任务？

https://zhuanlan.zhihu.com/p/364448919

1.线程本质不区分核心/非核心线程，线程池只控制数量，实际不区分不打标。

2.任务谁来执行看CLH队列头部的线程，不是随机选