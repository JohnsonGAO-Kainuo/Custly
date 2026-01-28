export const crmChineseMessages = {
  // 资源名称
  resources: {
    contacts: {
      name: "联系人 |||| 联系人",
      fields: {
        first_name: "名",
        last_name: "姓",
        email: "邮箱",
        phone_number: "电话",
        title: "职位",
        company_id: "公司",
        gender: "性别",
        avatar: "头像",
        first_seen: "首次访问",
        last_seen: "最后访问",
        has_newsletter: "订阅新闻",
        linkedin_url: "LinkedIn",
        tags: "标签",
        sales_id: "销售负责人",
        nb_notes: "备注数",
        nb_tasks: "任务数",
      },
    },
    companies: {
      name: "公司 |||| 公司",
      fields: {
        name: "公司名称",
        sector: "行业",
        size: "规模",
        logo: "Logo",
        phone_number: "电话",
        address: "地址",
        city: "城市",
        zipcode: "邮编",
        state_abbr: "州/省",
        website: "网站",
        linkedin_url: "LinkedIn",
        created_at: "创建时间",
        sales_id: "销售负责人",
        nb_contacts: "联系人数",
        nb_deals: "交易数",
      },
    },
    deals: {
      name: "交易 |||| 交易",
      fields: {
        name: "交易名称",
        company_id: "公司",
        contact_ids: "联系人",
        stage: "阶段",
        amount: "金额",
        expected_closing_date: "预计成交日期",
        description: "描述",
        index: "排序",
        created_at: "创建时间",
        updated_at: "更新时间",
        sales_id: "销售负责人",
        nb_notes: "备注数",
        category: "类别",
      },
    },
    tasks: {
      name: "任务 |||| 任务",
      fields: {
        text: "任务内容",
        type: "类型",
        contact_id: "联系人",
        due_date: "截止日期",
        done_date: "完成日期",
        sales_id: "负责人",
      },
    },
    notes: {
      name: "备注 |||| 备注",
      fields: {
        text: "内容",
        contact_id: "联系人",
        deal_id: "交易",
        date: "日期",
        sales_id: "创建人",
        status: "状态",
      },
    },
    sales: {
      name: "销售人员 |||| 销售人员",
      fields: {
        first_name: "名",
        last_name: "姓",
        email: "邮箱",
        administrator: "管理员",
        disabled: "已禁用",
        avatar: "头像",
      },
    },
    activities: {
      name: "活动 |||| 活动",
      fields: {
        type: "类型",
        date: "日期",
        contact_id: "联系人",
        company_id: "公司",
        deal_id: "交易",
        sales_id: "销售",
      },
    },
    tags: {
      name: "标签 |||| 标签",
      fields: {
        name: "名称",
        color: "颜色",
      },
    },
  },
  
  // 页面标题
  pages: {
    dashboard: "仪表板",
    contacts: "联系人",
    companies: "公司",
    deals: "交易",
    tasks: "任务",
    activities: "活动",
    settings: "设置",
  },
  
  // 自定义操作
  actions: {
    add_contact: "添加联系人",
    add_company: "添加公司",
    add_deal: "添加交易",
    add_task: "添加任务",
    add_note: "添加备注",
    import_contacts: "导入联系人",
    export_contacts: "导出联系人",
    merge_contacts: "合并联系人",
    disable_user: "禁用用户",
    enable_user: "启用用户",
    send_email: "发送邮件",
    call: "拨打电话",
    visit_website: "访问网站",
  },
  
  // 交易阶段
  dealStages: {
    opportunity: "机会",
    proposal: "提案",
    negotiation: "谈判",
    won: "成交",
    lost: "失败",
  },
  
  // 性别
  gender: {
    male: "男",
    female: "女",
    other: "其他",
  },
  
  // 任务类型
  taskTypes: {
    call: "电话",
    email: "邮件",
    meeting: "会议",
    demo: "演示",
    lunch: "午餐",
    follow_up: "跟进",
  },
  
  // 备注状态
  noteStatus: {
    cold: "冷",
    warm: "温",
    hot: "热",
    in_contract: "签约中",
  },
  
  // 公司规模
  companySize: {
    "1-10": "1-10人",
    "11-50": "11-50人",
    "51-200": "51-200人",
    "201-500": "201-500人",
    "501-1000": "501-1000人",
    "1001-5000": "1001-5000人",
    "5001+": "5000人以上",
  },
  
  // 公司行业
  companySectors: {
    technology: "科技",
    finance: "金融",
    healthcare: "医疗",
    education: "教育",
    retail: "零售",
    manufacturing: "制造",
    real_estate: "房地产",
    consulting: "咨询",
    media: "媒体",
    other: "其他",
  },
  
  // 仪表板
  dashboard: {
    welcome: "欢迎回来，%{name}",
    monthly_revenue: "月度收入",
    new_contacts: "新联系人",
    deals_won: "成交交易",
    hot_contacts: "热门联系人",
    pending_tasks: "待办任务",
    latest_notes: "最新备注",
    deals_pipeline: "交易管道",
    revenue_by_sector: "行业收入",
  },
  
  // 消息
  messages: {
    contact_created: "联系人创建成功",
    contact_updated: "联系人更新成功",
    contact_deleted: "联系人删除成功",
    company_created: "公司创建成功",
    company_updated: "公司更新成功",
    deal_created: "交易创建成功",
    deal_updated: "交易更新成功",
    task_created: "任务创建成功",
    task_completed: "任务已完成",
    note_created: "备注创建成功",
    import_success: "成功导入 %{count} 条记录",
    export_success: "导出成功",
    merge_success: "联系人合并成功",
    no_data: "暂无数据",
    loading: "加载中...",
  },
  
  // 验证
  validation: {
    required_field: "此字段为必填项",
    invalid_email: "请输入有效的邮箱地址",
    invalid_phone: "请输入有效的电话号码",
    invalid_url: "请输入有效的URL",
    min_length: "最少 %{min} 个字符",
    max_length: "最多 %{max} 个字符",
    must_be_number: "必须是数字",
    must_be_positive: "必须是正数",
  },
  
  // 过滤器
  filters: {
    all: "全部",
    active: "活跃",
    inactive: "不活跃",
    has_email: "有邮箱",
    has_phone: "有电话",
    has_linkedin: "有LinkedIn",
    subscribed: "已订阅",
    hot: "热门",
    warm: "温和",
    cold: "冷淡",
    this_month: "本月",
    last_month: "上月",
    this_quarter: "本季度",
    this_year: "本年",
  },
  
  // 通用
  common: {
    yes: "是",
    no: "否",
    save: "保存",
    cancel: "取消",
    delete: "删除",
    edit: "编辑",
    create: "创建",
    search: "搜索",
    filter: "筛选",
    export: "导出",
    import: "导入",
    refresh: "刷新",
    back: "返回",
    next: "下一步",
    previous: "上一步",
    loading: "加载中...",
    no_results: "无结果",
    confirm: "确认",
    total: "共计",
    actions: "操作",
    details: "详情",
    settings: "设置",
  },
  crm: {
    dashboard: {
      overview: {
        kicker: "总览",
        title: "今日工作台",
        subtitle: "一眼掌握销售与客户动向。",
        contacts: "联系人",
        contacts_hint: "活跃关系",
        companies: "公司",
        companies_hint: "进行中账户",
        deals: "交易",
        deals_hint: "开放机会",
        tasks: "任务",
        tasks_hint: "下一步动作",
      },
      hot_contacts: {
        kicker: "热门联系人",
        title: "热门联系人",
        create: "创建联系人",
        last_seen: "最后联系 %{date}",
        badges: {
          tasks: "%{count} 项任务",
          newsletter: "订阅用户",
        },
        actions: {
          email: "发送邮件",
          call: "拨打电话",
        },
        empty_title: "状态为“热门”的联系人会显示在这里。",
        empty_note: "通过添加备注并点击“显示选项”来修改联系人状态。",
      },
      tasks: {
        kicker: "任务",
        title: "待办任务",
        progress: "已完成 %{done} / %{total}",
        filters: {
          overdue: "逾期",
          today: "今天",
          tomorrow: "明天",
          this_week: "本周",
          later: "以后",
        },
      },
      activity: {
        kicker: "动态",
      },
      pipeline: {
        kicker: "管道",
        title: "预计成交收入",
        window: "近 6 个月",
        legend: {
          won: "已成交",
          lost: "已流失",
        },
      },
      latest_activity: "最新动态",
      tasks_empty: "联系人相关的任务会显示在这里。",
      welcome: {
        title: "欢迎使用 Custly",
        description:
          "Custly 是一款现代 CRM，帮助你优雅高效地管理客户关系。",
        demo_note:
          "此演示使用模拟数据，你可以自由浏览和修改，刷新后会重置。",
        built_with: "基于 React、shadcn/ui 与 Tailwind CSS 构建。",
      },
    },
    templates: {
      kicker: "模板",
      title: "模板中心",
      subtitle: "选择行业模板来调整流程与字段结构。",
      active: "当前模板",
      apply: "应用模板",
      applied: "模板已应用",
      applied_button: "已应用",
      reset: "恢复默认",
      reset_done: "已恢复默认模板",
      reload_hint: "刷新后生效。",
      sections: {
        highlights: "重点",
        pipeline: "流程",
        fields: "字段",
        tags: "标签",
      },
      general: {
        name: "通用 CRM",
        badge: "默认",
        summary: "适用于大多数客户与销售团队的平衡配置。",
        highlights: {
          0: "统一销售流程",
          1: "灵活任务类型",
          2: "标准客户生命周期",
        },
        pipeline: {
          0: "机会 → 方案 → 谈判",
          1: "成交/流失跟踪",
          2: "跟进阶段",
        },
        fields: {
          0: "公司规模与行业",
          1: "成交金额与预计时间",
          2: "联系人角色",
        },
        tags: {
          0: "线索",
          1: "加购",
          2: "优先级",
        },
      },
      counseling: {
        name: "心理咨询",
        badge: "咨询",
        summary: "适合接待、评估与后续随访流程。",
        highlights: {
          0: "咨询接待优先",
          1: "方案记录清晰",
          2: "随访节奏明确",
        },
        pipeline: {
          0: "咨询 → 评估 → 方案",
          1: "治疗跟进",
          2: "复访提醒",
        },
        fields: {
          0: "紧急程度",
          1: "咨询频次",
          2: "转介来源",
        },
        tags: {
          0: "高优先级",
          1: "复诊",
          2: "转介",
        },
      },
      ecommerce: {
        name: "跨境电商",
        badge: "增长",
        summary: "适合询盘、报价与售后协同。",
        highlights: {
          0: "询盘到成交",
          1: "报价跟进",
          2: "售后触达",
        },
        pipeline: {
          0: "线索 → 报价 → 谈判",
          1: "成交与流失视图",
          2: "售后阶段",
        },
        fields: {
          0: "渠道与 SKU",
          1: "订单金额",
          2: "履约状态",
        },
        tags: {
          0: "高毛利",
          1: "批发",
          2: "平台",
        },
      },
    },
  },
};

export default crmChineseMessages;
