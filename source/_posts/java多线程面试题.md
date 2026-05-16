title: java多线程面试题
author: SaltedMdFiveSh
tags:
  - JAVA
categories:
  - JAVA
date: 2025-12-29 18:30:00
---
---

### 1.死锁

互斥条件：该资源任意一个时刻只由一个线程占用。

请求与保持条件：一个线程因请求资源而阻塞时，对已获得的资源保持不放。

不剥夺条件：线程已获得的资源在未使用完之前不能被其他线程强行剥夺，只有自己使用完毕后才释放资源。

循环等待条件：若干线程之间形成一种头尾相接的循环等待资源关系。

```
package org.example;

//TIP To <b>Run</b> code, press <shortcut actionId="Run"/> or
// click the <icon src="AllIcons.Actions.Execute"/> icon in the gutter.
public class Main {
    private static Object resource1 = new Object();//资源 1
    private static Object resource2 = new Object();//资源 2
    public static void main(String[] args) {
        // multi thread print 0-99
        new Thread(() -> {
            System.out.println(Thread.currentThread() + "waiting get resource1");
            synchronized (resource1) {
                System.out.println(Thread.currentThread() + "get resource1");
                try {
                    Thread.sleep(1000);
                } catch (InterruptedException e) {
                    e.printStackTrace();
                }
                synchronized (resource2) {
                    System.out.println(Thread.currentThread() + "get resource2");
                }
            }
        }).start();

        new Thread(() -> {
            System.out.println(Thread.currentThread() + "waiting get resource2");
            synchronized (resource2) {
                System.out.println(Thread.currentThread() + "get resource2");
                try {
                    Thread.sleep(1000);
                } catch (InterruptedException e) {
                    e.printStackTrace();
                }
                synchronized (resource1) {
                    System.out.println(Thread.currentThread() + "get resource1");
                }
            }
        }).start();
    }
}
```
### 如何检测死锁？
使用jmap、jstack等命令查看 JVM 线程栈和堆内存的情况。如果有死锁，jstack 的输出中通常会有 Found one Java-level deadlock:的字样，后面会跟着死锁相关的线程信息。

另外，实际项目中还可以搭配使用top、df、free等命令查看操作系统的基本情况，出现死锁可能会导致 CPU、内存等资源消耗过高。采用 VisualVM、JConsole 等工具进行排查。

### 2.交替打印0-99

```
class Wait_Notify_100 {

    private int num;
    private static final Object LOCK = new Object();
    private int maxnum = 10;

    private void printABC(int targetNum) {
        while (true) {
            synchronized (LOCK) {
                while (num % 3 != targetNum) { //想想这里为什么不能用if代替，想不起来可以看公众号上一篇文章
                    if(num >= maxnum){
                        break;
                    }
                    try {
                        LOCK.wait();
                    } catch (InterruptedException e) {
                        e.printStackTrace();
                    }
                }
                if(num >= maxnum){
                    break;
                }
                num++;
                System.out.println(Thread.currentThread().getName() + ": " + num);
                LOCK.notifyAll();
            }
        }

    }
    
    public static void main(String[] args) {
        Wait_Notify_100  wait_notify_100 = new Wait_Notify_100 ();
        new Thread(() -> {
            wait_notify_100.printABC(0);
        }, "thread1").start();
        new Thread(() -> {
            wait_notify_100.printABC(1);
        }, "thread2").start();
        new Thread(() -> {
            wait_notify_100.printABC(2);
        }, "thread3").start();
    }    
}
```

### 线程池的submit和execute的区别

使用execute()提交任务：当任务通过execute()提交到线程池并在执行过程中抛出异常时，如果这个异常没有在任务内被捕获，那么该异常会导致当前线程终止，并且异常会被打印到控制台或日志文件中。线程池会检测到这种线程终止，并创建一个新线程来替换它，从而保持配置的线程数不变。使用submit()提交任务：对于通过submit()提交的任务，如果在任务执行中发生异常，这个异常不会直接打印出来。相反，异常会被封装在由submit()返回的Future对象中。当调用Future.get()方法时，可以捕获到一个ExecutionException。在这种情况下，线程不会因为异常而终止，它会继续存在于线程池中，准备执行后续的任务。