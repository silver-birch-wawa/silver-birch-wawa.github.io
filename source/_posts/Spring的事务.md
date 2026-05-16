title: Spring的事务
author: SaltedMdFiveSh
tags:
  - Spring
categories:
  - Spring
date: 2025-12-28 23:31:00
---
---

本质 = AOP + 事务管理器DataSourceTransactionManager（负责关闭autocommit、执行commit和rolllback）

### 什么时候事务无法传递？

#### 1.AOP代理失败


如果在 同一个类内部 直接调用带有 @Transactional 注解的方法，调用不会经过代理，事务失效。
```
@Service
public class UserService {

    public void updateUser() {
        // 直接调用本类的事务方法，事务失效
        doUpdate();
    }

    @Transactional
    public void doUpdate() {
        // 事务逻辑
    }
}
```
* 解决方法：

1.通过 Spring 容器获取代理对象（如 self = applicationContext.getBean(UserService.class)）。

2.拆分到不同的类中，让调用走代理。

---

#### 2.异常类型不匹配


Spring 默认只在 运行时异常（RuntimeException） 或 Error 时回滚事务，受检异常（Checked Exception） 默认不会回滚。
```
@Transactional
public void updateUser() throws Exception {
    // 抛出受检异常，事务不会回滚
    throw new Exception("出错了");
}
```
* 解决方案：

显式指定回滚异常类型：
```
@Transactional(rollbackFor = Exception.class)
```
改为抛出运行时异常。

---

### 3.事务方法被声明为 static 或 final

Spring 事务代理需要生成子类（CGLIB）或实现接口（JDK 动态代理）。如果方法是 static 或 final，代理无法覆盖，事务失效。
```
@Transactional
public final void updateUser() {
    // 事务失效
}
```
解决方法：去掉 static 或 final 修饰符。


---

### 4.事务方法不是 public
Spring 事务代理只对 public 方法 生效，private、protected 或默认访问权限的方法不会被代理。

---

### 5.多线程环境下事务失效

Spring 事务是基于 ThreadLocal 管理的，如果在事务方法中开启新线程，新线程无法继承事务上下文，事务失效。
```
@Transactional
public void updateUser() {
    new Thread(() -> {
        // 新线程中的事务逻辑，事务失效
    }).start();
}
```

---

### 6.数据源或事务管理器配置错误
数据源未被 Spring 事务管理器管理。

事务管理器配置的数据源与实际使用的数据源不一致。
```
@Bean
public PlatformTransactionManager transactionManager(DataSource dataSource) {
    return new DataSourceTransactionManager(dataSource);
}
```
如果 dataSource 没有被 Spring 管理，事务失效。