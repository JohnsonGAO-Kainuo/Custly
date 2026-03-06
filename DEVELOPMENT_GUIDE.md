# Custly 开发指南

**项目名称**: Custly CRM  
**公司**: Kainuo Innovision Tech Co., Limited  
**域名**: https://custlycrm.com  
**基于**: [marmelab/atomic-crm](https://github.com/marmelab/atomic-crm) (MIT)  
**更新时间**: 2026-02  
**当前状态**: ✅ 所有核心功能已完成，正式上线运行

---

## 1) 技术栈

| 层 | 技术 |
|----|------|
| **前端框架** | Vite + React + React Admin v5 |
| **UI 组件** | shadcn/ui + Radix UI |
| **后端** | PocketBase（`https://pb-custly.kainuotech.com`） |
| **支付** | Stripe（Live mode，HKD 结算，多币种 currency_options） |
| **部署** | Vercel（前端）+ 自托管 PocketBase |
| **认证** | Email/密码 + OAuth（Google/GitHub），通过 PocketBase |
| **国际化** | EN / zh-CN / zh-TW（polyglot） |

---

## 2) 目录结构（关键目录）

```
src/
  components/atomic-crm/
    login/          # 营销页、登录、注册、找回密码
    root/CRM.tsx    # 路由入口
    providers/
      pocketbase/   # PocketBase 数据提供器 & 认证
      fakerest/     # Demo 模式数据
    subscription/   # 订阅上下文、服务、计费页面
    templates/      # 模板中心
  i18n/             # 多语言文案（marketing-*.ts / crm-*.ts）
api/
  create-checkout.ts   # Stripe Checkout 会话
  stripe-webhook.ts    # Stripe Webhook 处理
  customer-portal.ts   # Stripe 客户门户
scripts/               # 仅 5 个活跃脚本（见 package.json）
_archive/              # 已归档文件（gitignored）
```

> 注：内部目录名 `atomic-crm` 保留，避免大范围路径重构。

---

## 3) 本地开发

### 启动前端
```bash
npm install
npm run dev        # 正常模式（需要 PocketBase）
npm run dev:demo   # Demo 模式（无需后端）
```

### 环境变量（`.env.development`）
```
VITE_BACKEND=pocketbase
VITE_POCKETBASE_URL=http://127.0.0.1:8090
```

### PocketBase 初始化
```bash
POCKETBASE_URL=http://127.0.0.1:8090 \
POCKETBASE_ADMIN_EMAIL=you@example.com \
POCKETBASE_ADMIN_PASSWORD=yourpassword \
npm run pocketbase:init
```

---

## 4) 支付系统（Stripe）

### 价格 ID（多币种 currency_options：USD + HKD + CNY）
| 计划 | Price ID | 默认价格 |
|------|----------|---------|
| 月付 | `price_1T7rhPJTqJOgtjP4dIDUZYtn` | $20/月 |
| 年付 | `price_1T7riQJTqJOgtjP4lV1UxJlB` | $168/年 |
| 终身 | `price_1T7rjDJTqJOgtjP4OqKwRmtj` | $399 一次性 |

### Payment Links
- 月付: `https://buy.stripe.com/bJe28s2pV5aQ5IJfo5cV20r`
- 年付: `https://buy.stripe.com/8x24gA3tZ1YEeff2BjcV20s`
- 终身: `https://buy.stripe.com/9B6fZi7Kfbzegnnek1cV20t`

### Webhook
- URL: `https://custlycrm.com/api/stripe-webhook`
- 事件: `checkout.session.completed`, `customer.subscription.*`, `invoice.payment_failed`, `charge.refunded`

### 试用
- 14 天免费试用（从账户创建时间计算，前端逻辑）
- 无需信用卡

---

## 5) 部署

### Vercel（前端）
- 自动从 `main` 分支部署
- 环境变量在 Vercel Dashboard 设置
- `vercel.json` 配置 SPA 重写、API 路由、PocketBase 代理

### PocketBase（后端）
- 自托管在 `pb-custly.kainuotech.com`
- CORS 允许: `https://custlycrm.com` + `http://localhost:5173`

---

## 6) 功能完成状态

| 功能 | 状态 |
|------|------|
| 联系人 CRUD + CSV 导入/导出 | ✅ |
| 公司管理 + 关联联系人 | ✅ |
| 交易 Kanban + 阶段管理 | ✅ |
| 任务管理 + 日历视图 | ✅ |
| 备注系统 + 附件 | ✅ |
| 活动日志 | ✅ |
| 用户认证（Email + OAuth） | ✅ |
| 多语言（EN/zh-CN/zh-TW） | ✅ |
| 模板中心 | ✅ |
| 墨绿色 UI 重设计 | ✅ |
| PocketBase 完整迁移 | ✅ |
| Stripe 支付（多币种） | ✅ |
| Alipay 支持（终身计划） | ✅ |
| SEO 优化 | ✅ |
| 营销页（Landing/Features/Pricing/FAQ） | ✅ |

---

## 7) 常见问题

### 登录后看不到数据
PocketBase 记录必须带 `sales_id`，并与登录用户匹配。

### Demo 模式
访问 `?demo=true` 参数或使用 `npm run dev:demo`，使用 fakerest 数据。

### 内部目录名为什么是 atomic-crm
保留原项目结构避免大范围重构。品牌名已全部改为 Custly。

---

## 8) 归档说明

以下内容已移至 `_archive/`（gitignored）：
- `doc/` — 上游 Astro 文档站
- `supabase/` — 旧后端（已迁移到 PocketBase）
- `design-reference/` — Figma 导出参考图
- `hkstp-ideation/` — 路演/商业计划材料
- `test-data/` — 测试 CSV 数据
- `requirements/` — 旧版 PRD
- 13 个未使用的修复脚本
