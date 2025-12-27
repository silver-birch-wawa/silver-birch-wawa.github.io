title: memset与虚函数
author: SaltedMdFiveSh
tags:
  - C++
categories:
  - C++
date: 2020-05-15 15:33:00
---
---

```
class BaseParameters
{
public:
  virtual void reset() {}
};
class MyParameters : public BaseParameters
{
public:
  int data[3];
  int buf[3];
};
MyParameters my_pars;
memset(&my_pars, 0, sizeof(my_pars));
BaseParameters* pars = &my_pars;
//.....
MyParameters* my = dynamic_cast<MyParameters*>(pars);
```
初始化数据结构MyParameters里的data和buf，正常来说需要初始化的内存空间是sizeof(int) * 3 * 2 = 24字节，但是使用memset初始化MyParameters类型的数据结构时，sizeof(my_pars)却是28字节。

因为为了实现多态机制，C++对有虚函数的对象会包含一个指向虚函数表(V-Table)的指针，当使用memset时，会把该虚函数表的指针也初始化为0，而dynamic_cast也使用RTTI技术，运行时会使用到V-Table，可此时由于与V-Table的链接已经被破坏，导致程序发生异常。