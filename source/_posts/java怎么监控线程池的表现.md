title: java线程池
author: SaltedMdFiveSh
tags:
  - JAVA
categories:
  - JAVA
date: 2026-01-19 23:29:00
---
---

## 线程池配置

### 拒绝策略怎么选？

核心业务：优先CallerRunsPolicy（避免任务丢失，同时限流）或自定义拒绝策略（如记录日志 + 告警 + 降级）；

非核心业务：可选择DiscardOldestPolicy或DiscardPolicy（允许丢失低优先级任务）；

禁止使用默认的AbortPolicy（未捕获异常会导致业务中断）。


## 怎么监控线程池的表现？

### 自己开一个线程打印
```
// 打印线程池监控指标
public static void printThreadPoolStatus(ThreadPoolExecutor executor) {
        // 定时打印（每5秒打印一次）
        ScheduledExecutorService scheduler = Executors.newSingleThreadScheduledExecutor();
        scheduler.scheduleAtFixedRate(() -> {
            System.out.println("===== 线程池监控指标 =====");
            System.out.println("核心线程数: " + executor.getCorePoolSize());
            System.out.println("当前线程数: " + executor.getPoolSize());
            System.out.println("活跃线程数: " + executor.getActiveCount());
            System.out.println("最大线程数: " + executor.getMaximumPoolSize());
            System.out.println("队列等待任务数: " + executor.getQueue().size());
            System.out.println("已完成任务数: " + executor.getCompletedTaskCount());
            System.out.println("被拒绝任务数: " + REJECTED_TASK_COUNT.get());
            System.out.println("==========================");
        }, 0, 5, TimeUnit.SECONDS);
}
```

### Spring Boot 集成 Actuator（生产环境推荐）

如果你的项目是 Spring Boot，可直接集成spring-boot-starter-actuator，它能自动暴露线程池指标，无需手动编写监控代码，适合生产环境。

引入依赖：
```
<!-- Spring Boot Actuator 核心依赖 -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-actuator</artifactId>
</dependency>
<!-- 可选：若需暴露Prometheus格式指标，用于可视化 -->
<dependency>
    <groupId>io.micrometer</groupId>
    <artifactId>micrometer-registry-prometheus</artifactId>
</dependency>
```
配置 Actuator 暴露线程池指标：
```
# 暴露所有Actuator端点（生产环境建议只暴露需要的）
management:
  endpoints:
    web:
      exposure:
        include: health,info,metrics,threaddump  # 关键：metrics（指标）、threaddump（线程dump）
  # 自定义线程池指标前缀（便于识别）
  metrics:
    tags:
      application: my-app
    registry:
      prometheus:
        enabled: true
```
注册自定义线程池到 Spring：
```
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;

import java.util.concurrent.ThreadPoolExecutor;

@Configuration
public class ThreadPoolConfig {

    @Bean(name = "businessThreadPool") // 命名线程池，便于监控识别
    public ThreadPoolTaskExecutor businessThreadPool() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(5);
        executor.setMaxPoolSize(10);
        executor.setQueueCapacity(100);
        executor.setKeepAliveSeconds(60);
        executor.setThreadNamePrefix("business-");
        // 拒绝策略
        executor.setRejectedExecutionHandler(new ThreadPoolExecutor.AbortPolicy());
        // 初始化线程池
        executor.initialize();
        return executor;
    }
}
```

* 访问监控端点

查看所有指标：http://localhost:8080/actuator/metrics

查看指定线程池指标：http://localhost:8080/actuator/metrics/executor.active?tag=name:businessThreadPool 可获取该线程池的活跃线程数、队列长度、完成任务数等核心指标。

线程 dump（排查线程阻塞）：http://localhost:8080/actuator/threaddump

### 线程池中线程的五个状态

线程池的五种运行状态

RUNNING ： 该状态的线程池既能接受新提交的任务，又能处理阻塞队列中任务。

SHUTDOWN： 该状态的线程池不能接收新提交的任务，但是能处理阻塞队列中的任务。（政府服务大厅不在允许群众拿号了，处理完手头的和排队的政务就下班。）

STOP： 该状态的线程池不接受新提交的任务，也不处理在阻塞队列中的任务，还会中断正在执行的任务。

TIDYING： 如果所有的任务都已终止，workerCount (有效线程数)=0

TERMINATED： 在terminated()钩子方法执行完后进入该状态，默认terminated()钩子方法中什么也没有做

![upload successful](/images/pasted-144.png)

shutdown方法将线程池的状态设置为SHUTDOWN状态，只会中断空闲的工作线程。

shutdownNow方法将线程池的状态设置为STOP状态，会中断所有工作线程，不管工作线程是否空闲。

调用两者中任何一种方法，都会使isShutdown方法的返回值为true；线程池中所有的任务都关闭后，isTerminated方法的返回值为true。
通常使用shutdown方法关闭线程池，如果不要求任务一定要执行完，则可以调用shutdownNow方法。

### 线程池核心的七大核心参数

* corePoolSize（线程池的基本大小）

* maximumPoolSize（线程池的最大数量）： 线程池允许创建的最大线程数。

* workQueue（工作队列）： 用于保存等待执行的任务的阻塞队列

ArrayBlockingQueue： 基于数组结构的有界阻塞队列，按FIFO（先进先出）原则对任务进行排序。使用该队列，线程池中能创建的最大线程数为maximumPoolSize。

LinkedBlockingQueue： 基于链表结构的无界阻塞队列，按FIFO（先进先出）原则对任务进行排序，吞吐量高于ArrayBlockingQueue。使用该队列，线程池中能创建的最大线程数为corePoolSize。静态工厂方法 Executor.newFixedThreadPool()使用了这个队列。

SynchronousQueue： 一个不存储元素的阻塞队列。添加任务的操作必须等到另一个线程的移除操作，否则添加操作一直处于阻塞状态。静态工厂方法 Executor.newCachedThreadPool()使用了这个队列。

PriorityBlokingQueue： 一个支持优先级的无界阻塞队列。使用该队列，线程池中能创建的最大线程数为corePoolSize。


阻塞线程安全有界队列 BlockingQueue，采用 ReentrantLock 来实现线程间的同步控制。

* keepAliveTime（keepAliveTime是线程池中空闲线程等待工作的超时时间）

* unit（空闲线程存活时间keepAliveTime的单位，枚举类型TimeUnit类）

* handler（饱和策略，或者又称拒绝策略）

### 线程池的执行流程

1.线程池判断核心线程池是否满了。 如果不是，创建一个新的核心线程来执行任务。

2.线程池判断阻塞队列是否已满。 如果阻塞队列没有满，则将新提交的任务存储在阻塞队列中。

3.非核心线程没满，但是阻塞队列满了，创建非核心线程。

4.如果非核心线程满了，但是队列也满了，走拒绝策略。

![upload successful](/images/pasted-142.png)

![upload successful](/images/pasted-143.png)

### 线程池怎么取消提交的任务？

底层会修改任务的状态（如 FutureTask 的 state 字段，从 NEW 改为 CANCELLED）；

任务队列中的未执行任务，会被标记为取消，线程池取任务时会跳过这些任务。