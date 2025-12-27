title: about
date: 2019-08-04 22:37:01
---
<center><strong>一个酒吧废物</strong></center>


```mermaid
graph LR
    classDef className fill:white,stroke:#333,stroke-width:1px;
    id2[寄存器A]-->id3[寄存器B]
    subgraph one step
    id[内存]-->id1[缓存]
    id1[缓存]-->id2[寄存器A]
    end
    subgraph two step
    id3[寄存器B]-->id4[缓存]  
    id4[缓存]-->id5[内存]
    end
    class id,id1,id2,id3,id4,id5 className;
```


```flow
st=>start: 开始
e=>end: 结束
op=>operation: 我的操作
cond=>condition: 判断确认？
  
st->op->cond
cond(yes)->e
cond(no)->op
```

do | bird | cat
-|-|-
foo | foo  | foo
bar | bar  | bar
baz | baz  | baz