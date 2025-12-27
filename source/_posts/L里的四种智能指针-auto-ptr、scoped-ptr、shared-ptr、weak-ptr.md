title: 'STL里的四种智能指针auto_ptr,scoped_ptr,shared_ptr,weak_ptr'
author: SaltedMdFiveSh
tags:
  - C++
  - STL
categories:
  - C++
  - STL
date: 2019-08-14 20:53:00
---
---

> 基于安全考虑：
```
auto_ptr< string> ps (new string ("I reigned lonely as a cloud.”）;
auto_ptr<string> vocation; 
vocaticn = ps;
```
因为程序将试图删除同一个对象两次，要避免这种问题，方法有多种：

（1）定义赋值运算符，使之执行深复制。这样两个指针将指向不同的对象，其中的一个对象是另一个对象的副本，缺点是浪费空间，所以智能指针都未采用此方案。

（2）建立所有权概念。对于特定的对象，只能有一个智能指针可拥有，这样只有拥有对象的智能指针的析构函数会删除该对象。然后让赋值操作转让所有权。这就是用于auto_ptr和unique_ptr 的策略，但unique_ptr的策略更严格。

（3）创建智能更高的指针，跟踪引用特定对象的智能指针数。这称为引用计数。例如，赋值时，计数将加1，而指针过期时，计数将减1,。当减为0时才调用delete。这是shared_ptr采用的策略。

---

## 1. unique_ptr：
unique_ptr由C++11引入，旨在替代不安全的auto_ptr。
unique_ptr不共享它的所管理的对象。它无法复制到其他unique_ptr，无法通过值传递到函数，也无法用于需要副本的任何标准模板库 （STL）算法。只能移动 unique_ptr，即对资源管理权限可以实现转移。


![upload successful](\images\pasted-7.png)
```
//智能指针的创建  
unique_ptr<int> u_i; //创建空智能指针
u_i.reset(new int(3)); //"绑定”动态对象  
unique_ptr<int> u_i2(new int(4));//创建时指定动态对象
unique_ptr<T,D> u(d);	//创建空unique_ptr,执行类型为T的对象，用类型为D的对象d来替代默认的删除器delete

//所有权的变化  
int *p_i = u_i2.release(); //释放所有权  
unique_ptr<string> u_s(new string("abc"));  
unique_ptr<string> u_s2 = std::move(u_s); //所有权转移(通过移动语义)，u_s所有权转移后，变成“空指针” 
u_s2.reset(u_s.release());//所有权转移
u_s2=nullptr;//显式销毁所指对象，同时智能指针变为空指针。与u_s2.reset()等价
```

## 2.auto_ptr：为什么不用它而用unique_ptr
使用unique_ptr时编译出错，与auto_ptr一样，unique_ptr也采用所有权模型，但在使用unique_ptr时，程序不会等到运行阶段崩溃，而在编译期因下述代码行出现错误。一句话总结就是：避免因潜在的内存问题导致程序崩溃。
```
int main()
{
	auto_ptr<string> films[5] ={
	auto_ptr<string> (new string("Fowl Balls")),
	auto_ptr<string> (new string("Duck Walks")),
	auto_ptr<string> (new string("Chicken Runs")),
	auto_ptr<string> (new string("Turkey Errors"))
	};
    auto_ptr<string> pwin;
    pwin = films[2]; 
    // films[2] loses ownership. 将所有权从films[2]转让给pwin，此时films[2]不再引用该字符串从而变成空指针

	for(int i = 0; i < 4; ++i)
	{
		cout << *films[i] << endl;
	}
	return 0;
}
```
从上面可见，unique_ptr比auto_ptr更加安全，因为auto_ptr有拷贝语义，拷贝后原象变得无效，再次访问原对象时会导致程序崩溃；unique_ptr则禁止了拷贝语义，但提供了移动语义，即可以使用std::move()进行控制权限的转移
```
unique_ptr<string> upt(new string("lvlv"));
unique_ptr<string> upt1(upt);	//编译出错，已禁止拷贝
unique_ptr<string> upt1=upt;	//编译出错，已禁止拷贝
unique_ptr<string> upt1=std::move(upt);  //控制权限转移，正确的写法

auto_ptr<string> apt(new string("lvlv"));
auto_ptr<string> apt1(apt);	//编译通过
auto_ptr<string> apt1=apt;	//编译通过
```
* 使用shared_ptr时运行正常，因为shared_ptr采用引用计数，pwin和films[2]都指向同一块内存，在释放空间时因为事先要判断引用计数值的大小因此不会出现多次删除一个对象的错误。

## 3. shared_ptr
参看`内存垃圾管理（智能指针）`

## 4. weak_ptr
被设计为与shared_ptr共同工作，可以从一个shared_ptr或者另一个weak_ptr对象构造而来。

> 循环引用：

一般来讲，解除这种循环引用有下面三种可行的方法：
（1）当只剩下最后一个引用的时候需要手动打破循环引用释放对象。
（2）当parent的生存期超过children的生存期的时候，children改为使用一个普通指针指向parent。
（3）使用弱引用的智能指针打破这种循环引用。
虽然这三种方法都可行，但方法1和方法2都需要程序员手动控制，麻烦且容易出错。这里主要介绍一下第三种方法，使用弱引用的智能指针`std:weak_ptr`来打破循环引用。

