title: reentrantLock
author: SaltedMdFiveSh
tags:
  - JAVA
categories:
  - JAVA
date: 2025-12-29 15:58:00
---
---

* 可重入，内部有计数器 ++ -- 到 0 释放锁

* 可以公平也可以非公平锁

* 悲观锁

* 可以tryLock(long timeout, TimeUnit unit) 方法，允许线程在指定时间内尝试获取锁，如果超时则返回 false。

* 中断响应，允许线程在等待锁的过程中响应中断。

### 获取锁流程

非公平锁：基于CAS获取锁，拿不到就去AQS队列等待。


![upload successful](/images/pasted-140.png)

#### 重偏向

线程B去申请加锁，发现是线程A加了偏向锁；这时候回去判断一下线程A是否存活，如果线程A挂了，就可以重新偏向了，重偏向也就是将自己的线程ID设置到Mark Word中。

如果线程A没挂，但是synchronized代码块执行完了，这个时候也可以重新偏向了，将偏向标识指向自己

#### 偏向锁升级轻量级锁

（1）首先线程A持有偏向锁，然后正在执行synchronized块中的代码

（2）这个时候线程B来竞争锁，发现有人加了偏向锁并且正在执行synchronized块中的代码，为了避免上述说的线程A一直持有锁不释放的情况，需要对锁进行升级，升级为轻量级锁

（3）先将线程A暂停，为线程A创建一个锁记录Lock Record，将Mark Word的数据复制到锁记录中；然后将锁记录放入线程A的虚拟机栈中

（4）然后将Mark Word中的前30位指向线程A中锁记录的地址，将线程A唤醒，线程A就知道自己持有了轻量级锁

#### 重量级锁的自旋

线程沉睡再唤醒最少需要3000ms的时间，如果某个线程只使用锁150ms的时间就释放了，如果直接采用沉睡方式的话，这个时候synchronized的性能就太差了。上重量级锁之前会自旋。

### AQS 队列

AQS 使用一个 双向链表 来管理等待线程，每个节点是一个 Node 对象：

prev：前驱节点。

next：后继节点。

thread：等待的线程。

waitStatus：节点状态（如 SIGNAL、CANCELLED 等）。

当线程获取锁失败时，会被加入队列尾部，并通过 LockSupport.park() 阻塞。当锁释放时，会唤醒队列头部的线程。


![upload successful](/images/pasted-82.png)