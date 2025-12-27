title: 传教士和野人问题（M-C问题）
author: SaltedMdFiveSh
tags:
  - 算法
categories:
  - 算法
date: 2019-10-12 20:44:00
---
---

有N个传教士和N个野人来到河边渡河，河岸有一条船，每次至多可供k人乘渡。河两岸以及船上的野人数目总是不超过传教士的数目(否则不安全，传教士有可能被野人吃掉)。即求解传教士和野人从左岸全部摆渡到右岸的过程中，任何时刻满足M(传教士数)≥C(野人数)和M+C≤k的摆渡方案。以下讨论三个传教士三个野人还有一条船最多能载两个人的方案。

> 状态空间

我们用一个三元组(m，c，b)来表示河岸上的状态，其中m、c分别代表某一岸上传教士与野人的数目，b=1表示船在这一岸，b=0则表示船不在

约束条件是: 两岸上M≥C, 船上M+C≤2

（mi，ci）为船上的传教士和野人数量

左岸初态为（3,3,1），终态为（0,0,0）

![upload successful](\images\pasted-35.png)

---

> 为什么不能直接暴力穷举然后剪枝？

因为可能运过去两个人，然后又把同样的两个人运回来了(或者使用别的形式但是依旧是空转)，所以要杜绝这种可能，当然最好的方法就是使用带有记忆的状态，如果之前遇到过这种状态那就拒绝执行return。

所以....如何实现去重的目标？？？

答：set<string/int>，我采取的是单个状态采用int，记录路径经过的状态采用string（中间用空格隔开）

```
#include<iostream>
#include<cstdio>
#include<map>
#include<string>
#include<set>
#include<vector>
using namespace std;
int N;
set<string>ans;
void print(vector<int>way){
    int i=0;
    string h;
    for(i=1;i<way.size();i++){
        printf("%03d   ",way[i]);
        if(way[i]<100){
            h+="0";
        }
        h+=to_string(way[i]);
        h+=" ";
    }
    cout<<"\n-------"<<endl;
    ans.insert(h);
}
void dfs(int pre,int ni,int nj,int c,set<int>s,vector<int>way){
    // set insert
    int now=ni*100+nj*10+c;
    s.insert(pre);    
    if(s.count(now)||(N-ni)<0||(N-nj)<0||ni<0||nj<0||(ni<nj&&ni!=0)||((N-ni)<(N-nj)&&(N-ni)!=0)){
        return;
    }
    if(pre==0){
        // 如果上一轮就截止了
        print(way);
        return;
    }
    way.push_back(pre);
    if(c==1){
        // zero people . no one on ship is illegal
        // dfs(now,ni,nj,0,s,way);
        // one people on
        dfs(now,ni-1,nj,0,s,way);
        dfs(now,ni,nj-1,0,s,way);
        // two people on
        dfs(now,ni-2,nj,0,s,way);
        dfs(now,ni,nj-2,0,s,way);
        dfs(now,ni-1,nj-1,0,s,way);
    }
    else{
        // zero people . no one on ship is illegal
        // dfs(now,ni,nj,1,s,way);
        // one people on
        dfs(now,ni+1,nj,1,s,way);
        dfs(now,ni,nj+1,1,s,way);
        // two people on
        dfs(now,ni+2,nj,1,s,way);
        dfs(now,ni,nj+2,1,s,way);
        dfs(now,ni+1,nj+1,1,s,way);        
    }
}
int main(){
    int chooseN;
    int c=1;
    // init num and ship side 1 means left and 0 means right
    int ni,nj;
    // Ni(传教士),Nj(野人) on the left side.
    int pre=-1;
    set<int>s;
    //cin>>chooseN;
    chooseN=3;
    N=nj=ni=chooseN;
    vector<int>way;
    dfs(pre,ni,nj,c,s,way);
    cout<<"\nfinally , the answer is:\n\n";
    for(auto it=ans.begin();it!=ans.end();it++){
        cout<<*it<<endl;
    }
}

/*
331   310   321   300   311   110   221   020   031   010   111   
-------
331   310   321   300   311   110   221   020   031   010   111   
-------
331   310   321   300   311   110   221   020   031   010   021   
-------
331   310   321   300   311   110   221   020   031   010   021
-------
331   220   321   300   311   110   221   020   031   010   111
-------
331   220   321   300   311   110   221   020   031   010   111   
-------
331   220   321   300   311   110   221   020   031   010   021
-------
331   220   321   300   311   110   221   020   031   010   021
-------

finally , the answer is:

331 220 321 300 311 110 221 020 031 010 021
331 220 321 300 311 110 221 020 031 010 111
331 310 321 300 311 110 221 020 031 010 021
331 310 321 300 311 110 221 020 031 010 111
*/
```

---

#### 传说中的基于A*算法的解法：

评估函数的建立：

$$f=d+h=d+M+N-2*B$$

M 表示左岸的传教士的人数，N 表示左岸野人的数目，B 取值为0或1 ，1 表示船在左岸，0 表示船在右岸。d 表示节点的深度。

* 下面我们来证明h(n)＝M+C-2B是满足A*条件的：

我们分两种情况考虑。
（1）先考虑船在左岸的情况。如果`不考虑限制条件`，也就是说，船一次可以将三人从左岸运到右岸，然后再有一个人将船送回来。这样，船一个来回可以运过河2人，而船仍然在左岸。而最后剩下的三个人，则可以一次将他们全部从左岸运到右岸。所以，在不考虑限制条件的情况下，也至少需要摆渡[(M+N-3)/2]*2+1次。其中分子上的"－3"表示剩下三个留待最后一次运过去。除以"2"是因为一个来回可以运过去2人，需要[(M+N-3)/2]个来回，而"来回"数不能是小数，需要向上取整，这个用符号[ ]表示。而乘以"2"是因为一个来回相当于两次摆渡，所以要乘以2。而最后的"＋1"，则表示将剩下的3个运过去，需要一次摆渡。

化简得：需要 M+N-2次单向摆渡

（2）再考虑船在右岸的情况。同样不考虑限制条件。船在右岸，需要一个人将船运到左岸。因此对于状态(M，N，0)来说，其所需要的最少摆渡数，相当于船在左岸时状态(M+1，N，1)或(M，N+1，1)所需要的最少摆渡数，再加上第一次将船从右岸送到左岸的一次摆渡数。因此所需要的最少摆渡数为：(M+N+1)-2+1。其中(M+N+1)的"＋1"表示送船回到左岸的那个人，而最后边的"＋1"，表示送船到左岸时的一次摆渡。

化简有：(M+N+1)-2+1=M+N。

综合船在左岸和船在右岸两种情况下，所需要的最少摆渡次数用一个式子表示为：$M+N-2B$ ，其中B＝1表示船在左岸，B＝0表示船在右岸。该摆渡次数是在不考虑限制条件下，推出的最少所需要的摆渡次数。
