title: POJO VO DTO
author: SaltedMdFiveSh
tags:
  - JAVA
categories:
  - JAVA
date: 2026-01-10 17:49:00
---
![upload successful](/images/pasted-91.png)

### POJO

POJO 仅包含私有属性、公共的 getter 和 setter 方法，以及可能的构造方法和其他业务方法。

创建一个 POJO 类，通常包含以下步骤：

1.定义私有属性。

2.提供公共的 getter 和 setter 方法。

3.可选地提供构造方法。
```
public class User {
    private String name;
    private int age;
 
    // 构造方法
    public User() {}
 
    public User(String name, int age) {
        this.name = name;
        this.age = age;
    }
 
    // Getter 和 Setter 方法
    public String getName() {
        return name;
    }
 
    public void setName(String name) {
        this.name = name;
    }
 
    public int getAge() {
        return age;
    }
 
    public void setAge(int age) {
        this.age = age;
    }
}
```

### 数据传输对象（DTO）

DTO用于不同层之间的数据传输，尤其是Service层与Controller层的交互。


特点：    

1.可能包含多个PO的组合或裁剪后的字段（例如从30个字段中选取10个传输）

2.支持序列化，常用于远程调用（如RPC、HTTP接口）

3.无业务逻辑

---

### 持久化对象（Entity）

与数据库表中的记录映射


### BO（Business Object，业务对象）

Service层内部业务逻辑,封装复杂业务逻辑，可包含多个PO的组合。


### VO（View Object，视图对象）

定义：VO是展示层（前端页面）直接使用的对象，仅包含前端需要展示的数据，通常以JSON形式返回

应用场景：Controller层将数据封装为VO后传递给前端，避免暴露敏感字段（如密码、内部状态）