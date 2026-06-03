# AnkerDeutsch 技术栈与目录结构规范

## 1. 核心技术栈
* **框架**：Next.js 14+ (App Router, React 18+)
* **样式**：Tailwind CSS + Tailwind CSS Animated
* **数据库 & 客户端**：Supabase JS SDK (@supabase/supabase-js)
* **状态管理**：React Context (用于管理侧边栏状态与管理员 Session)
* **核心组件库**：Lucide React (图标) + Shadcn UI
* **部署**：Vercel (已连接 GitHub，main 分支自动部署)

## 2. 环境变量配置

在 `.env.local` 中配置以下变量：

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
ADMIN_PASSWORD=your_secure_admin_password
```

密码生成推荐：`openssl rand -base64 24`（至少 16 位）

## 3. 推荐项目目录结构

```
├── docs/
│   ├── PRD.md                 # 产品需求文档
│   ├── TECH_STACK.md          # 技术栈与目录规范
│   └── DB_SCHEMA.md           # 数据库设计规范
├── lib/
│   ├── supabase.ts            # Supabase 客户端初始化
│   └── auth.ts                # 管理员校验逻辑
├── types/
│   └── index.ts               # 全局 TypeScript 类型定义
├── components/
│   ├── reader/
│   │   ├── TextViewer.tsx     # 课文 Token 对象渲染组件
│   │   └── Sidebar.tsx        # 侧边栏及语境回溯组件
│   ├── review/
│   │   └── Flashcard.tsx      # 复习卡片及遮罩组件
│   └── ui/                    # Shadcn UI 基础组件
└── app/
    ├── layout.tsx             # 全局布局 (暖色调背景配置)
    ├── page.tsx               # 首页 (课文列表)
    ├── admin/
    │   └── page.tsx           # 管理员登录界面
    ├── reader/
    │   └── [textId]/
    │       └── page.tsx       # 独立阅读器页面
    └── review/
        └── page.tsx           # 独立复习页面
```

## 4. Vercel 部署配置

项目已连接 GitHub，每次 push 到 main 分支自动触发部署。生产环境需在 Vercel Project Settings 中配置环境变量（与 `.env.local` 相同）。

预览部署 (Pull Request) 自动创建预览 URL，方便在合并前验证功能。

## 5. Supabase 配置

1. 在 supabase.com 创建项目
2. 在 SQL Editor 中运行 `docs/DB_schema.md` 的 DDL
3. 获取 `SUPABASE_URL` 和 `SUPABASE_ANON_KEY`
4. 建议开启 RLS (Row Level Security)，但本项目 GET 公开，写操作需 Cookie 校验

## 6. 开发规范

- 代码变更后必须同步更新 `docs/` 下的相关文档
- 使用 `npm run lint` 检查代码风格
- 移动端优先：移动端主要使用阅读模式，不开放编辑功能