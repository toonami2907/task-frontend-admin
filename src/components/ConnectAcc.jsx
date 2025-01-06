import React, { useState } from "react";
import {
  Drawer,
  DrawerContent,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Button } from "./ui/button";
import PlatformConnector from "./PlatformConnector";

const ConnectAcc = () => {
  return (
    <Drawer position="bottom">
      <DrawerTrigger>
        <Button className="flex items-center gap-2 bg-white text-blue-600 hover:bg-gray-50 font-semibold border border-blue-600 shadow-none ">
          {" "}
          <img src="/meta ads.svg" className="w-6 h-6 text-blue-600" />
          <img src="/shopify-bag.svg" className="w-4 h-4 mr-2" />
          Connect Your Accounts
        </Button>
      </DrawerTrigger>
      <DrawerContent className="bottom-0">
        <PlatformConnector />
      </DrawerContent>
    </Drawer>
  );
};

export default ConnectAcc;
