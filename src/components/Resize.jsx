import React, { useState } from 'react';
import { ResizableBox } from 'react-resizable';
import 'react-resizable/css/styles.css';

const data = [
    { col1: 'Row 1, Col 1', col2: 'Row 1, Col 2', col3: 'Row 1, Col 3', col4: 'Row 1, Col 4' },
    { col1: 'Row 2, Col 1', col2: 'Row 2, Col 2', col3: 'Row 2, Col 3', col4: 'Row 2, Col 4' },
  ];
export function ResizableTable() {
  const [columnWidths, setColumnWidths] = useState([100, 150, 200, 100]); // Default widths
  const [rowHeights, setRowHeights] = useState(new Array(data?.length).fill(50)); // Default heights

  const handleColumnResize = (index, newWidth) => {
    setColumnWidths((prevWidths) => {
      const updatedWidths = [...prevWidths];
      updatedWidths[index] = newWidth;
      return updatedWidths;
    });
  };

  const handleRowResize = (index, newHeight) => {
    setRowHeights((prevHeights) => {
      const updatedHeights = [...prevHeights];
      updatedHeights[index] = newHeight;
      return updatedHeights;
    });
  };

  return (
    <div className="overflow-auto">
      <table className="table-auto border-collapse border border-gray-300">
        <thead>
          <tr>
            {['Column 1', 'Column 2', 'Column 3', 'Column 4'].map((header, index) => (
              <th key={index} className="border border-gray-300 p-2">
                <ResizableBox
                  width={columnWidths[index]}
                  height={20}
                  axis="x"
                  resizeHandles={['e']}
                  minConstraints={[50, 20]}
                  maxConstraints={[500, 20]}
                  onResizeStop={(e, { size }) => handleColumnResize(index, size.width)}
                >
                  <div style={{ width: columnWidths[index], textAlign: 'center' }}>{header}</div>
                </ResizableBox>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {Object.values(row).map((cell, colIndex) => (
                <td
                  key={colIndex}
                  className="border border-gray-300 p-2"
                  style={{ width: columnWidths[colIndex] }}
                >
                  <ResizableBox
                    width={columnWidths[colIndex]}
                    height={rowHeights[rowIndex]}
                    axis="y"
                    resizeHandles={['s']}
                    minConstraints={[columnWidths[colIndex], 30]}
                    maxConstraints={[columnWidths[colIndex], 200]}
                    onResizeStop={(e, { size }) => handleRowResize(rowIndex, size.height)}
                  >
                    <div
                      style={{
                        width: columnWidths[colIndex],
                        height: rowHeights[rowIndex],
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {cell}
                    </div>
                  </ResizableBox>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
