title: spring和jdk有哪些设计模式
author: SaltedMdFiveSh
date: 2026-01-13 12:29:20
tags:
---
---

### JDK

runtime：单例模式

java.sql.DriverManager.getConnection()（不同数据库驱动（MySQL/Oracle）返回不同的 Connection 实例：工厂模式

stream：builder模式

java.lang.Object.clone()：所有类默认继承的克隆方法，实现Cloneable接口的类（如ArrayList、HashMap）可通过clone()复制实例：原型模式

Proxy.newProxyInstance()创建接口的动态代理对象：代理模式