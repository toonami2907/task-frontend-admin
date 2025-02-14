import { Table } from "@/components/ui/table"

export const ResizableTable = ({ children, className }) => {
  return (
    <div className="overflow-auto">
      <Table className={`${className}  resizable-table table-fixed`}>
        {children}
      </Table>
    </div>
  )
}
