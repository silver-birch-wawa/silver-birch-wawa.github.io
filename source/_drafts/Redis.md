title: Redis限流
author: SaltedMdFiveSh
date: 2026-01-19 11:45:20
tags:
---
---


### 一、固定窗口限流（简单易实现，有临界问题）

先++然后set expire time

### 二、滑动窗口限流（解决固定窗口临界问题）

以当前时间为终点，往前推一个窗口时间（比如 1 秒），统计该时间段内的请求数，超过阈值则拒绝。通过 Redis ZSet 存储请求的时间戳，自动剔除过期的时间戳，保证统计的是 “滑动窗口” 内的请求数。
```
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.ZSetOperations;
import org.springframework.stereotype.Component;

import javax.annotation.Resource;
import java.util.Set;
import java.util.concurrent.TimeUnit;

/**
 * 滑动窗口限流工具类
 */
@Component
public class SlidingWindowRateLimiter {

    @Resource
    private RedisTemplate<String, Object> redisTemplate;

    /**
     * 滑动窗口限流
     * @param key 限流标识
     * @param windowSize 窗口大小（单位：毫秒）
     * @param maxCount 窗口内最大请求数
     * @return true=允许访问，false=拒绝访问
     */
    public boolean tryAcquire(String key, long windowSize, int maxCount) {
        ZSetOperations<String, Object> zSetOps = redisTemplate.opsForZSet();
        long currentTime = System.currentTimeMillis();
        
        // 1. 移除窗口外的过期请求（核心：只保留当前窗口内的时间戳）
        zSetOps.removeRangeByScore(key, 0, currentTime - windowSize);
        
        // 2. 统计当前窗口内的请求数
        Long count = zSetOps.zCard(key);
        
        // 3. 判断是否超过阈值，未超过则添加当前请求的时间戳
        if (count < maxCount) {
            zSetOps.add(key, String.valueOf(currentTime), currentTime);
            // 设置key过期时间（避免内存泄漏，过期时间略大于窗口大小）
            redisTemplate.expire(key, windowSize + 1000, TimeUnit.MILLISECONDS);
            return true;
        }
        
        return false;
    }
}
```

### 三、令牌桶限流


```
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.script.DefaultRedisScript;
import org.springframework.stereotype.Component;

import javax.annotation.Resource;
import java.util.Collections;
import java.util.List;

/**
 * 令牌桶限流工具类（基于Lua脚本保证原子性）
 */
@Component
public class TokenBucketRateLimiter {

    @Resource
    private RedisTemplate<String, Object> redisTemplate;

    // Lua脚本：核心逻辑（生成令牌 + 尝试获取令牌）
    private static final String TOKEN_BUCKET_LUA_SCRIPT = """
            local key = KEYS[1]
            local maxTokens = tonumber(ARGV[1])  -- 桶的最大容量
            local rate = tonumber(ARGV[2])       -- 令牌生成速率（个/秒）
            local currentTime = tonumber(ARGV[3])-- 当前时间（毫秒）
            local acquireCount = tonumber(ARGV[4])-- 本次要获取的令牌数
            
            -- 获取桶的当前状态（lastTime=上次生成令牌的时间，tokens=当前令牌数）
            local bucket = redis.call('hmget', key, 'lastTime', 'tokens')
            local lastTime = tonumber(bucket[1]) or currentTime
            local tokens = tonumber(bucket[2]) or maxTokens
            
            -- 计算从上次到现在生成的令牌数
            local elapsedTime = currentTime - lastTime
            local generateTokens = elapsedTime / 1000 * rate
            tokens = math.min(tokens + generateTokens, maxTokens)  -- 令牌数不超过桶容量
            lastTime = currentTime  -- 更新上次生成时间
            
            -- 判断是否能获取令牌
            local allow = false
            if tokens >= acquireCount then
                tokens = tokens - acquireCount
                allow = true
            end
            
            -- 保存桶的状态（设置过期时间，避免内存泄漏）
            redis.call('hmset', key, 'lastTime', lastTime, 'tokens', tokens)
            redis.call('expire', key, 3600)  -- 1小时过期
            
            return allow
            """;

    private final DefaultRedisScript<Boolean> redisScript;

    public TokenBucketRateLimiter() {
        redisScript = new DefaultRedisScript<>();
        redisScript.setScriptText(TOKEN_BUCKET_LUA_SCRIPT);
        redisScript.setResultType(Boolean.class);
    }

    /**
     * 令牌桶限流
     * @param key 限流标识
     * @param maxTokens 桶的最大容量（最多存多少令牌）
     * @param rate 令牌生成速率（个/秒）
     * @return true=允许访问，false=拒绝访问
     */
    public boolean tryAcquire(String key, int maxTokens, double rate) {
        long currentTime = System.currentTimeMillis();
        List<String> keys = Collections.singletonList(key);
        // 执行Lua脚本（保证生成令牌和获取令牌的原子性）
        Boolean allow = redisTemplate.execute(
                redisScript,
                keys,
                maxTokens,
                rate,
                currentTime,
                1  // 每次获取1个令牌
        );
        return allow != null && allow;
    }
}
```