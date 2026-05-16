title: select ... for update
author: SaltedMdFiveSh
date: 2026-01-28 12:29:39
tags:
---
---

### 如果where没有命中数据怎么办？

RC，无影响。

RR，隔离级别下锁定 “不存在的行所在的间隙”

---

### 一个RR下死锁的badcase

同一个事务中先delete 后 insert的情况

数据分布：
```
Id           taskId
1              2
3              9
10            20
40            41
```

实际执行
```
sql> delete from task_queue where taskId = 20;
sql> delete from task_queue where taskId = 25;
sql> insert into task_queue values(20, 20);
sql> insert into task_queue values(30, 25);
```

最后一条语句：insert into task_queue values(30, 25); 执行时就会爆出死锁错误。因为删除taskId = 25这条记录的时候，20 --  41 都被锁住了， 他们都取得了这一个数据段的共享锁， 所以在获取这个数据段的排它锁时出现死锁。

### 解决办法

1.通过修改innodb_locaks_unsafe_for_binlog参数来取消间隙锁从而达到避免这种情况的死锁的方式尚待商量

2.修改代码逻辑，存在才删除，尽量不去删除不存在的记录。

3.引入分布式锁

4.更改隔离级别 RC： 可以解决死锁问题，但会引入不可重复读和幻读现象；

---

### 几种数据库锁

* 临键锁（Next-Key Lock）：

定义： 这是 InnoDB 默认的行锁算法！ 它是记录锁（Record Lock）和间隙锁（Gap Lock）的组合。它锁住索引记录本身以及该记录之前的间隙。

* 间隙锁（Gap Lock）：

等值查询但记录不存在（WHERE id = 15，但数据库只有id=10和id=20的记录）时，会锁住这个不存在的记录所属的间隙（例如 (10, 20)）。

* 加锁的场景：

加行锁的查询：SELECT ... FOR UPDATE（排他当前读）、SELECT ... LOCK IN SHARE MODE（共享当前读）；

数据更新：UPDATE（针对满足条件的行）；

数据删除：DELETE（针对满足条件的行）。
