export const conditionConfig = {
  metrics: {
    cpa: {
      label: "Cost per Acquisition (CPA)",
      operators: ["greater", "less", "equals"],
      valueType: "number",
      timeframes: ["today", "lifetime", "last_7_days", "last_30_days"]
    },
    ncpa: {
      label: "New Customer CPA",
      operators: ["greater", "less", "equals"],
      valueType: "number",
      timeframes: ["today", "lifetime", "last_7_days", "last_30_days"]
    },
    spend: {
      label: "Ad Spend",
      operators: ["greater", "less"],
      valueType: "number",
      timeframes: ["today", "lifetime", "last_7_days", "last_30_days"]
    },
    name: {
      label: "Name",
      operators: ["contains", "equals", "start with", "end with"],
      valueType: "text"
    },
    // time: {
    //   label: "Time of Day",
    //   operators: ["between"],
    //   valueType: "timeRange"
    // },
    // roas: {
    //   label: "Return on Ad Spend",
    //   operators: ["greater", "less", "equals"],
    //   valueType: "number",
    //   timeframes: ["today", "lifetime", "last_7_days", "last_30_days"]
    // },
    // conversions: {
    //   label: "Conversions",
    //   operators: ["greater", "less", "equals"],
    //   valueType: "number",
    //   timeframes: ["today", "lifetime", "last_7_days", "last_30_days"]
    // }
  },
  operators: {
    greater: "Greater than",
    less: "Less than",
    equals: "Equals",
    contains: "Contains",
    between: "Between",
    "start with": "Starts with",    // Add this line
    "end with": "Ends with" 
  },
  timeframes: {
    today: "Today",
    lifetime: "Lifetime",
    last_7_days: "Last 7 days",
    last_30_days: "Last 30 days"
  }
};

export const daysConfig = {
  days: [
    { value: '1', label: 'Monday' },
    { value: '2', label: 'Tuesday' },
    { value: '3', label: 'Wednesday' },
    { value: '4', label: 'Thursday' },
    { value: '5', label: 'Friday' },
    { value: '6', label: 'Saturday' },
    { value: '0', label: 'Sunday' }
  ]
};
