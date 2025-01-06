import React, { useState } from 'react'

const DashboardBarDropdown = () => {
    const [selectedColumns, setSelectedColumns] = useState({
        results: false,
        reach: false,
      });
    
      const handleCheckboxChange = (column) => {
        setSelectedColumns((prev) => ({
          ...prev,
          [column]: !prev[column],
        }));
      };
  return (
    <div>DashboardBarDropdown</div>
  )
}

export default DashboardBarDropdown