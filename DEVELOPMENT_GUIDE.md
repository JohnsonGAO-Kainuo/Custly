# Custly 开发指南（合并版）

**项目名称**: Custly  
**基于**: marmelab/atomic-crm (MIT)  
**更新时间**: 2026-01-24  
**当前状态**: UI/多语言/营销页已完成 | PocketBase 后端已落地 | 找回密码已接入（需 SMTP）

---

## 1) 只看这几个目录（最小关注范围）

- `src/components/atomic-crm/login`：营销页/登录/注册/找回密码
- `src/components/atomic-crm/providers/pocketbase`：PocketBase 接口
- `src/components/atomic-crm/root/CRM.tsx`：路由入口
- `src/i18n`：多语言文案

> 其它目录先不用管，等需要时我会告诉你看哪里。

---

## 2) 当前关键决策（结合现状）

- **品牌名**: Custly（内部目录名 `atomic-crm` 暂时不改，避免路径大改）
- **后端**: 以 PocketBase 为主，Supabase 暂时保留但不使用
- **登录方式**: 目前以邮箱登录为主；PocketBase 支持邮箱找回密码
- **部署建议**: 先本地验证 → 迁移到 Pockethost（更稳定，成本低）

---

## 3) 本地运行（PocketBase）

### 启动 PocketBase
```bash
/Users/johnson/Documents/pocketbase_0.36.1_darwin_arm64/pocketbase serve --http=127.0.0.1:8090
```

### 启动前端
```bash
npm run dev
```

默认地址通常是 `http://127.0.0.1:5173`（如改端口以实际为准）。

### 环境变量（已在 `.env.development`）
- `VITE_BACKEND=pocketbase`
- `VITE_POCKETBASE_URL=http://127.0.0.1:8090`

---

## 4) PocketBase 当前状态（已完成）

### 集合
`/sales /tags /companies /contacts /deals /tasks /contactNotes /dealNotes`

### 权限规则
- **管理员**可看全部
- **普通用户**仅可看/改自己数据（按 `sales_id` 限制）

### Demo 数据
已写入（可直接体验）：
- sales 6
- tags 6
- companies 55
- contacts 500
- deals 50
- tasks 400
- contactNotes 1200
- dealNotes 300

### 找回密码
- 已接入前端页面与 API
- 邮件模板已改为：`/reset-password?token=...`
- **需要 SMTP 才能真正发邮件**

---

## 5) 近期变更摘要（已合并 UI/更新日志）

- **UI 重构**：墨绿色主题、组件样式统一、营销页视觉升级
- **营销页**：Landing / Features / Pricing / FAQ 独立路由
- **多语言**：English / 简体 / 繁体（营销与认证文案已覆盖）
- **登录体验**：加入多语言切换、玻璃拟态卡片
- **PocketBase**：数据提供器、权限规则、密码找回流程完成

---

## 6) 下一步要做什么（最重要的）

1) **配置 SMTP**：让找回密码邮件可用
2) **部署到 Pockethost**：稳定环境 + 替换 `APP_URL`
3) **完善派生字段**：如 `company_name / nb_tasks / nb_deals`
4) **行业模板数据**：电商 + 心理咨询

---

## 7) 常见问题

### 找回密码没邮件
- 未配置 SMTP（PocketBase 后台 Settings → Mail）

### 登录后看不到数据
- 记录必须带 `sales_id`，并且要和登录用户匹配

### 为什么还有 `users` 集合
- PocketBase 默认系统集合，当前不使用

---

## 8) 文档说明（已合并）

以下文档已合并到本文件：
- `UI_REFACTOR_LOG.md`
- `UPDATES.md`
- `requirements/atomic-crm-prd.md`（仅保留关键方向即可）

本文件为唯一“当前真实状态”说明。
