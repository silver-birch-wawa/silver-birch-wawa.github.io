title: Binlog主从同步和格式
author: SaltedMdFiveSh
tags:
  - MYSQL
categories:
  - MYSQL
date: 2026-01-16 16:55:00
---
---

* 从库读主库的位点存在从库，跟MQ不一样

![upload successful](/images/pasted-112.png)

造成主从延迟的原因：

（1）大事务（因为从库必须严格按照主库上 Binlog 记录的事务提交顺序来重放这些事务，否则会导致数据不一致）

（2）从库IO/CPU瓶颈

（3）网络带宽

（4）同步机制的问题，全同步导致LAG

---

### 主从延迟高怎么办？

binlog压缩

自动监控下线延迟高的从库

并行复制binlog（多个事务打包执行，只写一次磁盘。不同数据库（schema）的事务在从库可并行执行。基于事务修改的数据行并行）

![upload successful](/images/pasted-138.png)

SSD磁盘

可通过binlog_row_image参数控制记录粒度：FULL（默认，完整行镜像）、MINIMAL（仅记录变化列）、NOBLOB（不记录 BLOB/TEXT 列），来减少日志体积。

### MIXED格式什么时候需要切到ROW？

自动切换到 ROW 模式的典型场景：

使用非确定性函数（如 NOW ()、UUID ()、RAND ()）

操作包含 AUTO_INCREMENT 列的表并调用触发器 / 存储函数

执行 DML 语句涉及视图且视图定义需要行级复制

执行 LOAD DATA INFILE 语句


### binlog协议格式（ROW格式）

不同操作记录内容：

INSERT：记录新插入行的完整数据（后镜像）

DELETE：记录被删除行的完整数据（前镜像）

UPDATE：同时记录变更前后的整行数据（前 + 后镜像）

![upload successful](/images/pasted-151.png)

### 不同格式PK

* ROW 的体积比 STATEMENT 大

对比项	|STATEMENT	|ROW	|MIXED
-|-|-|-
日志体积	|最小	|最大	|中等
主从一致性	|较低	|最高	|中等
数据审计能力	|弱	|强	|中等
复制性能	|较高	|较低	|中等
故障恢复精度	|行级以下	|精确到行	|行级以下

金融 / 支付系统：优先选择ROW 模式，确保数据一致性和可追溯性

大数据量批量更新：考虑MIXED 模式或调整binlog_row_image=MINIMAL减少日志体积

简单查询为主的系统：可用STATEMENT 模式提升性能

主从复制环境：MySQL 8.0 + 推荐默认ROW 模式，避免数据不一致问题