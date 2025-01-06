import React, { useState } from "react";
import {
  Search,
  X,
  GripVertical,
  MoreVertical,
  ChevronDown,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Import the required library
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { actionCategories } from "@/functions/resources/arrays";
import { Button } from "./ui/button";
import { defaultCustomColumn, useGlobalContext } from "@/functions/features/StateProvider";
import toast from "react-hot-toast";

const DraggableItem = ({ id, index, moveItem, children }) => {
  const [{ isDragging }, drag] = useDrag({
    type: "ITEM",
    item: { id, index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [, drop] = useDrop({
    accept: "ITEM",
    hover(item) {
      if (item.index !== index) {
        moveItem(item.index, index);
        item.index = index;
      }
    },
  });

  return (
    <div
      ref={(node) => drag(drop(node))}
      style={{ opacity: isDragging ? 0.5 : 1 }}
      className="flex items-center gap-2 p-2 bg-white mb-2 rounded border group hover:border-gray-400"
    >
      {children}
    </div>
  );
};

const ColumnCustomizer = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const { setCustomColumn, customColumn } = useGlobalContext();
  const savedColumn = localStorage.getItem("customColumn");


  const handleToggleAction = (action) => {
    setCustomColumn((prev) =>
      prev.includes(action)
        ? prev.filter((a) => a !== action)
        : [...prev, action]
    );
  };

  const handleRemoveAction = (action) => {
    // setSelectedActions((prev) => prev.filter((a) => a !== action));
    setCustomColumn((prev) => prev.filter((a) => a !== action));
  };

  const moveItem = (fromIndex, toIndex) => {
    const customNavitems = [...customColumn];
    const [selected] = customNavitems.splice(fromIndex, 1);
    customNavitems.splice(toIndex, 0, selected);
    setCustomColumn(customNavitems);
  };

  const filteredCategories = actionCategories
    .map((category) => ({
      ...category,
      items: category.items.filter((item) =>
        item.toLowerCase().includes(searchTerm.toLowerCase())
      ),
    }))
    .filter((category) => category.items.length > 0);

    const handleCancelCustom = ()=>{
      setCustomColumn(defaultCustomColumn)
    }

  return (
    <DndProvider backend={HTML5Backend}>
      <Card className="w-full border-0 shadow-none">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <h2 className="text-lg font-medium">Custom Action</h2>
          <DropdownMenu>
            <DropdownMenuTrigger className="hover:bg-gray-100 p-2 rounded-md">
              <MoreVertical className="h-5 w-5 text-gray-500" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setCustomColumn(defaultCustomColumn)}>
                Reset Actions
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  localStorage.setItem("customColumn", JSON.stringify(customColumn));
                  toast.success("Configuration saved successfully");
                }
                 
                }
              >
                Save Configuration
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </CardHeader>

        <CardContent>
          <div className="relative mb-4">
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Search for custom actions"
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex gap-6">
            <ScrollArea className="w-1/2 h-[480px] pr-4">
              {filteredCategories.map((category, idx) => (
                <Collapsible key={idx} className="mb-2">
                  <CollapsibleTrigger className="flex w-full items-center justify-between p-2 hover:bg-gray-100 rounded-lg">
                    <div className="flex items-center gap-2">
                      <ChevronDown className="h-4 w-4" />
                      <span className="font-medium">{category.name}</span>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {
                        category.items.filter((item) =>
                          customColumn.includes(item)
                        ).length
                      }{" "}
                      selected
                    </Badge>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    {category.items.map((item, idx) => (
                      <div
                        key={idx}
                        className="ml-8 my-1.5 flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 cursor-pointer"
                        onClick={() => handleToggleAction(item)}
                      >
                        <Checkbox
                          checked={customColumn.includes(item)}
                          onCheckedChange={() => handleToggleAction(item)}
                        />
                        {item}
                      </div>
                    ))}
                  </CollapsibleContent>
                </Collapsible>
              ))}
            </ScrollArea>

            <div className="w-1/2 bg-gray-50 p-4 rounded-lg">
              <div className="flex flex-col justify-between items-start mb-4">
                <span className="font-medium text-2xl">
                  {customColumn.length} columns selected
                </span>
                <p className="text-md">
                  Drag and drop to arrange columns as they’ll appear in the
                  table.
                </p>
              </div>

              <ScrollArea className="h-[400px]">
                {customColumn.map((action, index) => (
                  <DraggableItem
                    key={index}
                    id={action}
                    index={index}
                    moveItem={moveItem}
                  >
                    <GripVertical className="h-4 w-4 text-gray-400" />
                    <span className="text-sm">{action}</span>
                    <div className="ml-auto">
                      <X
                        className="h-4 w-4 text-gray-400 cursor-pointer hover:text-gray-600"
                        onClick={() => handleRemoveAction(action)}
                      />
                    </div>
                  </DraggableItem>
                ))}
              </ScrollArea>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end items-center gap-4">
          <Button 
          onClick={handleCancelCustom}
          >Cancel</Button>
          <Button
          onClick={() => {
            localStorage.setItem("customColumn", JSON.stringify(customColumn));
            toast.success("Configuration saved successfully");
          }
           
          }
          >Apply</Button>
        </CardFooter>
      </Card>
    </DndProvider>
  );
};

export default ColumnCustomizer;
