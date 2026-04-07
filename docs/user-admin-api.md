# 用户管理接口文档

本文档基于当前项目中的用户管理接口实现整理，适用于管理端用户管理页面对接。

## 基础说明

- 接口前缀：`/admin`
- 返回格式：统一使用 `ApiResult<T>`
- 分页结构：`Paged<UserInfo>`
- 用户管理核心控制器：[AdminController.java](/Users/fangjiahuan/IdeaProjects/chat-studio/system/system-admin/src/main/java/dev/chatstudio/controller/AdminController.java)

## 返回结构

成功响应示例：

```json
{
  "code": "200",
  "message": "success",
  "data": {}
}
```

分页响应中的 `data` 结构示例：

```json
{
  "records": [],
  "current": 1,
  "size": 20,
  "total": 0
}
```

## 1. 用户分页列表

- 请求方法：`GET`
- 请求路径：`/admin/userList`

### 请求参数

| 参数名 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `pageNum` | integer | 否 | 页码，默认 `1` |
| `pageSize` | integer | 否 | 每页大小，默认 `20`，最大 `20` |

### 响应示例

```json
{
  "code": "200",
  "message": "success",
  "data": {
    "records": [
      {
        "userId": "10001",
        "email": "admin@test.com",
        "nickName": "admin",
        "state": "ACTIVE",
        "inviteCode": "ABCDEF",
        "capacity": -1,
        "profileAvatarUrl": "https://example.com/avatar.png",
        "userRole": "ADMIN",
        "createdTime": "2026-04-06T15:30:00"
      }
    ],
    "current": 1,
    "size": 20,
    "total": 1
  }
}
```

## 2. 用户详情

- 请求方法：`GET`
- 请求路径：`/admin/user/{userId}`

### 路径参数

| 参数名 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `userId` | string | 是 | 用户 ID |

### 响应字段

| 字段名 | 类型 | 说明 |
| --- | --- | --- |
| `userId` | string | 用户 ID |
| `email` | string | 邮箱 |
| `nickName` | string | 昵称 |
| `state` | string | 用户状态 |
| `inviteCode` | string | 邀请码 |
| `capacity` | integer | 容量，`-1` 表示无限制 |
| `profileAvatarUrl` | string | 头像地址 |
| `userRole` | string | 用户角色 |
| `createdTime` | string | 创建时间 |

## 3. 新增用户

- 请求方法：`POST`
- 请求路径：`/admin/user`
- 请求头：`Content-Type: application/json`

### 请求体

```json
{
  "email": "user@test.com",
  "nickName": "test-user",
  "password": "123456",
  "state": "ACTIVE",
  "inviteCode": "QWERTY",
  "inviterId": "10000",
  "capacity": 100,
  "profileAvatarUrl": "https://example.com/avatar.png",
  "userRole": "ORDINARY"
}
```

### 字段说明

| 字段名 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `email` | string | 是 | 邮箱，格式必须合法 |
| `nickName` | string | 是 | 昵称，长度 2-64 |
| `password` | string | 是 | 登录密码，长度 6-64 |
| `state` | string | 是 | 用户状态：`INIT`、`ACTIVE`、`FROZEN` |
| `inviteCode` | string | 否 | 邀请码，不传则系统自动生成 |
| `inviterId` | string | 否 | 邀请人 ID |
| `capacity` | integer | 是 | 容量，`-1` 表示无限制 |
| `profileAvatarUrl` | string | 否 | 头像地址 |
| `userRole` | string | 是 | 用户角色：`ADMIN`、`ORDINARY` |

### 成功响应

```json
{
  "code": "200",
  "message": "success",
  "data": null
}
```

### 可能错误

| 错误码 | 说明 |
| --- | --- |
| `DUPLICATE_EMAIL_NUMBER` | 邮箱已存在 |
| `NICK_NAME_EXIST` | 昵称已存在 |
| `USER_OPERATION_FAILED` | 用户创建失败 |
| `DATABASE_UPDATE_FAILED` | 操作流水写入失败 |

## 4. 修改用户

- 请求方法：`PUT`
- 请求路径：`/admin/user`
- 请求头：`Content-Type: application/json`

### 请求体

```json
{
  "userId": "10001",
  "email": "new_user@test.com",
  "nickName": "new-name",
  "state": "ACTIVE",
  "inviterId": "10000",
  "capacity": 200,
  "profileAvatarUrl": "https://example.com/new-avatar.png",
  "userRole": "ORDINARY"
}
```

### 字段说明

| 字段名 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `userId` | string | 是 | 用户 ID |
| `email` | string | 否 | 新邮箱 |
| `nickName` | string | 否 | 新昵称 |
| `state` | string | 否 | 用户状态：`INIT`、`ACTIVE`、`FROZEN` |
| `inviterId` | string | 否 | 邀请人 ID |
| `capacity` | integer | 否 | 用户容量 |
| `profileAvatarUrl` | string | 否 | 头像地址 |
| `userRole` | string | 否 | 用户角色：`ADMIN`、`ORDINARY` |

说明：服务端只更新传入且有值的字段。

### 成功响应

```json
{
  "code": "200",
  "message": "success",
  "data": null
}
```

### 可能错误

| 错误码 | 说明 |
| --- | --- |
| `USER_NOT_EXIST` | 用户不存在 |
| `DUPLICATE_EMAIL_NUMBER` | 邮箱已存在 |
| `NICK_NAME_EXIST` | 昵称已存在 |
| `DATABASE_UPDATE_FAILED` | 更新失败 |

## 5. 冻结用户

- 请求方法：`POST`
- 请求路径：`/admin/user/{userId}/freeze`

### 路径参数

| 参数名 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `userId` | string | 是 | 用户 ID |

### 说明

调用后会将用户状态更新为 `FROZEN`。

### 成功响应

```json
{
  "code": "200",
  "message": "success",
  "data": null
}
```

### 可能错误

| 错误码 | 说明 |
| --- | --- |
| `USER_NOT_EXIST` | 用户不存在 |
| `DATABASE_UPDATE_FAILED` | 更新失败 |

## 6. 激活用户

- 请求方法：`POST`
- 请求路径：`/admin/active/{userId}`

### 路径参数

| 参数名 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `userId` | string | 是 | 用户 ID |

### 说明

调用后会将用户状态更新为 `ACTIVE`。

### 成功响应

```json
{
  "code": "200",
  "message": "success",
  "data": null
}
```

### 可能错误

| 错误码 | 说明 |
| --- | --- |
| `USER_ALREADY_ACTIVE` | 用户已激活，无需重复激活 |
| `DATABASE_UPDATE_FAILED` | 更新失败 |

## 7. 删除用户

- 请求方法：`DELETE`
- 请求路径：`/admin/user/{userId}`

### 路径参数

| 参数名 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `userId` | string | 是 | 用户 ID |

### 说明

删除为逻辑删除，底层字段为 `deleted`。

### 成功响应

```json
{
  "code": "200",
  "message": "success",
  "data": null
}
```

### 可能错误

| 错误码 | 说明 |
| --- | --- |
| `USER_NOT_EXIST` | 用户不存在 |
| `DATABASE_UPDATE_FAILED` | 删除失败 |

## 枚举说明

### 用户状态 `state`

| 枚举值 | 说明 |
| --- | --- |
| `INIT` | 初始状态 |
| `ACTIVE` | 已激活 |
| `FROZEN` | 已冻结 |

### 用户角色 `userRole`

| 枚举值 | 说明 |
| --- | --- |
| `ADMIN` | 管理员 |
| `ORDINARY` | 普通用户 |

## 代码位置

- 控制器：[AdminController.java](/Users/fangjiahuan/IdeaProjects/chat-studio/system/system-admin/src/main/java/dev/chatstudio/controller/AdminController.java)
- 服务接口：[UserService.java](/Users/fangjiahuan/IdeaProjects/chat-studio/system/system-admin/src/main/java/dev/chatstudio/service/UserService.java)
- 服务实现：[UserServiceImpl.java](/Users/fangjiahuan/IdeaProjects/chat-studio/system/system-admin/src/main/java/dev/chatstudio/service/impl/UserServiceImpl.java)
- 请求 DTO：[AdminUserDTO.java](/Users/fangjiahuan/IdeaProjects/chat-studio/system/system-admin/src/main/java/dev/chatstudio/domain/dto/AdminUserDTO.java)
