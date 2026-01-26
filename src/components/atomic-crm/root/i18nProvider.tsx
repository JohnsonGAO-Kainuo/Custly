import { mergeTranslations } from "ra-core";
import polyglotI18nProvider from "ra-i18n-polyglot";
import englishMessages from "ra-language-english";
import { raSupabaseEnglishMessages } from "ra-supabase-language-english";
import chineseMessages from "@/i18n/zh-CN";
import chineseTraditionalMessages from "@/i18n/zh-TW";
import crmChineseMessages from "@/i18n/crm-zh-CN";
import crmChineseTraditionalMessages from "@/i18n/crm-zh-TW";
import marketingEnglishMessages from "@/i18n/marketing-en";
import marketingChineseMessages from "@/i18n/marketing-zh-CN";
import marketingChineseTraditionalMessages from "@/i18n/marketing-zh-TW";

const raSupabaseEnglishMessagesOverride = {
  "ra-supabase": {
    auth: {
      password_reset: "Check your emails for a Reset Password message.",
    },
  },
};

const raSupabaseChineseMessages = {
  "ra-supabase": {
    auth: {
      email: "邮箱",
      password: "密码",
      sign_in: "登录",
      sign_in_error: "认证失败，请重试",
      sign_out: "退出",
      password_reset: "请检查您的邮箱以获取重置密码的邮件。",
      email_label: "邮箱",
      password_label: "密码",
      confirm_password: "确认密码",
      forgot_password: "忘记密码？",
      reset_password: "重置密码",
      sign_up: "注册",
      sign_up_error: "注册失败，请重试",
    },
  },
};

const raSupabaseChineseTraditionalMessages = {
  "ra-supabase": {
    auth: {
      email: "郵箱",
      password: "密碼",
      sign_in: "登錄",
      sign_in_error: "認證失敗，請重試",
      sign_out: "退出",
      password_reset: "請檢查您的郵箱以獲取重置密碼的郵件。",
      email_label: "郵箱",
      password_label: "密碼",
      confirm_password: "確認密碼",
      forgot_password: "忘記密碼？",
      reset_password: "重置密碼",
      sign_up: "註冊",
      sign_up_error: "註冊失敗，請重試",
    },
  },
};

export const i18nProvider = polyglotI18nProvider(
  (locale) => {
    if (locale === "zh-CN") {
      return mergeTranslations(
        chineseMessages,
        raSupabaseChineseMessages,
        crmChineseMessages,
        marketingChineseMessages,
      );
    }
    if (locale === "zh-TW") {
      return mergeTranslations(
        chineseTraditionalMessages,
        raSupabaseChineseTraditionalMessages,
        crmChineseTraditionalMessages,
        marketingChineseTraditionalMessages,
      );
    }
    return mergeTranslations(
      englishMessages,
      raSupabaseEnglishMessages,
      raSupabaseEnglishMessagesOverride,
      marketingEnglishMessages,
    );
  },
  "en", // 默认语言
  [
    { locale: "en", name: "English" },
    { locale: "zh-CN", name: "简体中文" },
    { locale: "zh-TW", name: "繁體中文" },
  ],
  { allowMissing: true },
);
