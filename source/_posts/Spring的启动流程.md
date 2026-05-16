title: Spring的启动流程
author: SaltedMdFiveSh
tags:
  - SPRING
categories:
  - SPRING
date: 2026-01-19 12:47:00
---

原生spring：创建applicationcontext，初始化beanFactory -> 执行扫描解析BeanDefination（@Repository） -> 启动内嵌tomcat -> 执行refresh() -> 实例化Bean + DI + 初始化（@PostConstruct - init()） -> 容器就绪

默认单例初期就全部实例化。

### Bean构造流程

1.反射调用构造方法创建实例

2.属性注入DI（@Autowired）

3.@PostConstruct - init()

4.放入一级缓存