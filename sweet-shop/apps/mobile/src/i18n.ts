import * as Localization from "expo-localization";
import { I18n } from "i18n-js";

const i18n = new I18n({
  en: {
    customerTitle: "Sweet Shop Customer App",
    ownerTitle: "Sweet Shop Owner App",
    browseStores: "Browse stores and place orders.",
    monitorOrders: "Monitor live incoming orders."
  },
  ar: {
    customerTitle: "تطبيق العميل - سويت شوب",
    ownerTitle: "تطبيق المالك - سويت شوب",
    browseStores: "تصفح الفروع واطلب الحلويات.",
    monitorOrders: "تابع الطلبات الواردة بشكل مباشر."
  }
});

i18n.enableFallback = true;
i18n.locale = Localization.getLocales()[0]?.languageCode === "ar" ? "ar" : "en";

export { i18n };
