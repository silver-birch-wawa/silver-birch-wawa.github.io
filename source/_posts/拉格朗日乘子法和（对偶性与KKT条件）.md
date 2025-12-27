title: 拉格朗日乘子法和（对偶性与KKT条件）
author: SaltedMdFiveSh
tags: []
categories: []
date: 2019-10-14 22:26:00
---
https://blog.csdn.net/weixin_37688445/article/details/79275526
https://www.matongxue.com/madocs/939.html
https://www.matongxue.com/madocs/987/

---

>  拉格朗日乘子法（约束条件为等式）

$\begin{cases}
min f(x) \\\\
\\
h_i(x)=0，i=0，1，...，n
\end{cases}$

在两个图线外相切的时候达到最小值，法向量方向相反

$\begin{cases}
\nabla f(x)=-\nabla \lambda\star h_i(x) =>  \nabla f(x)+\nabla \lambda\star h_i(x)=0\\\\
\\
h_i(x)=0，i=0，1，...，n
\end{cases}$

最终表达式：

$\begin{cases}
L(x,a)=min[f(x)+\sum_{i=1}^{n}a_ih_i(x)]
\\\\
h_i(x)=0，i=0，1，...，n
\end{cases}$

求解：$\nabla_xL(x,a)=0$还有$\nabla_aL(x,a)=0$可得最优解的x和a

![upload successful](\images\pasted-44.png)

> 拉格朗日的KKT条件

* 初试条件：

$\begin{cases}
min f(x) \\\\
\\
g(x) <= 0
\end{cases}$

* 推导出来的最终公式：

$\begin{cases}
式1： L(x,a)=min[f(x)+\lambda*g(x)]\\\\
式2： g(x) = 0 \\\\
式3：\lambda>0
\end{cases}$

*情况1： 如果可行解直接落在约束条件范围内，即落在g(x)<0的范围内，则直接删掉约束条件即可。（但是最优点依旧满足前提：公式1即使两条线在$r_f$≈0的时候不相交）

*情况2：如果可行解落在约束条件外，则最优解在边界上去的，即在g(x)=0的曲线上取得。（此时转换为前面讲的等式条件下求最优解的问题，直接套上面的公式）


![upload successful](\images\pasted-43.png)

以上两种状况要么落在约束区域内，则$\lambda_解$=0，因为直接去掉约束条件即可，要么落在约束条件边界上，则$g(x)_解=0$, 综合起来就是$\lambda*g(x)=0$

还有一个问题就是$\lambda$的取值问题，当$\lambda$不等于0的时候，即最优解在$g(x)=0$上取得时，$f(x,y)$梯度方向必须要和$g(x)=0$的梯度方向相反，即$-\nabla_xf(x)=\lambda\nabla_xg(x)$，所以$\lambda$一定大于0，要不然就恒非零了。

![upload successful](\images\pasted-42.png)

---

> 拉格朗日对偶性：（$\lambda$改为a表示）

1.原始最优化问题：

$\begin{cases}
式1： \min_{x \in R^n} f(x)\\\\
式2： c_i(x)<=0 ， i=1，2，...，k \\\\
式3：h_j(x)=0 ，j=1，2，...，l
\end{cases}$

$L(x,a,\beta)=f(x)+\sum_{i=1}^{k}a_ic_i(x)+\sum_{j=1}^{l}\beta_jh_j(x)$

2.极小极大问题：

$令\theta_P(x)=\max_{a,\beta:a_i>=0}L(x,a,\beta)$

如果$i$和$j$当中有一个不满足`式2`/`式3`条件，那么必然存在某个$i$满足$c_i(x)>0$，可令$a_i->+\infty$，或者存在某个$j$满足$h_j(x) \ne 0$，则可令$\beta_jh_j(x)\rightarrow +\infty$，而将其余各个$a_i$，$\beta_j$均取为$0$，使得$\theta_P(x)=+\infty$

所以`max`化的拉格朗日函数 $\theta_P(x)=\begin{cases}
f(x) ， x满足原始问题约束\\\\
+\infty ， 其他
\end{cases}$

接着考虑max条件下的min最优值：
$$p^*=min \theta_P(x)=\min_{x} \max_{a,\beta:a_i>=0} L(x,a,\beta)$$

---

3.极大极小问题：

$\max_{a,\beta}\theta_D(a,\beta)=\max_{a,\beta}\min_{x}L(x,a,\beta)，a_i>=0$

最优解：$d^*=\max_{a,\beta:a_i>=0}\theta_D(a,\beta)$

---

4.极大极小问题与极小极大问题的解什么时候相等？

maxmin和minmax的最优解有以下大小关系：
$$d^*=\max_{a,\beta:a_i>=0}\min_{x}L(x,a,\beta)<=\min_{x} \max_{a,\beta:a_i>=0} L(x,a,\beta)=p^*$$

如果满足$f(x)$和$c_i(x)$是凸函数，$h_j(x)$是仿射函数，和KKT条件，则：
$$d^*=L(x^*,a^*,\beta^*)=p^*$$

KKT条件是$d^\star$ = $p^\star$的充要条件：

$$\nabla_xL(x^*,a^*,\beta^*)=0$$

$$a_i^*c_i(x^*)=0，i=1,2,...,k$$

$$c_i(x^*)<=0 ，i=1,2,...,k$$

$$a_i^*>=0 ， i=1,2,...,k$$

$$h_j(x^*)=0，j=1，...，l$$