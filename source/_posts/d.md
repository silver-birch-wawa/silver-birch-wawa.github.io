title: kd树
author: SaltedMdFiveSh
tags:
  - Machine Learning
  - ''
categories:
  - Machine Learning
date: 2019-10-01 13:38:00
---
---

## kd树：

计算时采用线性扫描的方式O(n^2)，效率奇低。采用平衡二叉树的方法存储各个点，用中位数做分割，划分左右区间，并进行以x-y轴为中心进行交替选择。

![（2，4.5）](\images\pasted-11.png)

![（2.1，3.1）](\images\pasted-12.png)


> 算法复杂度：

构建：O(log2n)
插入：O(log n)
删除：O(log n)
查询：平均情况下 O(log n) ，最好情况 O(1)，最坏情况O(n)

---

> 1. 构建kd树：

（1）按y排序，抽取其中的中位数（向上取整）对应的点，axis代表的维自增。每个node保留一个指针指向父节点。

* 怎么确定split域的首先该取的值（先划分x轴还是y轴）？

分别计算x，y方向上数据的方差得知x方向上的方差最大

> 2. 搜寻确定查询点最小范围的点：

（1）先以y分割判断点A>Sy，向左子树查。
（2）再以x分割判断B<Sy，向右子树搜索。

> 3. while查找二维空间里的最近点。

如果点非空而且栈非空（在根节点退到root->f即空节点而且栈为空（叶节点情况下一般栈非空））退出。
（1）如果 minr < r(当前点，搜索点)，则无需查找另外一侧的子节点。r=r->f
（2）如果minr > r(当前点，搜索点)，则去另一侧的子节点找找看。r=r->l/r（看你搜索点在线的哪一侧（根据x/y相对大小），取反方向即可），同时，stack记录r。
（3）当r==NULL，触底回退到stack为空（保留stack[0]），然后r=r->f（会不会重新陷回r->l/r ？不会左边的minr可能值都遍历了，所以会使r指向另一侧，等栈pop回到原点时又毫不留情r=r->f）

```
#include<iostream>
#include<vector>
#include<algorithm>
#include<map>
using namespace std;
int splits=0;
// 维数
int now_axis=0;
// 当前所在维数
class kd_tree{
    public:
    vector<float>point;
    // (x,y,z...)
    float range;
    // x<range and x>range
    int split;
    // x,y,z....轴标记
    kd_tree*l;
    kd_tree*r;
    kd_tree*f;
    kd_tree(){
        l=NULL;
        r=NULL;
        f=NULL;
        range=0;
        split=0;
    }
};
kd_tree* insert(kd_tree*root,vector<float>v,int split){
    if(root==NULL){
        root=new kd_tree();
        root->point.assign(v.begin(),v.end());
        root->split=split;
        root->range=v[split];
        root->point.assign(v.begin(),v.end());
    }
    else{
        if(v[root->split]>root->range){
            root->r=insert(root->r,v,split);
            root->r->f=root;
        }
        else if(v[root->split]<root->range){
            root->l=insert(root->l,v,split);
            root->l->f=root;
        }
    }
    return root;
}
// 排序用
bool cmp(vector<float>a,vector<float>b){
    return a[now_axis]<b[now_axis];
}
// 初始化必须集齐所有数据
void init(kd_tree*&root,vector<vector<float>>v,int left,int right,int split){
    if(left>right){
        return;
    }
    now_axis=split%splits;
    
    sort(v.begin()+left,v.begin()+right+1,cmp);

    int middle=(left+right+1)/2;
    // +1是向上取整，不加是向下取整
    root=insert(root,v[middle],now_axis);
    init(root,v,left,middle-1,split+1);
    init(root,v,middle+1,right,split+1);
    return;
}
int choose_split(vector<vector<float>>v){
    int i,j;
    vector<float>ave(splits);
    for(i=0;i<splits;i++){
        float sum=0;
        for(j=0;j<v.size();j++){
            sum+=v[j][i];
        }
        ave[i]=sum/float(v.size());
    }
    int ans=0;
    float maxd=0;
    for(i=0;i<splits;i++){
        float sumd=0;
        for(j=0;j<v.size();j++){
            sumd+=(v[j][i]-ave[i])*(v[j][i]-ave[i]);
        }
        if(sumd>maxd){
            ans=i;
            maxd=sumd;
        }
    }
    return ans;
}
kd_tree* find_range(kd_tree*root,vector<float>&v){
    if(root->point[root->split]>v[root->split]){
        if(root->l==NULL){
            return root;
        }
        else{
            find_range(root->l,v);
        }
    }
    else if(root->point[root->split]<v[root->split]){
        if(root->r==NULL){
            return root;
        }
        else{
            find_range(root->r,v);
        }
    }
    else{
        return root;
    }
}
void preorder(kd_tree*root){
    if(root==NULL){
        return;
    }
    cout<<root->point[0]<<","<<root->point[1]<<endl;
    cout<<(root->split==0?"x":"y")<<":"<<root->range<<endl;
    preorder(root->l);
    preorder(root->r);
}
// 最小半径的平方
float minr=0x7fffffff;
kd_tree* find_nearest_node(kd_tree*root,vector<float>&v){
    if(root==NULL){
        return NULL;
    }
    kd_tree*ans=root;
    vector<kd_tree*>list;
    while(!(root==NULL)||!list.empty()){
        // if(root){
        //     打印路径
        //     cout<<root->point[0]<<" "<<root->point[1]<<endl;
        // }
        if(root==NULL){                
            root=list[0];
            while(!list.empty()){
                list.pop_back();
            }
            root=root->f;
        }
        else{
            int i=0;
            float r_now=0;
            // calc the distance^2

            for(i=0;i<splits;i++){
                r_now+=(root->point[i]-v[i])*(root->point[i]-v[i]);
            }
            if(r_now<minr){
                // current point is much more near
                minr=r_now;
                ans=root;
            }
            if((root->point[root->split]-v[root->split])*(root->point[root->split]-v[root->split])>=minr){
                // if the cirle which based on the radius between current point and the point to be searched
                // doesn't intersect with the straight line(x=...,y=...), then search the father side; 
                root=root->f;
                if(!list.empty()){
                    list.pop_back();
                }
            }
            else{
                list.push_back(root);
                // or turn to the other side of 
                if(v[root->split]<root->point[root->split]){
                    root=root->r;
                }
                else{
                    root=root->l;
                }
            }
        }
    }
    return ans;
}
int main()
{
    freopen("inputs.txt","r+",stdin);
    int length;
    int i,j,x;
    vector<vector<float>>v;
    kd_tree* root=NULL;
    cin>>length;
    cin>>splits;
    for(i=0;i<length;i++){
        vector<float>vv;
        for(j=0;j<splits;j++){
            cin>>x;
            vv.push_back(x);
        }
        v.push_back(vv);
    }
    int left=0,right=v.size()-1,split;

    split=choose_split(v);
    // choose the largest D(..) to define x/y/z as the start axis.

    init(root,v,left,right,split);
    // init the b-tree.

    if(root==NULL){
        cout<<"failed"<<endl;
    }
    vector<float>vvv={2,4.5};
    // point to be search.

    kd_tree*r=find_range(root,vvv);
    // return the range define node.
    
    r=find_nearest_node(r,vvv);
    // return the answer node

    cout<<(split==0?"x":"y")<<" as the firat axis."<<endl;
    cout<<"\nr^2: "<<minr<<endl;
    cout<<"\nanswer node: ("<<r->point[0]<<","<<r->point[1]<<")"<<endl;

    return 0;
}

/*

6
2
2 3
4 7
5 4
7 2
8 1
9 6

(5,4)
*/
```