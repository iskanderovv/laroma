import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react"

interface AdminPaginationProps {
  page: number
  total: number
  limit: number
  onPageChange: (page: number) => void
}

export default function AdminPagination({
  page,
  total,
  limit,
  onPageChange,
}: AdminPaginationProps) {
  const totalPages = Math.ceil(total / limit)

  if (totalPages <= 1) return null

  return (
    <div className="flex items-center justify-between px-2">
      <div className="flex-1 text-sm text-muted-foreground">
        Jami {total} tadan {Math.min((page - 1) * limit + 1, total)}-{Math.min(page * limit, total)} ko'rsatilmoqda
      </div>
      <div className="flex items-center space-x-6 lg:space-x-8">
        <div className="flex items-center space-x-2">
          <p className="text-sm font-medium">Sahifa {page} / {totalPages}</p>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              className="hidden h-8 w-8 p-0 lg:flex"
              onClick={() => onPageChange(1)}
              disabled={page === 1}
            >
              <span className="sr-only">Birinchi sahifa</span>
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => onPageChange(page - 1)}
              disabled={page === 1}
            >
              <span className="sr-only">Oldingi sahifa</span>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => onPageChange(page + 1)}
              disabled={page === totalPages}
            >
              <span className="sr-only">Keyingi sahifa</span>
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="hidden h-8 w-8 p-0 lg:flex"
              onClick={() => onPageChange(totalPages)}
              disabled={page === totalPages}
            >
              <span className="sr-only">Oxirgi sahifa</span>
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
