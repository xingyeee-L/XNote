# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

XNote (AnkerDeutsch) 是一款面向德语学习者的、以"课文场景"为核心的笔记整理与复习系统。所有词汇和语法卡片必须依附于具体课文的上下文。

## 环境配置

### 必要环境变量 (.env.local)
```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
ADMIN_PASSWORD=your_secure_admin_password  # min 16 chars, use openssl rand -base64 24
```

### Supabase 设置
1. 在 supabase.com 创建项目
2. 在 SQL Editor 中运行 `docs/DB_schema.md` 的 DDL
3. 获取 `SUPABASE_URL` 和 `SUPABASE_ANON_KEY`

### Vercel 部署
- 已连接 GitHub，push 到 main 分支自动部署
- 生产环境在 Vercel Project Settings 中配置环境变量
- 预览部署 (PR) 自动创建预览 URL

## 开发命令

```bash
npm run dev        # 启动开发服务器 localhost:3000
npm run build      # 生产构建
npm run lint       # ESLint 检查
npm test           # 运行测试
npm test -- --watch  # watch 模式运行测试
```

## 核心架构

### 页面路由 (App Router)
| 路由 | 组件 | 权限 | 功能 |
|------|------|------|------|
| `/` | page.tsx | 公开只读 | 课文列表、学习进度 |
| `/reader/[textId]` | reader/[textId]/page.tsx | 公开只读 | 课文阅读、点击查词、语境回溯 |
| `/review` | review/page.tsx | 公开只读 | 闪卡复习 |
| `/admin` | admin/page.tsx | 公开 | 管理员登录 |

### 数据模型
- **notes**: 知识卡片 (id, word, inflections, explanation, tags)
- **texts**: 课文 (id, title, category, tokens: JSONB)

### Token 对象 (Word-as-Object Engine)
```typescript
type Token = {
  t: string;           // 单词文本或符号
  note_id: number | null;  // 绑定知识卡片 ID
};
```
- `note_id === null`: 普通文本渲染
- `note_id !== null`: 灰色虚线下划线，hover 变蓝，点击展开侧边栏

### 管理员认证
- 密码验证成功后下发 HTTP-only Cookie
- 所有写操作 (POST/PUT/DELETE) 需校验 Cookie，不携带返回 401
- 密码从环境变量读取，永不硬编码

### 闪卡算法
- 进入页面获取所有卡片 → Shuffle 洗牌
- "Hard" 标记：插入队列末尾，最多循环 3 次
- "Next" 标记：移出队列，加载下一张

## 文档实时更新规则

**每次代码变更后，必须同步更新以下文档：**

| 文档 | 更新触发 |
|------|----------|
| PRD.md | 新增/修改页面路由、核心功能、UI 交互逻辑 |
| DB_schema.md | 新增/修改数据表结构、字段、索引 |
| Tech_Stack.md | 新增/修改依赖、技术方案、目录结构 |

更新原则：代码即文档，文档服务于代码——先改文档再改代码，或改完代码立刻更新对应章节。

## 技术栈

- **框架**: Next.js 14+ (App Router, React 18+)
- **样式**: Tailwind CSS + Tailwind Animated
- **数据库**: Supabase (云端, PostgreSQL + JSONB)
- **图标**: Lucide React
- **UI 组件**: Shadcn UI
- **部署**: Vercel (GitHub 联动)

## 目录结构

```
├── docs/                 # 产品与技术文档
│   ├── PRD.md
│   ├── TECH_STACK.md
│   └── DB_SCHEMA.md
├── lib/
│   ├── supabase.ts       # Supabase 客户端
│   └── auth.ts           # 管理员校验中间件
├── types/
│   └── index.ts          # 全局 TypeScript 类型
├── components/
│   ├── reader/
│   │   ├── TextViewer.tsx  # 课文 Token 渲染
│   │   └── Sidebar.tsx     # 侧边栏 & 语境回溯 Modal
│   ├── review/
│   │   └── Flashcard.tsx   # 闪卡组件
│   └── ui/                # Shadcn UI 基础组件
└── app/
    ├── layout.tsx
    ├── page.tsx           # 首页
    ├── admin/page.tsx     # 登录页
    ├── reader/[textId]/page.tsx
    └── review/page.tsx
```