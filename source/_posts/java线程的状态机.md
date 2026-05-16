title: java线程的状态机
author: SaltedMdFiveSh
tags:
  - JAVA
categories:
  - JAVA
date: 2026-01-31 23:09:00
---
---

NEW → RUNNABLE → 「BLOCKED/WAITING/TIMED_WAITING」 → RUNNABLE → TERMINATED


正常关闭路径：RUNNING → SHUTDOWN → TIDYING（结束前的过渡状态） → TERMINATED

紧急关闭路径：RUNNING → STOP → TIDYING → TERMINATED

* BLOCKED 竞争锁， WAITING 主动调用 object.wait/thread.join/time.sleep

sleep() vs wait()：sleep()属于 TIMED_WAITING，不释放锁，无需持有锁；wait()（无参）属于 WAITING，释放持有的 synchronized 锁，调用时必须持有锁；

BLOCKED 仅针对synchronized，ReentrantLock 锁的阻塞初期走cas自旋不涉及此状态。

### 误区澄清

误区：“调用run()方法让线程运行”→ 错误，调用run()只是普通的 Java 方法调用，不会创建新线程，线程仍处于 NEW 状态，必须调用start()才会在新线程执行，否则会在原线程执行；

误区：“wait ()/notify () 可以在非 synchronized 代码中调用”→ 错误，会抛出IllegalMonitorStateException，调用时必须持有对象的 synchronized 锁。

误区：“线程可以从 TERMINATED 恢复到 RUNNABLE”→ 错误，终止状态是最终状态，无法恢复，重新执行需新建线程对象；


### 1.新建（NEW）

线程对象已被创建（new Thread(...)），但尚未调用start()方法，此时线程未被纳入 JVM 的线程调度体系，只是一个普通的 Java 对象。

### 2.就绪（RUNNABLE）【执行thread.start()】

调用start()方法后进入该状态，包含两个子状态（JVM 层面不做区分，统一为 RUNNABLE）：

就绪：线程等待 CPU 的时间片调度，已具备运行条件；

运行：线程正在执行run()方法的代码。

* 关键：start()方法仅让线程进入就绪，而非立刻运行，运行与否由 CPU 调度决定。

### 3.阻塞（BLOCKED）

线程因竞争 synchronized 内置锁失败而进入的阻塞状态（仅针对 synchronized，Lock 锁的阻塞不属于此状态），直到获取到锁后恢复。

### 4.等待（WAITING）

线程进入无超时的等待状态，必须通过其他线程显式唤醒才能恢复，否则会一直等待，属于 “主动等待”。

触发方式（3 种核心，均为主动调用，且调用时必须持有对应锁）：

调用 **Object.wait()**（无参版）：当前线程持有某个对象的 synchronized 锁，调用该对象的 wait ()；

调用 **Thread.join()**（无参版）：当前线程调用另一个线程的 join ()，等待被 join 的线程执行完毕；

调用 **LockSupport.park()**：无锁要求，底层实现，Lock/CountDownLatch 等工具类的基础；

恢复路径（WAITING → RUNNABLE）：

wait()触发的：其他线程调用同一对象的notify()/notifyAll()，且当前线程被唤醒并竞争到锁；

join()触发的：被 join 的线程执行完毕（进入 TERMINATED）；

park()触发的：其他线程调用LockSupport.unpark(当前线程)。

### 5.超时等待（TIMED_WAITING）

线程进入有超时时间的等待状态，两种恢复方式：①其他线程显式唤醒；②等待时间到达自动唤醒，避免无限等待。

触发方式（核心是带超时参数的方法，是 WAITING 的 “超时版”）：

调用Object.wait(long timeout)/Object.wait(long timeout, int nanos)（带参版）；

调用Thread.join(long millis)/Thread.join(long millis, int nanos)（带参版）；

调用LockSupport.parkNanos()/LockSupport.parkUntil()；

调用 **Thread.sleep(long millis)**（核心，无锁要求）：当前线程主动休眠指定时间；

恢复路径（TIMED_WAITING → RUNNABLE）：

满足对应 WAITING 的恢复条件（如 notify ()/unpark ()/join 的线程结束）；

等待的超时时间到达，自动唤醒（无需其他线程操作）；

### 6.终止（TERMINATED）

线程的生命周期结束，进入该状态后无法再恢复，触发原因有两种：①run()方法正常执行完毕；②线程运行中抛出未捕获的异常 / 错误，导致强制终止。