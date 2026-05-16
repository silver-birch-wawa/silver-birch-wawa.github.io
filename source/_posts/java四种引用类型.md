title: java四种引用类型
author: SaltedMdFiveSh
tags:
  - JAVA
categories: []
date: 2026-01-05 10:19:00
---
* 软引用

内存敏感缓存：当内存不足时才会被回收

比弱引用"强"：JVM会尽量保留软引用对象

```
// 创建软引用
SoftReference<byte[]> softRef = 
    new SoftReference<>(new byte[1024 * 1024]); // 1MB
```

* 弱引用

短期缓存：只要发生GC就会被回收

不会阻止回收：比软引用更脆弱

```
// 创建弱引用
WeakReference<Object> weakRef = 
    new WeakReference<>(new Object());
```

* 虚引用

内存敏感缓存：当内存不足时才会被回收

比弱引用"强"：JVM会尽量保留软引用对象
```
// 创建软引用
SoftReference<byte[]> softRef = 
    new SoftReference<>(new byte[1024 * 1024]); // 1MB
```