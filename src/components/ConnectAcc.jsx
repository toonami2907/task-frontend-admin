import React, { useState } from "react";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Link } from "lucide-react";
import PlatformConnectorDialog from "./PlatformConnector";

const ConnectAcc = () => {
  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button variant="outline" className="group flex items-center gap-2">
          <Link className="w-5 h-5 text-blue-600 group-hover:rotate-45 transition-transform" />
          <span className="text-blue-600 group-hover:text-blue-800 transition-colors">
            Connect Accounts
          </span>
        </Button>
      </DrawerTrigger>
      <DrawerContent className="max-h-[90vh] overflow-y-auto">
        <DrawerHeader className="text-center">
          <DrawerTitle className="text-2xl font-bold text-gray-800">
            Platform Connections
          </DrawerTitle>
          <DrawerDescription className="text-gray-600">
            Seamlessly connect your marketing and e-commerce platforms
          </DrawerDescription>
        </DrawerHeader>
        
        <div className="px-4 py-2">
          <PlatformConnectorDialog />
        </div>
        
        <DrawerFooter>
          <DrawerClose asChild>
            <Button variant="outline" className="w-full">
              Close
            </Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};

export default ConnectAcc;