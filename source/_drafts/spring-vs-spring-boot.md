title: spring vs spring boot
author: SaltedMdFiveSh
date: 2026-01-19 18:54:37
tags:
---
---

```
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-web</artifactId>
</dependency>
```

```
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication // 包含组件扫描、自动配置、配置类三大核心注解
public class WebApplication {
    public static void main(String[] args) {
        SpringApplication.run(WebApplication.class, args); // 一键启动内置Tomcat
    }
}
```

### boot的自动配置（AutoConfiguration）

@SpringBootApplication：这是一个组合注解，它集成了 @SpringBootConfiguration、@EnableAutoConfiguration 和 @ComponentScan。

@SpringBootConfiguration：标识这是一个 Spring Boot 的配置类。

@EnableAutoConfiguration：告诉 Spring Boot 开始基于类路径下的配置、其他bean和各种属性设置自动配置。

@ComponentScan：扫描并加载符合条件的组件或bean，通常是指定包下的类。

@EnableAutoConfiguration 注解触发自动配置的魔法。这个注解本身通过 @Import 导入了 AutoConfigurationImportSelector 类，这个类负责读取 META-INF/spring.factories 文件，并将其中定义的配置类加载到 Spring 容器中。

Spring Boot 还允许开发者自定义 Starter，通过创建符合特定格式的 spring.factories 文件，并在其中指定自动配置类，可以实现特定功能的快速集成。例如，创建一个日志打印的 Starter，只需在项目中引入该 Starter 并进行简单配置，即可实现日志打印功能。

### spring-boot-starter-web


### 服务器部署/开发

spring：需手动打包为 WAR 包，部署到外部 Tomcat/Jetty 等服务器	

spring boot：内置 Tomcat/Jetty/Undertow，可直接打包为 JAR 包，通过java -jar命令运行