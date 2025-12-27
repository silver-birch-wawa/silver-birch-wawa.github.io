title: 成员初始化的顺序
author: SaltedMdFiveSh
tags:
  - C++
categories: []
date: 2020-05-05 20:28:00
---
---

可以看出成员被初始化的顺序和成员初始化表里面的顺序是没有关系的，只和成员的声明顺序有关。

```
#include <iostream>
using namespace std;
int seti() {cout << "seti" << endl;return 1;}
int setj() {cout << "setj" << endl;return 1;}
class a
{
public:
    a() {cout << "a()~~~~~" << endl;}
};
class b
{
public:
    b():j(setj()),i(seti()) {cout << "b()~~~~~" << endl;}
    int i;
    a ca;
    int j;
};
int main()
{
    b ob;
    return 0;
}
```

构造函数执行顺序：public里面 int i 先声明，就先构造 i，然后类a ca 声明，再构造 ca，然后声明 j，就构造 j，最后执行 b() 构造函数里面的东西。

![upload successful](/images/pasted-45.png)

---

另外举个例子：
```
#include <iostream>
using namespace std;
class A
{
private:
	int n1;
	int n2;
public:
	A():n2(0),n1(n2+2){}
	void Print(){
		cout << "n1:" << n1 << ", n2: " << n2 <<endl;  
	}
};
int main()
{ 
	A a;
	a.Print();
	return 1;
}
```
因为private里面先定义的n1再定义的n2，但是n1需要n2，n2没有初始化，所以n2是乱码，n1是0。


![upload successful](/images/pasted-46.png)
