"use client"

import * as React from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Search, Plus, Edit2, Trash2, Layers, CheckCircle2, XCircle } from "lucide-react"

import AdminDataTable, { type AdminTableColumn } from "@/components/admin/AdminDataTable"
import AdminPagination from "@/components/admin/AdminPagination"
import { adminApi } from "@/lib/admin/api"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Dialog, DialogTrigger } from "@/components/ui/dialog"
import CategoryForm from "@/components/admin/CategoryForm"

export default function AdminCategoriesPage() {
  const queryClient = useQueryClient()
  const [page, setPage] = React.useState(1)
  const [search, setSearch] = React.useState("")
  const [debouncedSearch, setDebouncedSearch] = React.useState("")
  const [isCreateOpen, setIsCreateOpen] = React.useState(false)
  const [editingCategory, setEditingCategory] = React.useState<any>(null)

  // Debounce search
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search)
      setPage(1)
    }, 500)
    return () => clearTimeout(timer)
  }, [search])

  const { data, isLoading, isError } = useQuery({
    queryKey: ["admin-categories", page, debouncedSearch],
    queryFn: () => adminApi.getCategories({ page, limit: 10, search: debouncedSearch }),
  })

  // Mutations
  const createMutation = useMutation({
    mutationFn: (values: any) =>
      adminApi.createCategory({
        title: { uz: values.titleUz, ru: values.titleRu },
        parentId: values.parentId,
        isActive: values.isActive,
        order: values.order,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-categories"] })
      setIsCreateOpen(false)
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, values }: { id: string; values: any }) =>
      adminApi.updateCategory(id, {
        title: { uz: values.titleUz, ru: values.titleRu },
        parentId: values.parentId,
        isActive: values.isActive,
        order: values.order,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-categories"] })
      setEditingCategory(null)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminApi.deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-categories"] })
    },
    onError: (error: any) => {
      alert(error.message || "O'chirishda xatolik yuz berdi. Bolalar kategoriyalari borligini tekshiring.")
    }
  })

  const categoryColumns: AdminTableColumn<any>[] = [
    {
      key: "title",
      header: "Kategoriya nomi",
      render: (row) => (
        <div className="flex flex-col">
          <span className="font-medium text-sm">{row.title?.uz}</span>
          <span className="text-xs text-muted-foreground">{row.title?.ru}</span>
        </div>
      ),
    },
    {
      key: "parentId",
      header: "Asosiy kategoriya",
      render: (row) => (
        <span className="text-sm">
          {row.parentId?.title?.uz || <span className="text-muted-foreground italic">Root</span>}
        </span>
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
            onClick={() => setEditingCategory(row)}
          >
            <Edit2 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-destructive"
            onClick={() => {
              if (confirm("Haqiqatan ham ushbu kategoriyani o'chirmoqchimisiz?")) {
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
          <h2 className="text-3xl font-bold tracking-tight">Kategoriyalar</h2>
          <p className="text-muted-foreground">
            Mahsulot kategoriyalarini boshqarish va daraxtsimon tuzilmani yaratish.
          </p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Kategoriya qo'shish
            </Button>
          </DialogTrigger>
          <CategoryForm
            categories={data?.categories || []}
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
                columns={categoryColumns}
                rows={data?.categories || []}
                getRowKey={(row) => row._id}
                emptyTitle="Kategoriyalar topilmadi"
                emptyDescription="Hali birorta ham kategoriya qo'shilmagan."
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
        open={!!editingCategory}
        onOpenChange={(open) => !open && setEditingCategory(null)}
      >
        {editingCategory && (
          <CategoryForm
            initialData={editingCategory}
            categories={data?.categories || []}
            onSubmit={(values) => updateMutation.mutate({ id: editingCategory._id, values })}
            isLoading={updateMutation.isPending}
          />
        )}
      </Dialog>
    </div>
  )
}
