"use client"

import * as React from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Search, Plus, Edit2, Trash2, Image as ImageIcon, CheckCircle2, XCircle, Link as LinkIcon } from "lucide-react"

import AdminDataTable, { type AdminTableColumn } from "@/components/admin/AdminDataTable"
import AdminPagination from "@/components/admin/AdminPagination"
import { adminApi } from "@/lib/admin/api"
import { fullUrl } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Dialog, DialogTrigger } from "@/components/ui/dialog"
import BannerForm from "@/components/admin/BannerForm"

export default function AdminBannersPage() {
  const queryClient = useQueryClient()
  const [page, setPage] = React.useState(1)
  const [isCreateOpen, setIsCreateOpen] = React.useState(false)
  const [editingBanner, setEditingBanner] = React.useState<any>(null)

  const { data, isLoading, isError } = useQuery({
    queryKey: ["admin-banners", page],
    queryFn: () => adminApi.getBanners({ page, limit: 10 }),
  })

  // Mutations
  const createMutation = useMutation({
    mutationFn: (values: any) =>
      adminApi.createBanner({
        title: { uz: values.titleUz, ru: values.titleRu },
        image: values.imageUrl,
        linkType: values.linkType,
        linkId: values.linkId,
        type: values.type,
        isActive: values.isActive,
        order: values.order,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-banners"] })
      setIsCreateOpen(false)
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, values }: { id: string; values: any }) =>
      adminApi.updateBanner(id, {
        title: { uz: values.titleUz, ru: values.titleRu },
        image: values.imageUrl,
        linkType: values.linkType,
        linkId: values.linkId,
        type: values.type,
        isActive: values.isActive,
        order: values.order,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-banners"] })
      setEditingBanner(null)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminApi.deleteBanner(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-banners"] })
    },
  })

  const bannerColumns: AdminTableColumn<any>[] = [
    {
      key: "banner",
      header: "Banner",
      render: (row) => (
        <div className="flex items-center gap-4">
          <div className="h-16 w-32 rounded border bg-muted flex items-center justify-center overflow-hidden shrink-0 shadow-sm">
            {row.image ? (
              <img src={fullUrl(row.image)} alt="" className="h-full w-full object-cover" />
            ) : (
              <ImageIcon className="h-6 w-6 text-muted-foreground" />
            )}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-medium text-sm truncate">{row.title?.uz || "Sarlavhasiz"}</span>
            <div className="flex items-center gap-1 text-[10px] text-muted-foreground uppercase">
              <Badge variant="outline" className="text-[10px] h-4 px-1">{row.type}</Badge>
              {row.linkType !== "none" && (
                <span className="flex items-center gap-0.5 truncate max-w-[150px]">
                  <LinkIcon className="h-3 w-3" /> {row.linkType} : {row.linkId}
                </span>
              )}
            </div>
          </div>
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
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-blue-600"
            onClick={() => setEditingBanner(row)}
          >
            <Edit2 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-destructive"
            onClick={() => {
              if (confirm("Haqiqatan ham ushbu bannerni o'chirmoqchimisiz?")) {
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
          <h2 className="text-3xl font-bold tracking-tight">Bannerlar</h2>
          <p className="text-muted-foreground">
            Asosiy sahifa va boshqa bo'limlar uchun reklama bannerlarini boshqarish.
          </p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Banner qo'shish
            </Button>
          </DialogTrigger>
          <BannerForm
            onSubmit={(values) => createMutation.mutate(values)}
            isLoading={createMutation.isPending}
          />
        </Dialog>
      </div>

      <Card>
        <CardContent className="pt-6 flex flex-col gap-4">
          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-24 w-full" />
              ))}
            </div>
          ) : (
            <>
              <AdminDataTable
                columns={bannerColumns}
                rows={data?.banners || []}
                getRowKey={(row) => row._id}
                emptyTitle="Bannerlar topilmadi"
                emptyDescription="Hali birorta ham reklama banneri qo'shilmagan."
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
        open={!!editingBanner}
        onOpenChange={(open) => !open && setEditingBanner(null)}
      >
        {editingBanner && (
          <BannerForm
            initialData={editingBanner}
            onSubmit={(values) => updateMutation.mutate({ id: editingBanner._id, values })}
            isLoading={updateMutation.isPending}
          />
        )}
      </Dialog>
    </div>
  )
}
