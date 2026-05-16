title: spring的Bean生命周期
author: SaltedMdFiveSh
tags:
  - Spring
categories:
  - Spring
date: 2025-12-29 13:09:00
---
### 常用初始化模块执行顺序

构造函数 > @Autowired > @PostConstruct > init函数


### bean的生命周期「实例化 → 属性填充 → 初始化 → 使用 → 销毁」

1.实例化

Spring 首先实例化一个 Bean，并为其分配内存空间。这个阶段就是通过 Spring 的 ApplicationContext 或 BeanFactory 根据 Bean 定义的类信息（通过 XML 配置或注解）创建 Bean 对象的过程。

Spring 通过反射机制创建 Bean 的实例（调用构造方法）

2.属性赋值（依赖注入）

实例化完成后，Spring 会通过依赖注入（DI）机制为 Bean 设置属性。这个过程确保了所有依赖项（无论是通过构造器注入还是通过 setter 注入）都会被自动注入。

依赖注入的方式有多种，其中最常见的是使用 @Autowired 注解或者通过 XML 配置来完成。

3.初始化

在属性赋值后，Spring 会调用一些初始化方法来完成额外的配置。初始化阶段非常关键，因为它通常依赖于前面注入的属性值，确保在执行相关操作时，属性已经正确赋值。

初始化过程包括以下几个步骤：

前置初始化方法：可以通过 @PostConstruct 注解或者实现 InitializingBean 接口的 afterPropertiesSet() 方法来定义。

初始化方法执行：开发者可以通过在 Bean 配置文件中指定自定义的初始化方法（比如 init-method）。

4.使用

5.销毁

---

* 代码调用的时候初始化

![upload successful](/images/pasted-102.png)