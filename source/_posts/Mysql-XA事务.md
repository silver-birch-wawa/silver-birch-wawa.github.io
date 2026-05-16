title: Mysql XA事务
author: SaltedMdFiveSh
tags:
  - MYSQL
categories:
  - MYSQL
date: 2026-01-20 17:31:00
---
---

### 本地2PC：与 binlog 的协同

* 两阶段提交的关键：

确保 XA 事务在 binlog 和存储引擎日志中的一致性。

准备阶段：InnoDB 将事务状态写入 redo log（标记为PREPARE），但不写入 binlog。

提交阶段：MySQL 将完整事务写入 binlog。

InnoDB 检查 binlog 是否存在该事务，若存在则将 redo log 标记为COMMIT。

* 重启时检查：

若 redo log 中有PREPARE状态的事务：

binlog 存在该事务：提交事务（完成第二阶段）。

binlog 不存在该事务：回滚事务。

### 三组件模型

应用程序（AP） ：发起分布式事务的主体。

事务管理器（TM） ：协调全局事务，如 MySQL Server 层。

资源管理器（RM） ：管理资源的组件，如 InnoDB 存储引擎或外部数据库。

```
-- 开始XA事务
XA START 'tx1';  -- 事务ID 'tx1'
-- 执行跨库操作
INSERT INTO db1.table1 VALUES (1);
UPDATE db2.table2 SET col = 'value';
-- 结束事务定义
XA END 'tx1';

作者：hai99long
链接：https://juejin.cn/post/7523368862987337737
来源：稀土掘金
著作权归作者所有。商业转载请联系作者获得授权，非商业转载请注明出处。
```
![upload successful](/images/pasted-135.png)

### 2PC

XA 的实现基础：XA 事务通常采用两阶段提交算法实现原子性。

准备阶段（Prepare） ：所有参与者将操作结果持久化，并报告准备就绪。

提交阶段（Commit） ：若所有参与者都准备就绪，事务管理器协调所有参与者提交；否则回滚。


