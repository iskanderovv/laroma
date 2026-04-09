"use client"

import * as React from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Search, Plus, Edit2, Trash2, CheckCircle2, XCircle } from "lucide-react"

import AdminDataTable, { type AdminTableColumn } from "@/components/admin/AdminDataTable"
import AdminPagination from "@/components/admin/AdminPagination"
import { adminApi } from "@/lib/admin/api"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Dialog, DialogTrigger } from "@/components/ui/dialog"
import BrandForm from "@/components/admin/BrandForm"

export default function AdminBrandsPage() {
  const queryClient = useQueryClient()
  const [page, setPage] = React.useState(1)
  const [search, setSearch] = React.useState("")
  const [debouncedSearch, setDebouncedSearch] = React.useState("")
  const [isCreateOpen, setIsCreateOpen] = React.useState(false)
  const [editingBrand, setEditingBrand] = React.useState<any>(null)

  // Debounce search
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search)
      setPage(1)
    }, 500)
    return () => clearTimeout(timer)
  }, [search])

  const { data, isLoading, isError } = useQuery({
    queryKey: ["admin-brands", page, debouncedSearch],
    queryFn: () => adminApi.getBrands({ page, limit: 10, search: debouncedSearch }),
  })

  // Mutations
  const createMutation = useMutation({
    mutationFn: (values: any) =>
      adminApi.createBrand({
        title: { uz: values.titleUz, ru: values.titleRu },
        isActive: values.isActive,
        order: values.order,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-brands"] })
      setIsCreateOpen(false)
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, values }: { id: string; values: any }) =>
      adminApi.updateBrand(id, {
        title: { uz: values.titleUz, ru: values.titleRu },
        isActive: values.isActive,
        order: values.order,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-brands"] })
      setEditingBrand(null)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminApi.deleteBrand(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-brands"] })
    },
    onError: (error: any) => {
      alert(error.message || "O'chirishda xatolik yuz berdi.")
    }
  })

  const brandColumns: AdminTableColumn<any>[] = [
    {
      key: "title",
      header: "Brend nomi",
      render: (row) => (
        <div className="flex flex-col">
          <span className="font-medium text-sm">{row.title?.uz}</span>
          <span className="text-xs text-muted-foreground">{row.title?.ru}</span>
        </div>
      ),
    },
    {
      key: "status",
      header: "Holati",
      render: (row) => (
        <Badge variant={row.isActive ? "default" : "secondary"} className="gap-1">
          {row.isActive ? (
            <>
              <CheckCircle2 className="h-3 w-3" /> Faol
            </>
          ) : (
            <>
              <XCircle className="h-3 w-3" /> Faol emas
            </>
          )}
        </Badge>
      ),
    },
    {
      key: "order",
      header: "Tartib",
      render: (row) => <span className="text-sm font-medium">{row.order}</span>,
    },
    {
      key: "actions",
      header: "Amallar",
      render: (row) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-blue-600"
            onClick={() => setEditingBrand(row)}
          >
            <Edit2 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-destructive"
            onClick={() => {
              if (confirm("Haqiqatan ham ushbu brendni o'chirmoqchimisiz?")) {
                deleteMutation.mutate(row._id)
              }
            }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ]

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Brendlar</h2>
          <p className="text-muted-foreground">
            Mahsulot brendlarini boshqarish.
          </p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Brend qo'shish
            </Button>
          </DialogTrigger>
          <BrandForm
            onSubmit={(values) => createMutation.mutate(values)}
            isLoading={createMutation.isPending}
          />
        </Dialog>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Nomi bo'yicha qidirish..."
                className="pl-8"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : (
            <>
              <AdminDataTable
                columns={brandColumns}
                rows={data?.brands || []}
                getRowKey={(row) => row._id}
                emptyTitle="Brendlar topilmadi"
                emptyDescription="Hali birorta ham brend qo'shilmagan."
              />
              <AdminPagination
                page={page}
                total={data?.total || 0}
                limit={10}
                onPageChange={setPage}
              />
            </>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog
        open={!!editingBrand}
        onOpenChange={(open) => !open && setEditingBrand(null)}
      >
        {editingBrand && (
          <BrandForm
            initialData={editingBrand}
            onSubmit={(values) => updateMutation.mutate({ id: editingBrand._id, values })}
            isLoading={updateMutation.isPending}
          />
        )}
      </Dialog>
    </div>
  )
}
