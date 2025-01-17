import { useState } from "react";
import ComponentA from "./ComponentA";
import ComponentB from "./ComponentB";

const Component1 = () => {
    // Sample data for both components
    const dataA = [
      { id: 1, name: 'Item A1' },
      { id: 2, name: 'Item A2' },
    ];
    
    const dataB = [
      { id: 3, name: 'Item B1' },
      { id: 4, name: 'Item B2' },
    ];
  
    // States
    const [selectedIds, setSelectedIds] = useState([]);
    const [toggleStates, setToggleStates] = useState({});
    const [status, setStatus] = useState('on');
  
    // Simulated API call function
    const fetchData = async (ids, newStatus) => {
      try {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Update toggle states
        const newToggleStates = { ...toggleStates };
        ids.forEach(id => {
          newToggleStates[id] = newStatus === 'on' ? 'Active' : 'Paused';
        });
        
        setToggleStates(newToggleStates);
      } catch (error) {
        console.error('Error updating status:', error);
      }
    };
  
    // Handle checkbox selection
    const handleSelectionChange = (id, isChecked) => {
      setSelectedIds(prev => 
        isChecked 
          ? [...prev, id]
          : prev.filter(item => item !== id)
      );
    };
  
    // Handle status change
    const handleStatusChange = (newStatus) => {
      setStatus(newStatus);
      if (selectedIds.length > 0) {
        fetchData(selectedIds, newStatus);
      }
    };
  
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center gap-4">
          <label className="font-medium">Status:</label>
          <select
            value={status}
            onChange={(e) => handleStatusChange(e.target.value)}
            className="border rounded p-2"
          >
            <option value="on">On</option>
            <option value="off">Off</option>
          </select>
        </div>
  
        <div className="grid grid-cols-2 gap-6">
          <ComponentA
            data={dataA}
            onSelectionChange={handleSelectionChange}
            selectedIds={selectedIds}
            toggleStates={toggleStates}
          />
          <ComponentB
            data={dataB}
            onSelectionChange={handleSelectionChange}
            selectedIds={selectedIds}
            toggleStates={toggleStates}
          />
        </div>
      </div>
    );
  };
  
  export default Component1;