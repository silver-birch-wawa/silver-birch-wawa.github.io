title: BeanFactory和FactoryBean
author: SaltedMdFiveSh
tags:
  - SPRING
  - JAVA
categories:
  - SPRING
  - JAVA
date: 2026-01-24 10:50:00
---
---

### BeanFactory（IOC容器接口，框架提供）

BeanFactory 是 Spring 框架中 IoC 容器的核心接口，负责 创建、配置、初始化和管理 Bean。它定义了容器的基本行为，如 getBean()、containsBean()、isSingleton() 等方法，是所有具体容器（如 ApplicationContext）的父接口。

ApplicationContext 继承了 BeanFactory，提供国际化、事件发布、自动注册后处理器等功能。
```
public interface BeanFactory {
    // 根据bean名称获取实例
    Object getBean(String name) throws BeansException;

    // 根据bean名称和类型获取实例
    <T> T getBean(String name, Class<T> requiredType) throws BeansException;

    // 根据类型获取实例
    <T> T getBean(Class<T> requiredType) throws BeansException;

    // 判断容器是否包含指定bean
    boolean containsBean(String name);

    // 判断bean是否为单例
    boolean isSingleton(String name) throws NoSuchBeanDefinitionException;

    // 获取bean的类型
    Class<?> getType(String name) throws NoSuchBeanDefinitionException;

    // 获取bean的别名
    String[] getAliases(String name);
}
```

ApplicationContext:
```
// ApplicationContext的核心增强功能
public interface ApplicationContext extends BeanFactory,
    MessageSource,              // 国际化消息支持
    ApplicationEventPublisher,  // 事件发布功能
    ResourcePatternResolver {   // 资源加载能力

    // 获取应用ID
    String getId();

    // 获取应用名称
    String getApplicationName();

    // 获取显示名称
    String getDisplayName();

    // 获取启动时间
    long getStartupDate();

    // 获取父上下文
    ApplicationContext getParent();
}
```

### FactoryBean（工厂Bean接口，私人定制）

封装复杂初始化构造逻辑

FactoryBean接口提供了三个方法：getObject()、getObjectType()和isSingleton()

FactoryBean 是一个特殊的 Bean，它本身是一个工厂，用于创建和管理其他 Bean 实例。当需要创建过程复杂的 Bean 对象时，FactoryBean 提供了优雅的封装方案。

```
// 实现FactoryBean接口
public class MyFactoryBean implements FactoryBean<MyBean> {
   @Override
   public MyBean getObject() throws Exception {
       return new MyBean(); // 自定义Bean的创建逻辑
   }
   @Override
   public Class<?> getObjectType() {
       return MyBean.class;
   }
   @Override
   public boolean isSingleton() {
       return true; // 返回是否为单例
   }
}
```