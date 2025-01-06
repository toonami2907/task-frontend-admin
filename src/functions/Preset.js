/* eslint-disable no-unused-vars */
import { actionCategories } from "@/functions/resources/arrays";
/* eslint-disable no-unused-vars */
import { performanceMetrics, deliveryMetrics,engagementMetrics,defaultCustomColumn, performanceAndClickMetrics, SetUp} from "@/functions/resources/index";
const [
  performance,
  Cost,
  engagement,
  calling,
  messaging,
  clicks,
  media,
  objectNamesIDs,
  statusDates,
  goalBudgetSchedule,
  tracking,
] = actionCategories;




export const sortPresets = (presets) => {
  if (presets === "Delivery") {
    localStorage.setItem("customColumn", JSON.stringify(deliveryMetrics));
    return deliveryMetrics
  }else if(presets === "Performance"){
    localStorage.setItem("customColumn", JSON.stringify(performanceMetrics));
    return performanceMetrics
  } else if(presets === "Performance and clicks"){
    localStorage.setItem("customColumn", JSON.stringify(performanceAndClickMetrics));
    return performanceAndClickMetrics
  } else if(presets === "Engagement"){
    localStorage.setItem("customColumn", JSON.stringify(engagementMetrics));
    return engagementMetrics
  } else if(presets === "Setup"){
    localStorage.setItem("customColumn", JSON.stringify(SetUp));
    return SetUp
  } else if(presets === "Custom"){
    localStorage.setItem("customColumn", JSON.stringify(defaultCustomColumn));
    return defaultCustomColumn
  }
};
