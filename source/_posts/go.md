title: go范型
author: SaltedMdFiveSh
date: 2026-01-09 10:41:28
tags:
---
---

指明需要编译的具体类型

比较凌乱的写法：
```
// 一个可以容纳所有int,uint以及浮点类型的泛型切片
type Slice[T int | int8 | int16 | int32 | int64 | uint | uint8 | uint16 | uint32 | uint64 | float32 | float64] []T
```
相对好维护的写法：
```
type Int interface {
    ~int | ~int8 | ~int16 | ~int32 | ~int64
}

type Uint interface {
    ~uint | ~uint8 | ~uint16 | ~uint32
}
type Float interface {
    ~float32 | ~float64
}

type Slice[T Int | Uint | Float] []T  // 使用 '|' 将多个接口类型组合


var s Slice[int] // 正确

type MyInt int
var s2 Slice[MyInt]  // MyInt底层类型是int，所以可以用于实例化，如果不加～就不行。因为泛型类型 Slice[T] 允许的是 int 作为类型实参，而不是 MyInt （虽然 MyInt 类型底层类型是 int ，但它依旧不是 int 类型）。
```
---

### 具体步骤

* 1.编译期处理：类型检查与中间表示（IR）生成

类型验证：编译器首先会对泛型函数 / 类型（如 func Foo[T any](t T)）进行类型检查，确保类型参数（Type Parameter）符合类型约束（Constraint），比如验证 T 是否实现了约束中要求的方法。

生成通用 IR：编译器会为泛型定义生成一份 “通用” 的中间表示（Intermediate Representation），这份 IR 不绑定具体类型，仅记录类型参数的约束和逻辑。

实例化触发：当代码中首次使用具体类型实例化泛型（如 Foo[int](10)）时，编译器会触发实例化过程：
对于基本类型 / 简单类型（如 int、string、[]int）：编译器会为该类型生成一份特化的代码（类似 C++ 模板特化），避免运行时开销；

对于复杂类型 / 不常用类型：编译器会生成一份 “共享代码”，通过 reflect 相关的底层机制（但非暴露给用户的 reflect 包）处理类型参数，减少编译后二进制体积。

* 2.运行时处理：字典传递（Dictionary Passing）

这是 Go 泛型最核心的底层机制：编译器为每个泛型实例化生成一个类型字典（Type Dictionary），并将其作为隐式参数传递给泛型函数。

类型字典的内容：包含类型参数的元信息（如类型大小、对齐方式、哈希函数、比较函数等），以及约束中要求的方法指针（如果约束包含方法）。

字典传递的作用：
当泛型函数需要操作类型参数（如赋值、比较、调用方法）时，会通过类型字典获取该类型的具体行为，而非硬编码；

例如 `func Min[T constraints.Ordered](a, b T) T` 中，比较 a < b 的逻辑并非直接编译为 int 的比较或 string 的比较，而是通过类型字典中的比较函数指针来执行。

### 总结

既避免了 C++ 模板 “代码膨胀” 的问题，也解决了 Java 泛型 “类型擦除” 导致的运行时类型信息丢失问题，是 Go 团队针对 Go 语言特性的折中优化。


