title: Spring的循环依赖
author: SaltedMdFiveSh
tags:
  - Spring
categories:
  - Spring
date: 2025-12-29 13:35:00
---
### 可以解决循环依赖的场景

单例 Bean（非单例不行） + 基于字段注入（@Autowired） 或 setter 注入。

构造器注入无法解决循环依赖，因为构造器注入在实例化时就需要依赖对象，此时依赖对象还没创建。

### 解决循环依赖发的办法

1.@Lazy

```
@Component
public class A {
    @Autowired
    @Lazy
    private B b;
}

@Component
public class B {
    @Autowired
    private A a;
}
```

@Lazy 会延迟初始化 B，从而打破循环。

2.如果使用构造器注入出现循环依赖，可以改为 setter 注入。

### 三级缓存方案

缓存名称|作用
-|-
singletonObjects|一级缓存，存放已经完全创建好的单例 Bean。
earlySingletonObjects|二级缓存，存放提前曝光的半成品 Bean（未完成属性填充和初始化）。
singletonFactories|三级缓存，存放Bean 的 ObjectFactory，用于提前生成代理对象。

```
┌─────────────────────────────────────────────────────────────────────┐
│ Spring 容器启动                                                    │
└─────────────────────────────────────────────────────────────────────┘
            │
            ▼
┌─────────────────────────────────────────────────────────────────────┐
│ 创建 Bean A                                                        │
│   1. 检查一级缓存 singletonObjects → 没有 A                         │
│   2. 检查二级缓存 earlySingletonObjects → 没有 A                    │
│   3. 检查三级缓存 singletonFactories → 没有 A                       │
│   4. 将 A 标记为正在创建（added to singletonsCurrentlyInCreation）  │
│   5. 创建 A 的 ObjectFactory 并放入三级缓存 singletonFactories       │
│   6. 实例化 A（调用构造方法）                                        │
│   7. 填充 A 的属性（发现需要注入 B）                                 │
└─────────────────────────────────────────────────────────────────────┘
            │
            ▼
┌─────────────────────────────────────────────────────────────────────┐
│ 创建 Bean B                                                        │
│   1. 检查一级缓存 singletonObjects → 没有 B                         │
│   2. 检查二级缓存 earlySingletonObjects → 没有 B                    │
│   3. 检查三级缓存 singletonFactories → 没有 B                       │
│   4. 将 B 标记为正在创建（added to singletonsCurrentlyInCreation）  │
│   5. 创建 B 的 ObjectFactory 并放入三级缓存 singletonFactories       │
│   6. 实例化 B（调用构造方法）                                        │
│   7. 填充 B 的属性（发现需要注入 A）                                 │
└─────────────────────────────────────────────────────────────────────┘
            │
            ▼
┌─────────────────────────────────────────────────────────────────────┐
│ 注入 A 到 B 时解决循环依赖                                         │
│   1. 检查一级缓存 singletonObjects → 没有 A                         │
│   2. 检查二级缓存 earlySingletonObjects → 没有 A                    │
│   3. 检查三级缓存 singletonFactories → 有 A 的 ObjectFactory        │
│   4. 通过 ObjectFactory 获取 A 的半成品（可能是代理对象）            │
│   5. 将 A 的半成品放入二级缓存 earlySingletonObjects                │
│   6. 从三级缓存 singletonFactories 移除 A 的 ObjectFactory           │
│   7. 将 A 的半成品注入到 B                                          │
└─────────────────────────────────────────────────────────────────────┘
            │
            ▼
┌─────────────────────────────────────────────────────────────────────┐
│ B 创建完成                                                         │
│   1. 将 B 放入一级缓存 singletonObjects                            │
│   2. 从二级缓存 earlySingletonObjects 移除 B（如果有）              │
│   3. 从三级缓存 singletonFactories 移除 B（如果有）                 │
└─────────────────────────────────────────────────────────────────────┘
            │
            ▼
┌─────────────────────────────────────────────────────────────────────┐
│ 继续创建 A                                                         │
│   1. 将 B 注入到 A                                                  │
│   2. A 创建完成                                                    │
│   3. 将 A 放入一级缓存 singletonObjects                            │
│   4. 从二级缓存 earlySingletonObjects 移除 A                        │
│   5. 从三级缓存 singletonFactories 移除 A                           │
└─────────────────────────────────────────────────────────────────────┘
```