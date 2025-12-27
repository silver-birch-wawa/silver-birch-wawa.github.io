title: VC维
author: SaltedMdFiveSh
tags:
  - Machine Learning
categories: []
date: 2019-10-12 21:00:00
---
---

VC 维是衡量函数类的复杂度的一种方式，通过评估函数类中函数的弯曲程度实现。WIKI上的解释是：空间中的点在经过排列之后，能够被模型f打散(shatter)的最大数量。

通过$y=a_0+a_1^Tx$将平面分割为两部分，如果满足平面中任意N个点（无论如何取值）总能被一条直线分开，而N+1个点却不行，则称该函数情况下的VC维为N。

![upload successful](\images\pasted-39.png)

举个无穷的VC维的例子：

$$f(x,a)=I(sina*x)$$

![upload successful](\images\pasted-40.png)

从这两个例子，可以看出VC维刻画了函数的弯曲程度，越弯曲其VC维越大。