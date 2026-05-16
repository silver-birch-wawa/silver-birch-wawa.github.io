title: mvcc的底层
author: SaltedMdFiveSh
date: 2026-01-11 23:22:18
tags:
---
---

### Undo Log

Undo Log 是 MVCC 实现的关键。它记录了数据修改前的旧值，用于事务回滚和 MVCC 的实现。Undo Log 分为 insert undo log 和 update undo log。

### 版本链

每次更新操作都会生成一个新的版本，并通过 roll_pointer 将所有版本连接成一个链表。版本链的头节点代表当前记录的最新值。