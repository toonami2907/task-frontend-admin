export const SetUp = [
    "Preview link",
    "Link (ad settings)",
    "URL parameters",
    "Meta Pixel",
    "App event",
    "Offline event",
    "Included custom audiences",
    "Excluded custom audiences",
    "Audience location (Ad set settings)",
    "Bid strategy",
    "Budget",
    "Schedule",
    "Campaign spending limit",
    "Objective",
    "Buying type",
    "Ad ID",
    "Ad set ID",
    "Campaign ID"
  ];

  export const defaultCustomColumn = [
    "Delivery",
    "Amount spent",
    "Budget",
    "Impressions",
    "CPM (cost per 1,000 impressions)",
    "Reach",
    "Frequency",
    "CTR (all)",
    "Link clicks",
    "CPC (all)",
    "Attribution setting",
    "Results",
    "Cost per result",
    "Ad ID",
    "Cost per 1,000 Accounts Center accounts reached",
  ];

  export const performanceMetrics = [
    "Delivery",
    "Ad Set Name",
    "Bid strategy",
    "Budget",
    "Last significant edit",
    "New customer CPA ",
    "New customer Purchases ",
    "Attribution setting",
    "Results",
    "Correct Purchases",
    "Reach",
    "Impressions",
    "Cost per result",
    "Quality ranking",
    "Engagement rate ranking",
    "Amount spent",
    "Ends",
    "Schedule"
  ];
export const deliveryMetrics = [
    "Delivery",
    "Reach",
    "Frequency",
    "Cost per 1,000 Accounts Center accounts reached",
    "Impressions",
    "CPM (cost per 1,000 impressions)"
  ];


  export const engagementMetrics = [
    "Delivery",
    "Page engagement",
    "Post reactions",
    "Post comments",
    "Post saves",
    "Post shares",
    "Link clicks",
    "Follows or likes",
    "CPC (cost per link click)"
  ];
  
  
  export const performanceAndClickMetrics = [
    "Delivery",
    "Attribution setting",
    "Results",
    "Reach",
    "Views",
    "Frequency",
    "Cost per result",
    "Budget",
    "Amount spent",
    "Ends",
    "Schedule",
    "Quality ranking",
    "Engagement rate ranking",
    "Conversion rate ranking",
    "Impressions",
    "CPM (cost per 1,000 impressions)",
    "Link clicks",
    "CPC (cost per link click)",
    "CTR (link click-through rate)",
    "Clicks (all)",
    "CTR (all)",
    "CPC (all)"
  ];
  

  export const formatDate = (dateString) => {
    const date = new Date(dateString);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
  };