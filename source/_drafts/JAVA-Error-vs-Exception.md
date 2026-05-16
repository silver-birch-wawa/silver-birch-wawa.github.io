title: JAVA Error vs Exception
author: SaltedMdFiveSh
date: 2026-01-05 10:28:10
tags:
---

![upload successful](/images/pasted-89.png)

### 受检异常（Checked Exception）

在编译期间Java编译器要求必须处理（要么用try-catch捕获，要么在方法签名中用throws子句声明）的异常。
它们继承自java.lang.Exception类，但不包括java.lang.RuntimeException类的子类。

受检异常通常是由外部错误条件引起的，这些条件在程序运行时可能经常发生，程序员预见到这些异常情况并且被期望在编译阶段就处理它们。例如，试图根据指定的文件路径打开一个文件时可能会抛出FileNotFoundException，或者由于网络问题导致的IOException。

### 非受检异常（Unchecked Exceptions）：

非受检异常是编译器不要求强制处理的异常。它们要么是由编程错误引起的（如访问null对象的成员、数组越界），要么是程序应该在运行时处理的异常。
非受检异常包括java.lang.RuntimeException的所有子类和java.lang.Error的所有子类。RuntimeException是那些可能在Java虚拟机正常操作期间抛出的异常的超类。
常见的RuntimeException包括NullPointerException（当应用试图在需要对象的地方使用null时，抛出此异常）、IndexOutOfBoundsException（指示某排序索引（如数组、字符串或向量）越界时抛出）等。

### Error

程序无法处理的错误，表示运行应用程序中较严重问题。大多数错误与代码编写者执行的操作无关，而表示代码运行时 JVM（Java 虚拟机）出现的问题。

* error可以被catch么？

可以，try-catch 语句的参数类型就是 Throwable 及其子类，可以catch error但是不推荐。
