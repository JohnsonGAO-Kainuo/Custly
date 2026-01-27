export const crmChineseTraditionalMessages = {
  // 資源名稱
  resources: {
    contacts: {
      name: "聯繫人 |||| 聯繫人",
      fields: {
        first_name: "名",
        last_name: "姓",
        email: "郵箱",
        phone_number: "電話",
        title: "職位",
        company_id: "公司",
        gender: "性別",
        avatar: "頭像",
        first_seen: "首次訪問",
        last_seen: "最後訪問",
        has_newsletter: "訂閱新聞",
        linkedin_url: "LinkedIn",
        tags: "標籤",
        sales_id: "銷售負責人",
        nb_notes: "備註數",
        nb_tasks: "任務數",
      },
    },
    companies: {
      name: "公司 |||| 公司",
      fields: {
        name: "公司名稱",
        sector: "行業",
        size: "規模",
        logo: "Logo",
        phone_number: "電話",
        address: "地址",
        city: "城市",
        zipcode: "郵編",
        state_abbr: "州/省",
        website: "網站",
        linkedin_url: "LinkedIn",
        created_at: "創建時間",
        sales_id: "銷售負責人",
        nb_contacts: "聯繫人數",
        nb_deals: "交易數",
      },
    },
    deals: {
      name: "交易 |||| 交易",
      fields: {
        name: "交易名稱",
        company_id: "公司",
        contact_ids: "聯繫人",
        stage: "階段",
        amount: "金額",
        expected_closing_date: "預計成交日期",
        description: "描述",
        index: "排序",
        created_at: "創建時間",
        updated_at: "更新時間",
        sales_id: "銷售負責人",
        nb_notes: "備註數",
        category: "類別",
      },
    },
    tasks: {
      name: "任務 |||| 任務",
      fields: {
        text: "任務內容",
        type: "類型",
        contact_id: "聯繫人",
        due_date: "截止日期",
        done_date: "完成日期",
        sales_id: "負責人",
      },
    },
    notes: {
      name: "備註 |||| 備註",
      fields: {
        text: "內容",
        contact_id: "聯繫人",
        deal_id: "交易",
        date: "日期",
        sales_id: "創建人",
        status: "狀態",
      },
    },
    sales: {
      name: "銷售人員 |||| 銷售人員",
      fields: {
        first_name: "名",
        last_name: "姓",
        email: "郵箱",
        administrator: "管理員",
        disabled: "已禁用",
        avatar: "頭像",
      },
    },
    activities: {
      name: "活動 |||| 活動",
      fields: {
        type: "類型",
        date: "日期",
        contact_id: "聯繫人",
        company_id: "公司",
        deal_id: "交易",
        sales_id: "銷售",
      },
    },
    tags: {
      name: "標籤 |||| 標籤",
      fields: {
        name: "名稱",
        color: "顏色",
      },
    },
  },
  
  // 頁面標題
  pages: {
    dashboard: "儀錶板",
    contacts: "聯繫人",
    companies: "公司",
    deals: "交易",
    tasks: "任務",
    activities: "活動",
    settings: "設置",
  },
  
  // 自定義操作
  actions: {
    add_contact: "添加聯繫人",
    add_company: "添加公司",
    add_deal: "添加交易",
    add_task: "添加任務",
    add_note: "添加備註",
    import_contacts: "導入聯繫人",
    export_contacts: "導出聯繫人",
    merge_contacts: "合併聯繫人",
    disable_user: "禁用用戶",
    enable_user: "啟用用戶",
    send_email: "發送郵件",
    call: "撥打電話",
    visit_website: "訪問網站",
  },
  
  // 交易階段
  dealStages: {
    opportunity: "機會",
    proposal: "提案",
    negotiation: "談判",
    won: "成交",
    lost: "失敗",
  },
  
  // 性別
  gender: {
    male: "男",
    female: "女",
    other: "其他",
  },
  
  // 任務類型
  taskTypes: {
    call: "電話",
    email: "郵件",
    meeting: "會議",
    demo: "演示",
    lunch: "午餐",
    follow_up: "跟進",
  },
  
  // 備註狀態
  noteStatus: {
    cold: "冷",
    warm: "溫",
    hot: "熱",
    in_contract: "簽約中",
  },
  
  // 公司規模
  companySize: {
    "1-10": "1-10人",
    "11-50": "11-50人",
    "51-200": "51-200人",
    "201-500": "201-500人",
    "501-1000": "501-1000人",
    "1001-5000": "1001-5000人",
    "5001+": "5000人以上",
  },
  
  // 公司行業
  companySectors: {
    technology: "科技",
    finance: "金融",
    healthcare: "醫療",
    education: "教育",
    retail: "零售",
    manufacturing: "製造",
    real_estate: "房地產",
    consulting: "諮詢",
    media: "媒體",
    other: "其他",
  },
  
  // 儀錶板
  dashboard: {
    welcome: "歡迎回來，%{name}",
    monthly_revenue: "月度收入",
    new_contacts: "新聯繫人",
    deals_won: "成交交易",
    hot_contacts: "熱門聯繫人",
    pending_tasks: "待辦任務",
    latest_notes: "最新備註",
    deals_pipeline: "交易管道",
    revenue_by_sector: "行業收入",
  },
  
  // 消息
  messages: {
    contact_created: "聯繫人創建成功",
    contact_updated: "聯繫人更新成功",
    contact_deleted: "聯繫人刪除成功",
    company_created: "公司創建成功",
    company_updated: "公司更新成功",
    deal_created: "交易創建成功",
    deal_updated: "交易更新成功",
    task_created: "任務創建成功",
    task_completed: "任務已完成",
    note_created: "備註創建成功",
    import_success: "成功導入 %{count} 條記錄",
    export_success: "導出成功",
    merge_success: "聯繫人合併成功",
    no_data: "暫無數據",
    loading: "加載中...",
  },
  
  // 驗證
  validation: {
    required_field: "此字段為必填項",
    invalid_email: "請輸入有效的郵箱地址",
    invalid_phone: "請輸入有效的電話號碼",
    invalid_url: "請輸入有效的URL",
    min_length: "最少 %{min} 個字符",
    max_length: "最多 %{max} 個字符",
    must_be_number: "必須是數字",
    must_be_positive: "必須是正數",
  },
  
  // 過濾器
  filters: {
    all: "全部",
    active: "活躍",
    inactive: "不活躍",
    has_email: "有郵箱",
    has_phone: "有電話",
    has_linkedin: "有LinkedIn",
    subscribed: "已訂閱",
    hot: "熱門",
    warm: "溫和",
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
    delete: "刪除",
    edit: "編輯",
    create: "創建",
    search: "搜索",
    filter: "篩選",
    export: "導出",
    import: "導入",
    refresh: "刷新",
    back: "返回",
    next: "下一步",
    previous: "上一步",
    loading: "加載中...",
    no_results: "無結果",
    confirm: "確認",
    total: "共計",
    actions: "操作",
    details: "詳情",
    settings: "設置",
  },
  crm: {
    dashboard: {
      overview: {
        kicker: "總覽",
        title: "今日工作台",
        subtitle: "一眼掌握銷售與客戶動向。",
        contacts: "聯繫人",
        contacts_hint: "活躍關係",
        companies: "公司",
        companies_hint: "進行中帳戶",
        deals: "交易",
        deals_hint: "開放機會",
        tasks: "任務",
        tasks_hint: "下一步動作",
      },
      latest_activity: "最新動態",
      tasks_empty: "聯繫人相關的任務會顯示在這裡。",
      welcome: {
        title: "歡迎使用 Custly",
        description:
          "Custly 是一款現代 CRM，幫助你優雅高效地管理客戶關係。",
        demo_note:
          "此示範使用模擬資料，你可以自由瀏覽與修改，重新整理後會重置。",
        built_with: "基於 React、shadcn/ui 與 Tailwind CSS 構建。",
      },
    },
  },
};

export default crmChineseTraditionalMessages;
