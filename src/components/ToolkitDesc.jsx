import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  deliveryMetrics,
  engagementMetrics,
  performanceAndClickMetrics,
  performanceMetrics,
  SetUp,
} from "@/functions/resources";

// const options = {
//     "Recently used": [
//       { name: "Delivery", description: "View delivery-related metrics and statistics" },
//       { name: "Performance and clicks", description: "Track engagement and click-through rates" },
//       { name: "Performance", description: "Monitor overall performance metrics" }
//     ],
//     Popular: [
//       { name: "Engagement", description: "Analyze user engagement metrics" },
//       { name: "Setup", description: "Configure basic settings and parameters" },
//       { name: "Video engagement", description: "Track video-specific engagement metrics" }
//     ],
//     Custom: [
//       { name: "Custom", description: "Create and configure custom column layouts" }
//     ]
//   };

const ToolkitDesc = ({ name, description }) => {
  let data;
  switch (name) {
    case "Delivery":
      data = deliveryMetrics;
      break;
    case "Performance and clicks":
      data = performanceAndClickMetrics;
      break;
    case "Performance":
      data = performanceMetrics;
      break;
    case "Setup":
      data = SetUp;
      break;
    case "Engagement":
      data = engagementMetrics;
      break;
    default:
      data = [];
      break;
  }

  // console.log('===data', data)
  return (
    <div>
      <Card className="w-[300px]">
        <CardHeader>
          <CardTitle className='font-bold text-sm text-gray-800 '>{name}</CardTitle>
          <CardDescription>{name == 'Custom' ? 'Create and configure custom column layouts' : 'Here are the metrics and details included in this column preset:'}</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="flex flex-col gap-2">
            {data && data.map((lists, idx) => <li className="list-disc font-sans text-xs text-gray-700" key={idx}>{lists}</li>)}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default ToolkitDesc;
