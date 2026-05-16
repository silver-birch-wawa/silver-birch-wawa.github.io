title: SingleFlight
author: SaltedMdFiveSh
date: 2026-01-07 21:19:04
tags:
---
---

### Group
```
type Group struct {
	mu sync.Mutex       // protects m
	m  map[string]*call // lazily initialized
}
```

Group 结构体由一个互斥锁和一个 map 组成，可以看到注释 map 是懒加载的，所以 Group 只要声明就可以使用，不用进行额外的初始化零值就可以直接使用。call 保存了当前调用对应的信息，map 的键就是我们调用Do方法传入的 key

```
type call struct {
	wg sync.WaitGroup

	// 函数的返回值，在 wg 返回前只会写入一次
	val interface{}
	err error

	// 使用调用了 Forgot 方法
	forgotten bool

    // 统计调用次数以及返回的 channel
	dups  int
	chans []chan<- Result
}
```

### Do

```
func (g *Group) Do(key string, fn func() (interface{}, error)) (v interface{}, err error, shared bool) {
	g.mu.Lock()

    // 前面提到的懒加载
    if g.m == nil {
		g.m = make(map[string]*call)
	}

    // 会先去看 key 是否已经存在
	if c, ok := g.m[key]; ok {
       	// 如果存在就会解锁
		c.dups++
		g.mu.Unlock()

        // 然后等待 WaitGroup 执行完毕，只要一执行完，所有的 wait 都会被唤醒
		c.wg.Wait()

        // 这里区分 panic 错误和 runtime 的错误，避免出现死锁，后面可以看到为什么这么做
		if e, ok := c.err.(*panicError); ok {
			panic(e)
		} else if c.err == errGoexit {
			runtime.Goexit()
		}
		return c.val, c.err, true
	}

    // 如果我们没有找到这个 key 就 new call
	c := new(call)

    // 然后调用 waitgroup 这里只有第一次调用会 add 1，其他的都会调用 wait 阻塞掉
    // 所以这要这次调用返回，所有阻塞的调用都会被唤醒
	c.wg.Add(1)
	g.m[key] = c
	g.mu.Unlock()

    // 然后我们调用 doCall 去执行
	g.doCall(c, key, fn)
	return c.val, c.err, c.dups > 0
}
```

### docall

这个方法的实现有点意思，使用了两个 defer 巧妙的将 runtime 的错误和我们传入 function 的 panic 区别开来避免了由于传入的 function panic 导致的死锁
```
func (g *Group) doCall(c *call, key string, fn func() (interface{}, error)) {
	normalReturn := false
	recovered := false

    // 第一个 defer 检查 runtime 错误
	defer func() {

	}()

    // 使用一个匿名函数来执行
	func() {
		defer func() {
			if !normalReturn {
                // 如果 panic 了我们就 recover 掉，然后 new 一个 panic 的错误
                // 后面在上层重新 panic
				if r := recover(); r != nil {
					c.err = newPanicError(r)
				}
			}
		}()

		c.val, c.err = fn()

        // 如果 fn 没有 panic 就会执行到这一步，如果 panic 了就不会执行到这一步
        // 所以可以通过这个变量来判断是否 panic 了
		normalReturn = true
	}()

    // 如果 normalReturn 为 false 就表示，我们的 fn panic 了
    // 如果执行到了这一步，也说明我们的 fn  recover 住了，不是直接 runtime exit
	if !normalReturn {
		recovered = true
	}
}
```
### DoChan

Do chan 和 Do 类似，其实就是一个是同步等待，一个是异步返回，主要实现上就是，如果调用 DoChan 会给 call.chans 添加一个 channel 这样等第一次调用执行完毕之后就会循环向这些 channel 写入数据
```
func (g *Group) DoChan(key string, fn func() (interface{}, error)) <-chan Result {
	ch := make(chan Result, 1)
	g.mu.Lock()
	if g.m == nil {
		g.m = make(map[string]*call)
	}
	if c, ok := g.m[key]; ok {
		c.dups++
		c.chans = append(c.chans, ch)
		g.mu.Unlock()
		return ch
	}
	c := &call{chans: []chan<- Result{ch}}
	c.wg.Add(1)
	g.m[key] = c
	g.mu.Unlock()

	go g.doCall(c, key, fn)

	return ch
}
```

### forget

用于手动释放某个 key 下次调用就不会阻塞等待了
```
func (g *Group) Forget(key string) {
	g.mu.Lock()
	if c, ok := g.m[key]; ok {
		c.forgotten = true
	}
	delete(g.m, key)
	g.mu.Unlock()
}
```