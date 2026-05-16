title: UnSafe
author: SaltedMdFiveSh
date: 2026-02-01 22:08:54
tags:
---

Unsafe 是位于 sun.misc 包下的一个类，主要提供一些用于执行低级别、不安全操作的方法，如直接访问系统内存资源、自主管理内存资源等，这些方法在提升 Java 运行效率、增强 Java 语言底层资源操作能力方面起到了很大的作用。

Unsafe 提供的这些功能的实现需要依赖本地方法（Native Method）。你可以将本地方法看作是 Java 中使用其他编程语言编写的方法。本地方法使用 native 关键字修饰，Java 代码中只是声明方法头，具体的实现则交给 本地代码。

![upload successful](/images/pasted-147.png)

Unsafe 类中提供了park、unpark、monitorEnter、monitorExit、tryMonitorEnter方法进行线程调度

