"use client"

import * as React from "react"
import { useQuery } from "@tanstack/react-query"
import { Search, UserPlus, Mail, Phone, Calendar, ShieldCheck } from "lucide-react"

import AdminDataTable, { type AdminTableColumn } from "@/components/admin/AdminDataTable"
import AdminPagination from "@/components/admin/AdminPagination"
import { adminApi } from "@/lib/admin/api"
import type { AdminUser } from "@/lib/admin/types"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

function formatDate(date?: string) {
  if (!date) return "-"
  return new Intl.DateTimeFormat("uz-UZ", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(date))
}

const userColumns: AdminTableColumn<AdminUser>[] = [
  {
    key: "name",
    header: "Foydalanuvchi",
    render: (row) => (
      <div className="flex flex-col">
        <span className="font-medium">{row.firstName} {row.lastName || ""}</span>
        <span className="text-xs text-muted-foreground">@{row.username || "username_yo'q"}</span>
      </div>
    ),
  },
  {
    key: "phone",
    header: "Telefon",
    render: (row) => (
      <div className="flex items-center gap-2">
        <Phone className="h-3 w-3 text-muted-foreground" />
        <span className="text-sm">{row.phone}</span>
      </div>
    ),
  },
  {
    key: "role",
    header: "Rol",
    render: (row) => (
      <Badge variant={row.role === "admin" ? "default" : "secondary"} className="capitalize">
        {row.role === "admin" ? <ShieldCheck className="mr-1 h-3 w-3" /> : null}
        {row.role}
      </Badge>
    ),
  },
  {
    key: "createdAt",
    header: "Ro'yxatdan o'tgan",
    render: (row) => (
      <div className="flex items-center gap-2 text-muted-foreground">
        <Calendar className="h-3 w-3" />
        <span className="text-sm">{formatDate(row.createdAt)}</span>
      </div>
    ),
  },
]

export default function AdminUsersPage() {
  const [page, setPage] = React.useState(1)
  const [search, setSearch] = React.useState("")
  const [debouncedSearch, setDebouncedSearch] = React.useState("")

  // Debounce search input
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search)
      setPage(1) // Reset to first page on search
    }, 500)
    return () => clearTimeout(timer)
  }, [search])

  const { data, isLoading, isError } = useQuery({
    queryKey: ["admin-users", page, debouncedSearch],
    queryFn: () => adminApi.getUsers({ page, limit: 10, search: debouncedSearch }),
  })

  if (isError) {
    return (
      <div className="p-8 text-center text-destructive">
        Foydalanuvchilarni yuklashda xatolik yuz berdi.
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Foydalanuvchilar</h2>
          <p className="text-muted-foreground">
            Tizimdagi barcha foydalanuvchilar ro'yxati va ularni boshqarish.
          </p>
        </div>
        <Button>
          <UserPlus className="mr-2 h-4 w-4" /> Foydalanuvchi qo'shish
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Ism, telefon yoki email bo'yicha qidirish..."
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
                columns={userColumns}
                rows={data?.users || []}
                getRowKey={(row) => row._id}
                emptyTitle="Foydalanuvchilar topilmadi"
                emptyDescription="Qidiruv mezonlariga mos keladigan foydalanuvchilar mavjud emas."
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
    </div>
  )
}
