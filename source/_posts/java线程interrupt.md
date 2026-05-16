title: java线程interrupt
author: SaltedMdFiveSh
tags:
  - JAVA
  - 多线程
  - ''
categories:
  - JAVA
  - 多线程
date: 2026-02-01 13:08:00
---


线程的中断必须由自身处理：其他线程仅通过interrupt()发送 “中断通知”，目标线程在执行过程中主动检查中断标志，若检测到标志为true，则自行完成资源释放、循环退出等操作，实现优雅中断。

### 场景 1：中断运行中的线程（无阻塞方法）

目标线程在执行普通逻辑（如循环计算、遍历），无sleep/wait/join等阻塞方法，直接在循环中检查中断标志，检测到后优雅退出即可。

```
public class InterruptRunningThread {
    public static void main(String[] args) throws InterruptedException {
        // 定义目标线程：循环执行普通逻辑
        Thread workThread = new Thread(() -> {
            // 循环中主动检查中断标志
            while (!Thread.currentThread().isInterrupted()) {
                System.out.println("工作线程运行中...");
                try {
                    Thread.sleep(500); // 模拟业务逻辑
                } catch (InterruptedException e) {
                    // 后续若有阻塞，提前捕获异常（场景2会详细讲）
                    Thread.currentThread().interrupt(); // 恢复中断标志
                    break;
                }
            }
            System.out.println("工作线程检测到中断，优雅退出！");
        }, "WorkThread");

        workThread.start();
        // 主线程3秒后发送中断通知
        Thread.sleep(3000);
        workThread.interrupt();
        System.out.println("主线程已向工作线程发送中断通知");
    }
}
```

### 场景 2：中断阻塞中的线程（含 sleep/wait/join/lockSupport.park 等）

当线程执行上述阻塞方法时，若其他线程调用interrupt()设置中断标志，阻塞方法会立即抛出InterruptedException异常，并自动清除中断标志（标志位变回false）。

关键处理：捕获InterruptedException后，必须手动恢复中断标志（Thread.currentThread().interrupt()），否则后续检查不到中断通知，可能导致线程无法退出。

```
public class InterruptBlockedThread {
    public static void main(String[] args) throws InterruptedException {
        Thread workThread = new Thread(() -> {
            try {
                // 线程进入阻塞状态（sleep 10秒）
                System.out.println("工作线程进入睡眠，阻塞10秒...");
                Thread.sleep(10000);
            } catch (InterruptedException e) {
                // 阻塞时收到中断通知，抛出异常，标志位被自动清除
                System.out.println("工作线程在阻塞中收到中断通知，捕获异常");
                Thread.currentThread().interrupt(); // 手动恢复中断标志（核心！）
            }
            // 检查标志位，确认中断后退出
            if (Thread.currentThread().isInterrupted()) {
                System.out.println("工作线程检测到恢复后的中断标志，优雅退出！");
            }
        }, "WorkThread");

        workThread.start();
        // 主线程2秒后发送中断通知（此时工作线程还在sleep阻塞）
        Thread.sleep(2000);
        workThread.interrupt();
    }
}
```

中断处于NEW/TERMINATED状态的线程，无任何效果：interrupt()仅对RUNNABLE/BLOCKED/WAITING/TIMED_WAITING状态的线程有效，对未启动（NEW）或已结束（TERMINATED）的线程调用，不会设置任何标志。