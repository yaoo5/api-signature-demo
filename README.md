# api-signature-demo(草稿)

当我们的系统或服务对外提供API接口时，我们需要对API接口进行签名，本文将介绍关于API签名的内容。

- [为什么要进行签名](#为什么要进行签名)

- [常见的API签名方法](#常见的API签名方法)

  - [Token](#Token (不推荐))

  - [JWT](#JWT (比较推荐))

  - [摘要签名 (推荐)](#摘要签名 (墙裂推荐))

- [参考](#参考)



## 为什么要进行签名

1. **鉴权**

签名确保请求时由持有有效访问密钥对人发生的，即服务对外提供的**appKey**和**appSecret**。

2. **保护传输中的数据**

- 防止请求在传输过程中被篡改
- 防止恶意攻击(DDOS)，防重放



## 常见的API签名方法

接下来将介绍几种常见 ~~(我知道的)~~ 的API签名方法

- **token**
- **jwt**
- **摘要签名**(推荐)



### Token (不推荐)

最简单粗暴的方法, 在请求头添加指定token。

这种方法开发成本小，但安全性比较差，所以一般不推荐使用。

**适用场景**：安全性要求不高，开发成本较小。

```shell
# 示例
curl https://token.example.com/api -h "x-token: <token-of-your-service>"
```



### JWT (比较推荐)

[jwt](https://jwt.io)也是一种比较常见的鉴权方案，而且不同语言也有对应的库可供使用。

```shell
# 示例, <token>即生成的jwt
curl https://jwt.example.com -h "Authorization: Bearer <token>"
```



### 摘要签名 (墙裂推荐)

比较常见的一种方案，但是开发过程就比较复杂。



## 参考

[腾讯云API TC3-HMAC-SHA256](https://cloud.tencent.com/document/product/1278/55260)

[阿里云API摘要签名](https://help.aliyun.com/document_detail/29475.html)

