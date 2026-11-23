# 智能工单 Agent

面向智能工单场景的一体化项目，由前端、Java 后端、Python 智能体三部分组成，统一在一个仓库中管理。

## 目录结构

```
.
├── agent-front/      # 前端：Vue 3 + TypeScript + Vite
├── agent-back/       # Java 后端（待开发）
├── agent-python/     # Python 智能体（待开发）
└── .gitignore        # 覆盖三端的忽略规则
```

| 模块 | 技术栈 | 状态 |
| --- | --- | --- |
| agent-front | Vue 3 + TypeScript + Vite | 已初始化 |
| agent-back | Java（Spring Boot / MySQL） | 待开发 |
| agent-python | Python 智能体 | 待开发 |

## 快速开始

### 前端 agent-front

```bash
cd agent-front
npm install
npm run dev        # 本地开发
npm run build      # 生产构建
npm run preview    # 预览构建产物
```

### 后端 / 智能体

代码放入 `agent-back`、`agent-python` 后在此补充对应的启动方式。

## 开发约定

- 分支：`main` 为主分支，功能开发建议新建 `feature/xxx` 分支后合并。
- 提交信息：`feat:` 新功能、`fix:` 修复、`docs:` 文档、`chore:` 杂项、`refactor:` 重构。
- 敏感信息：`.env`、数据库密码、模型 API Key、`application-local.yml` 等已在 `.gitignore` 中排除，请勿提交；需要示例时使用 `*.example` 文件。

## Git 工作流

```bash
git add -A
git commit -m "feat: 本次改动说明"
git push
```
