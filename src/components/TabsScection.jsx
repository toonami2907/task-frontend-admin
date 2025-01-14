import React, { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Folder, LayoutDashboardIcon, Book, X } from "lucide-react";
import { useGlobalContext } from "@/functions/features/StateProvider";

const MyTabs = ({ selectedBarLength, SelectedBarState,SelectedCamapiagnLength, SelectedCamapiagn  }) => {
  const { setState, state } = useGlobalContext();

  function handleTabChange(value) {
    // console.log(`Tab switched to: ${value}`);
    setState(value);
  }

  useEffect(() => {
    handleTabChange(state)
    // console.log("state", state);
  }, [state,selectedBarLength ]);
  return (
    <div className="">
      <Tabs
        value={state}
        onValueChange={(value) => handleTabChange(value)}
        className="max-w-screen-md w-full "
      >
        <TabsList className="w-full borderr grid grid-cols-3 bg-inherit p-0 gap-5 h-[150px]">
          <TabsTrigger
            className="flex items-start justify-between bg-gray-100 h-full border shadow-sm p-2"
            value="Campaign"
          >
            <h1 className="flex items-center gap-2 font-medium">
              <Folder />
              Campaign
            </h1>
            {SelectedCamapiagnLength > 0 && (
              <div className="bg-blue-600 rounded-lg flex items-center gap-2 text-xs p-2 text-white">
                <span> {SelectedCamapiagnLength} selected</span> <span onClick={()=>{
                  SelectedCamapiagn([])
                }}><X size={20} /></span>
              </div>
            )}
          </TabsTrigger>
          <TabsTrigger
            className="flex items-start justify-between bg-gray-100 h-full border shadow-sm p-2"
            value="Ads Set"
          >
            {" "}
            <h1 className="flex items-center font-medium gap-2">
              <LayoutDashboardIcon />
              Ads set
            </h1>
            {selectedBarLength > 0 && (
              <div className="bg-blue-600 rounded-lg flex items-center gap-2 text-xs p-2 text-white">
                <span> {selectedBarLength} selected</span> <span onClick={()=>{
                  SelectedBarState([])
                }}><X size={20} /></span>
              </div>
            )}
          </TabsTrigger>
          <TabsTrigger
            className="flex flex-col items-start justify-start bg-gray-100 h-full border shadow-sm p-2"
            value="Ads"
          >
            <h1 className="flex items-center font-medium gap-2">
              <Book />

              {selectedBarLength > 0 ? <span className="font-semibold text-lg">Ads for {selectedBarLength} Ads sets</span> :  'Ads'}
             {" "}
            </h1>
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
};

export default MyTabs;
