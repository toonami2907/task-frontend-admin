const ROUTES = {
    AUTH: {
      VERIFY: { path: "/auth/verify", method: "GET" },
      PROFILE: { path: "/auth/profile", method: "GET" },
      REFRESH_TOKEN: { path: "/auth/refresh-token", method: "POST" },
      VERIFY_CARD: { path: "/auth/verify/card", method: "POST" },
      ADD_CARD: { path: "/auth/add/card", method: "POST" }
    },
    USERAUTH: {
        REGISTER: { path: "/auth/register", method: "POST" },
        LOGIN: { path: "/auth/login", method: "POST" },
        LOGOUT: { path: "/auth/logout", method: "POST" },
        VERIFY_EMAIL: { path: "/auth/verify/email", method: "POST" },
        VERIFY_TOKEN: (token) => ({ path: `/auth/verify/token/${token}`, method: "GET" }),
        RESEND_VERIFICATION: { path: "/auth/resend/email", method: "POST" },
        EDIT_PROFILE: { path: "/auth/user/edit/profile", method: "PUT" },
        ADD_AD_ACCOUNT: { path: "/auth/user/add/account", method: "POST" },
        REMOVE_AD_ACCOUNT: (accountId) => ({ path: `/auth/user/remove/${accountId}`, method: "DELETE" }),
        GOOGLE_CALLBACK: { path: "/auth/google/callback", method: "GET" },
        GOOGLE_SIGNIN: { path: "/auth/google", method: "POST" }
      },
    
      RULES: {
        GET_RULES: { path: "/auth/rules", method: "GET" },
        GET_METRICS: { path: "/auth/metrics", method: "GET" },
        CREATE_RULE: { path: "/auth/rules", method: "POST" },
        UPDATE_RULE: (id) => ({ path: `/auth/rules/${id}`, method: "PUT" }),
        DELETE_RULE: (id) => ({ path: `/auth/rules/${id}`, method: "DELETE" })
      },
  
    SHOPIFY: {
      LINK: { path: "/auth/shopify/link", method: "POST" },
      INSTALL: { path: "/auth/install", method: "POST" },
      CALLBACK: { path: "/auth/callback", method: "GET" },
      FB_AUTH: { path: "/auth/fb/auth", method: "GET" },
      FB_CALLBACK: { path: "/auth/fb/callback", method: "POST" },
      UPDATE_ACCESS: { path: "/auth/access", method: "POST" }
    },
  
    ORDER: {
      FETCH: { path: "/auth/order", method: "GET" },
      CREATE_UTM: { path: "/auth/orderutm", method: "POST" },
      CREATE: { path: "/auth/createOrder", method: "GET" },
      FETCH_ALL: { path: "/auth/fetchOrder", method: "GET" },
      MATCH_STATS: { path: "/auth/all/stats", method: "GET" },
      DASHBOARD: { path: "/auth/dashboard", method: "GET" },
      FETCH_PRODUCT: { path: "/auth/product", method: "GET" }
    },
  
    FACEBOOK_ADS: {
      FETCH_ALL: { path: "/auth/ads", method: "POST" },
      FETCH_USER_ACCOUNTS: { path: "/auth/ads/user", method: "GET" },
      FETCH_DB_ADS: { path: "/auth/db/ads", method: "GET" },
      FETCH_DB_ADS_SET: { path: "/auth/db/ads_set", method: "GET" },
      FETCH_DB_CAMPAIGNS: { path: "/auth/db/campaigns", method: "GET" },
      FETCH_CAMPAIGN: (campaignId) => ({ path: `/auth/campaign/${campaignId}`, method: "GET" }),
      FETCH_ADSET: (adSetId) => ({ path: `/auth/adsset/${adSetId}`, method: "GET" }),
      FETCH_AD: (adId) => ({ path: `/auth/ads/${adId}`, method: "GET" }),
      FETCH_CAMPAIGNS: { path: "/auth/camp", method: "GET" },
      FETCH_TEST_ADS: { path: "/auth/test/ads", method: "GET" }
    },
  
    FACEBOOK_MODIFY: {
      PAUSE_CAMPAIGN: (campaignId) => ({ path: `/auth/pause/${campaignId}`, method: "POST" }),
      PAUSE_AD: (adId) => ({ path: `/auth/pause/ads/${adId}`, method: "POST" }),
      PAUSE_ADSET: (adSetId) => ({ path: `/auth/pause/Adset/${adSetId}`, method: "POST" }),
      UPDATE_CAMPAIGN_NAME: { path: "/auth/update/campaign", method: "POST" },
      UPDATE_ADSET_NAME: { path: "/auth/update/ads_set", method: "POST" },
      UPDATE_AD_NAME: { path: "/auth/update/ads", method: "POST" },
      UPDATE_CAMPAIGN_BUDGET: { path: "/auth/update/camapaign/budget", method: "POST" },
      UPDATE_ADSET_BUDGET: { path: "/auth/update/ads_set/budget", method: "POST" }
    },
  
    FACEBOOK_STATUS: {
      PAUSE_CAMPAIGNS: { path: "/auth/pause/status/campaigns", method: "POST" },
      PAUSE_ADSETS: { path: "/auth/pause/status/AdSets", method: "POST" },
      PAUSE_ADS: { path: "/auth/pause/status/Ads", method: "POST" }
    },
  
    TEST: {
      GENERAL_TEST: { path: "/auth/test", method: "GET" },
      FETCH_FB_BUDGET: { path: "/auth/fb/budget", method: "GET" }
    }
  };
  
  export default ROUTES;
  