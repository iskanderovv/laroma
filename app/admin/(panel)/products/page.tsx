"use client"

import * as React from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Search, Plus, Edit2, Trash2, Package, CheckCircle2, XCircle, Star, Image as ImageIcon } from "lucide-react"

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
import ProductForm from "@/components/admin/ProductForm"

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("uz-UZ").format(amount)
}

export default function AdminProductsPage() {
  const queryClient = useQueryClient()
  const [page, setPage] = React.useState(1)
  const [search, setSearch] = React.useState("")
  const [debouncedSearch, setDebouncedSearch] = React.useState("")
  const [isCreateOpen, setIsCreateOpen] = React.useState(false)
  const [editingProduct, setEditingCategory] = React.useState<any>(null)

  // Debounce search
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search)
      setPage(1)
    }, 500)
    return () => clearTimeout(timer)
  }, [search])

  const { data: productsData, isLoading: isProductsLoading } = useQuery({
    queryKey: ["admin-products", page, debouncedSearch],
    queryFn: () => adminApi.getProducts({ page, limit: 10, search: debouncedSearch }),
  })

  const { data: categoriesData } = useQuery({
    queryKey: ["admin-categories-all"],
    queryFn: () => adminApi.getCategories({ limit: 100 }),
  })

  const { data: brandsData } = useQuery({
    queryKey: ["admin-brands-all"],
    queryFn: () => adminApi.getBrands({ limit: 100 }),
  })

  // Mutations
  const createMutation = useMutation({
    mutationFn: (values: any) =>
      adminApi.createProduct({
        title: { uz: values.titleUz, ru: values.titleRu },
        description: { uz: values.descriptionUz, ru: values.descriptionRu },
        price: values.price,
        oldPrice: values.oldPrice,
        categoryId: values.categoryId,
        brandId: values.brandId,
        thumbnail: values.thumbnail,
        stock: values.stock,
        isActive: values.isActive,
        isNew: values.isNew,
        isPopular: values.isPopular,
        order: values.order,
        volume: values.volume,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-products"] })
      setIsCreateOpen(false)
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, values }: { id: string; values: any }) =>
      adminApi.updateProduct(id, {
        title: { uz: values.titleUz, ru: values.titleRu },
        description: { uz: values.descriptionUz, ru: values.descriptionRu },
        price: values.price,
        oldPrice: values.oldPrice,
        categoryId: values.categoryId,
        brandId: values.brandId,
        thumbnail: values.thumbnail,
        stock: values.stock,
        isActive: values.isActive,
        isNew: values.isNew,
        isPopular: values.isPopular,
        order: values.order,
        volume: values.volume,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-products"] })
      setEditingCategory(null)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminApi.deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-products"] })
    },
  })

  const productColumns: AdminTableColumn<any>[] = [
    {
      key: "product",
      header: "Mahsulot",
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded border bg-muted flex items-center justify-center overflow-hidden shrink-0">
            {row.thumbnail ? (
              <img src={fullUrl(row.thumbnail)} alt="" className="h-full w-full object-cover" />
            ) : (
              <ImageIcon className="h-5 w-5 text-muted-foreground" />
            )}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-medium text-sm truncate">{row.title?.uz}</span>
            <span className="text-[10px] text-muted-foreground uppercase truncate">
              {row.categoryId?.title?.uz || "Kategoriyasiz"}
            </span>
          </div>
        </div>
      ),
    },
    {
      key: "price",
      header: "Narxi",
      render: (row) => (
        <div className="flex flex-col">
          <span className="text-sm font-semibold">{formatCurrency(row.price)}</span>
          {row.oldPrice && (
            <span className="text-[10px] text-muted-foreground line-through">
              {formatCurrency(row.oldPrice)}
            </span>
          )}
        </div>
      ),
    },
    {
      key: "stock",
      header: "Soni",
      render: (row) => (
        <Badge variant={row.stock > 0 ? "outline" : "destructive"}>
          {row.stock} dona
        </Badge>
      ),
    },
    {
      key: "status",
      header: "Holati",
      render: (row) => (
        <div className="flex flex-wrap gap-1">
          {row.isActive ? (
            <Badge variant="default" className="text-[10px] h-5 px-1.5">Faol</Badge>
          ) : (
            <Badge variant="secondary" className="text-[10px] h-5 px-1.5">Nofaol</Badge>
          )}
          {row.isNew && <Badge variant="outline" className="text-[10px] h-5 px-1.5 border-green-500 text-green-600">Yangi</Badge>}
          {row.isPopular && <Badge variant="outline" className="text-[10px] h-5 px-1.5 border-amber-500 text-amber-600">TOP</Badge>}
        </div>
      ),
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
            onClick={() => setEditingCategory(row)}
          >
            <Edit2 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-destructive"
            onClick={() => {
              if (confirm("Haqiqatan ham ushbu mahsulotni o'chirmoqchimisiz?")) {
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
          <h2 className="text-3xl font-bold tracking-tight">Mahsulotlar</h2>
          <p className="text-muted-foreground">
            Katalogdagi barcha mahsulotlarni boshqarish va yangilarini qo'shish.
          </p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Mahsulot qo'shish
            </Button>
          </DialogTrigger>
          <ProductForm
            categories={categoriesData?.categories || []}
            brands={brandsData?.brands || []}
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
                placeholder="Nomi yoki artikul bo'yicha qidirish..."
                className="pl-8"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {isProductsLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : (
            <>
              <AdminDataTable
                columns={productColumns}
                rows={productsData?.products || []}
                getRowKey={(row) => row._id}
                emptyTitle="Mahsulotlar topilmadi"
                emptyDescription="Hali birorta ham mahsulot qo'shilmagan."
              />
              <AdminPagination
                page={page}
                total={productsData?.total || 0}
                limit={10}
                onPageChange={setPage}
              />
            </>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog
        open={!!editingProduct}
        onOpenChange={(open) => !open && setEditingCategory(null)}
      >
        {editingProduct && (
          <ProductForm
            initialData={editingProduct}
            categories={categoriesData?.categories || []}
            brands={brandsData?.brands || []}
            onSubmit={(values) => updateMutation.mutate({ id: editingProduct._id, values })}
            isLoading={updateMutation.isPending}
          />
        )}
      </Dialog>
    </div>
  )
}
