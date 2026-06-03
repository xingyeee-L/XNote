# AnkerDeutsch 数据库规范

## 1. PostgreSQL DDL (在 Supabase SQL Editor 中运行)

```sql
-- 确保 uuid 扩展可用
create extension if not exists "uuid-ossp";

-- 创建知识卡片表
create table notes (
  id bigserial primary key,
  word varchar(100) not null,
  inflections text[] default '{}',
  explanation text not null,
  tags text[] default '{}',
  created_at timestamp with time zone default now()
);

-- 创建课文表
create table texts (
  id bigserial primary key,
  title varchar(255) not null,
  category varchar(50) default 'oral',
  tokens jsonb not null, -- JSONB 格式：[{ "t": "...", "note_id": 101 }, ...]
  created_at timestamp with time zone default now()
);

-- 为 JSONB 字段创建 GIN 索引，优化多重回溯查询
create index idx_texts_tokens on texts using gin (tokens);
```

## 2. 数据表说明

### 2.1 notes 表（知识卡片）
| 字段 | 类型 | 说明 |
|------|------|------|
| id | bigserial | 主键，自增 |
| word | varchar(100) | 核心词汇/短语 |
| inflections | text[] | 变形列表，如 ["bestellte", "bestellt"] |
| explanation | text | 释义与语法剖析，支持 Markdown |
| tags | text[] | 标签组，如 ["vital", "Lektion 2"] |
| created_at | timestamptz | 创建时间 |

### 2.2 texts 表（课文）
| 字段 | 类型 | 说明 |
|------|------|------|
| id | bigserial | 主键，自增 |
| title | varchar(255) | 课文标题 |
| category | varchar(50) | 分类，默认 'oral' |
| tokens | jsonb | Token 对象数组 |
| created_at | timestamptz | 创建时间 |

### 2.3 tokens JSONB 格式
```json
[
  { "t": "Heute", "note_id": null },
  { "t": "bestellen", "note_id": 101 },
  { "t": "wir", "note_id": null },
  { "t": "ein", "note_id": 102 },
  { "t": "Gericht", "note_id": 103 },
  { "t": ".", "note_id": null }
]
```

## 3. 语境回溯查询示例

查询所有包含指定 note_id 的课文：

```sql
-- 查询包含 note_id = 101 的所有课文及对应 Token
SELECT
  t.id as text_id,
  t.title,
  jsonb_path_query_array(t.tokens, '$[*] ? (@.note_id == $id)', '{"id": 101}') as matched_tokens
FROM texts t
WHERE jsonbContainsAny(t.tokens, '101');
```

## 4. 索引说明

- `idx_texts_tokens`: GIN 索引，用于加速 JSONB 数组的多重回溯查询
- 对于简单的 note_id 查询，可以使用 `jsonb_path_query` 或 `->>` 操作符配合索引

## 5. 文档更新规则

**每次代码变更后，必须同步更新以下文档：**

| 文档 | 更新触发 |
|------|----------|
| PRD.md | 新增/修改页面路由、核心功能、UI 交互逻辑 |
| DB_schema.md | 新增/修改数据表结构、字段、索引 |
| Tech_Stack.md | 新增/修改依赖、技术方案、目录结构 |

原则：代码即文档，文档服务于代码——先改文档再改代码，或改完代码立刻更新对应章节。