title: Java类加载流程
author: SaltedMdFiveSh
tags:
  - JAVA
  - JVM
categories:
  - JAVA
date: 2025-12-29 16:46:00
---
### 类加载过程

![upload successful](/images/pasted-83.png)

加载：导入方法区，在内存中生成一个代表该类的 Class 对象，作为方法区这些数据的访问入口。

验证：确保 Class 文件的字节流中包含的信息符合《Java 虚拟机规范》的全部约束要求，保证这些信息被当作代码运行后不会危害虚拟机自身的安全。

![upload successful](/images/pasted-84.png)


准备：正式为类变量+static变量分配内存并设置类变量初始值（0/''）的阶段，这些内存都将在方法区中分配。

解析：符号引用验证发生在类加载过程中的解析阶段，具体点说是 JVM 将符号引用转化为直接引用的时候（解析阶段会介绍符号引用和直接引用）。解析动作主要针对类或接口、字段、类方法、接口方法、方法类型、方法句柄和调用限定符号引用进行。

初始化：类加载中唯一执行程序员代码的阶段，核心是给静态变量赋 “真实初始值”，执行静态代码块。

* 什么是符号引用？

字节码中不会直接存储任何内存地址（因为类加载的时机、内存分配由 JVM 决定，编译期根本无法预知），所以编译后所有对类、方法、字段的引用，都会被编译器替换成符号引用。

* 什么是直接引用？

直接引用（Direct Reference）是指向目标元素实际内存地址的指针、偏移量或句柄

初始化：赋真实值 + 执行静态代码块。
  
卸载：需要满足 3 个要求

（1）该类的所有的实例对象都已被 GC，也就是说堆不存在该类的实例对象。

（2）该类没有在其他任何地方被引用

（3）该类的类加载器的实例已被 GC

### 类初始化的节点

只有满足 “主动使用” 条件时，JVM 才会触发类的初始化。

1.创建类的实例（new、反射、克隆、反序列化）。

2.调用类的静态方法。

3.访问类的静态变量（final 常量除外，因为编译期已确定值）。

4.反射调用类的方法 / 字段（比如 Class.forName("com.test.User")）。

5.初始化一个类的子类（子类初始化会先触发父类初始化）。

6.JVM 启动时的主类（main 方法所在类）。


### 类加载器

BootstrapClassLoader(启动类加载器)：最顶层的加载类，由 C++实现，通常表示为 null，并且没有父级，主要用来加载 JDK 内部的核心类库（ %JAVA_HOME%/lib目录下的 rt.jar、resources.jar、charsets.jar等 jar 包和类）以及被 -Xbootclasspath参数指定的路径下的所有类。

ExtensionClassLoader(扩展类加载器)：主要负责加载 %JRE_HOME%/lib/ext 目录下的 jar 包和类以及被 java.ext.dirs 系统变量所指定的路径下的所有类。【这些类属于 Java 标准库的扩展部分，例如加密、国际化等功能】

AppClassLoader(应用程序类加载器)：面向我们用户的加载器，负责加载当前应用 classpath 下的所有 jar 包和类。【运行一个 Java 程序时，java 命令会指定 classpath】

CustomClassLoader：用户还可以加入自定义的类加载器来进行拓展，以满足自己的特殊需求。就比如说，我们可以对 Java 类的字节码（ .class 文件）进行加密，加载时再利用自定义的类加载器对其解密。


rt.jar：rt 代表“RunTime”，rt.jar是 Java 基础类库，包含 Java doc 里面看到的所有的类的类文件。也就是说，我们常用内置库 java.xxx.*都在里面，比如java.util.*、java.io.*、java.nio.*、java.lang.*、java.sql.*、java.math.*。


![upload successful](/images/pasted-85.png)

### 双亲委派模型

双亲委派模型是 Java 类加载机制的重要组成部分，它通过委派父加载器优先加载类的方式，实现了两个关键的安全目标：避免类的重复加载和防止核心 API 被篡改。

即使攻击者绕过了双亲委派模型，Java 仍然具备更底层的安全机制来保护核心类库。ClassLoader 的 preDefineClass 方法会在定义类之前进行类名校验。任何以 "java." 开头的类名都会触发 SecurityException，阻止恶意代码定义或加载伪造的核心类。


### 打破双亲委派模型方法

* 打破低级别类加载器load高级别

重写 loadClass()方法之后，我们就可以改变传统双亲委派模型的执行流程。例如，子类加载器可以在委派给父类加载器之前，先自己尝试加载这个类，或者在父类加载器返回之后，再尝试从其他地方加载这个类。具体的规则由我们自己实现，根据项目需求定制化。

* 想让高级别类加载器load低级别

使用线程上下文类加载器，线程上下文类加载器的原理是将一个类加载器保存在线程私有数据里，跟线程绑定，然后在需要的时候取出来使用。这个类加载器通常是由应用程序或者容器（如 Tomcat）设置的。

### Tomcat打破双亲委派？

核心类保护：对 java.、javax. 等核心包的类，仍严格遵循 “先父后子”，避免自定义类篡改 JVM 核心类（比如自定义 java.lang.String），保证安全。

优先自加载：非核心类先通过 findClass() 方法加载当前应用 WEB-INF 下的类，确保每个应用的类优先使用自己的版本，实现隔离。

父加载器兜底：自己加载不到时，再委托父加载器（Common/Application ClassLoader）加载共享类，兼顾共享和隔离。

```
Bootstrap ClassLoader（JVM核心）
    ↓
Extension ClassLoader（JVM扩展）
    ↓
Application ClassLoader（JVM应用）
    ↓
Common ClassLoader（Tomcat核心，加载Tomcat和所有应用共享的类）
    ↓
Catalina ClassLoader（Tomcat内部，加载Tomcat非共享的核心类）
    ↓
WebappClassLoader（每个Web应用一个，加载当前应用WEB-INF下的类）
    ↓
Jasper ClassLoader（每个JSP一个，编译JSP为Class文件，JSP修改后重建）
```