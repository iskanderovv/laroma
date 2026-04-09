import { cn } from "@/lib/utils"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export interface AdminTableColumn<T> {
  key: string
  header: string
  className?: string
  render: (row: T) => React.ReactNode
}

export default function AdminDataTable<T>({
  columns,
  rows,
  getRowKey,
  emptyTitle,
  emptyDescription,
}: {
  columns: AdminTableColumn<T>[]
  rows: T[]
  getRowKey: (row: T) => string
  emptyTitle: string
  emptyDescription: string
}) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((column) => (
              <TableHead
                key={column.key}
                className={cn("px-4", column.className)}
              >
                {column.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.length > 0 ? (
            rows.map((row) => (
              <TableRow key={getRowKey(row)}>
                {columns.map((column) => (
                  <TableCell
                    key={column.key}
                    className={cn("align-middle", column.className)}
                  >
                    {column.render(row)}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell
                colSpan={columns.length}
                className="h-24 text-center"
              >
                <div className="flex flex-col items-center justify-center space-y-1">
                  <p className="text-sm font-medium">{emptyTitle}</p>
                  <p className="text-xs text-muted-foreground">
                    {emptyDescription}
                  </p>
                </div>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
