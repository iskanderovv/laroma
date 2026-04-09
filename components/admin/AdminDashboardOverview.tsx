"use client"

import * as React from "react"
import { useQuery } from "@tanstack/react-query"
import {
  ShoppingBag,
  Users,
  Package,
  ArrowUpRight,
  TrendingUp,
  Clock,
  ChevronRight,
  Layers,
  Heart,
  BarChart3,
  PieChart as PieChartIcon
} from "lucide-react"
import Link from "next/link"
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

import AdminDataTable, {
  type AdminTableColumn,
} from "@/components/admin/AdminDataTable"
import { adminApi } from "@/lib/admin/api"
import type { AdminRecentOrder, AdminTopProduct } from "@/lib/admin/types"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("uz-UZ").format(amount)
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("uz-UZ", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date))
}

const statusLabel: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  pending: { label: "Kutilmoqda", variant: "secondary" },
  confirmed: { label: "Tasdiqlangan", variant: "default" },
  shipping: { label: "Yetkazilmoqda", variant: "outline" },
  delivered: { label: "Yetkazilgan", variant: "outline" },
  cancelled: { label: "Bekor qilingan", variant: "destructive" },
}

const topProductColumns: AdminTableColumn<AdminTopProduct>[] = [
  {
    key: "title",
    header: "Mahsulot",
    render: (row) => (
      <div className="flex flex-col">
        <span className="font-medium">{row.title?.uz || "Nomsiz"}</span>
        <span className="text-[10px] text-muted-foreground uppercase">
          ID: {row._id.slice(-6)}
        </span>
      </div>
    ),
  },
  {
    key: "totalSold",
    header: "Sotilgan",
    render: (row) => <span className="font-medium">{row.totalSold} dona</span>,
  },
  {
    key: "revenue",
    header: "Tushum",
    render: (row) => (
      <span className="font-semibold text-primary">
        {formatCurrency(row.revenue)}
      </span>
    ),
  },
]

const recentOrderColumns: AdminTableColumn<AdminRecentOrder>[] = [
  {
    key: "orderNumber",
    header: "Buyurtma",
    render: (row) => (
      <div className="flex flex-col">
        <span className="font-medium">#{row.orderNumber}</span>
        <span className="text-xs text-muted-foreground">
          {formatDate(row.createdAt)}
        </span>
      </div>
    ),
  },
  {
    key: "customer",
    header: "Mijoz",
    render: (row) => (
      <div className="flex flex-col">
        <span className="text-sm">
          {row.userId?.firstName || row.deliveryDetails.firstName}
        </span>
        <span className="text-xs text-muted-foreground">
          {row.deliveryDetails.phone}
        </span>
      </div>
    ),
  },
  {
    key: "status",
    header: "Holat",
    render: (row) => {
      const status = statusLabel[row.status] || { label: row.status, variant: "secondary" }
      return <Badge variant={status.variant}>{status.label}</Badge>
    },
  },
  {
    key: "totalPrice",
    header: "Summa",
    render: (row) => (
      <span className="font-semibold">{formatCurrency(row.totalPrice)}</span>
    ),
  },
]

function DashboardSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <Skeleton className="h-4 w-[100px]" />
            <Skeleton className="h-4 w-4 rounded-full" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-[60px]" />
            <Skeleton className="mt-1 h-3 w-[120px]" />
          </CardContent>
        </Card>
      ))}
      <div className="col-span-full grid gap-4 lg:grid-cols-7">
        <Card className="col-span-full lg:col-span-4">
          <CardHeader>
            <Skeleton className="h-5 w-[150px]" />
            <Skeleton className="mt-1 h-4 w-[250px]" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[300px] w-full" />
          </CardContent>
        </Card>
        <Card className="col-span-full lg:col-span-3">
          <CardHeader>
            <Skeleton className="h-5 w-[150px]" />
            <Skeleton className="mt-1 h-4 w-[200px]" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[300px] w-full" />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function AdminDashboardOverview() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["admin-dashboard-overview"],
    queryFn: async () => {
      const [stats, topProducts, recentOrders, analytics] = await Promise.all([
        adminApi.getDashboardStats(),
        adminApi.getTopProducts(6),
        adminApi.getRecentOrders(6),
        adminApi.getDashboardAnalytics(),
      ])

      return { stats, topProducts, recentOrders, analytics }
    },
  })

  if (isLoading) return <DashboardSkeleton />

  if (isError || !data || !data.analytics) {
    return (
      <div className="flex h-[450px] items-center justify-center rounded-lg border border-dashed">
        <div className="text-center">
          <p className="text-lg font-medium">Ma'lumot yuklashda xato yuz berdi</p>
          <p className="text-sm text-muted-foreground">Backend bilan aloqani tekshiring yoki kuting</p>
          <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>
            Qayta urinish
          </Button>
        </div>
      </div>
    )
  }

  const { stats, topProducts, recentOrders, analytics } = data

  const statCards = [
    {
      title: "Jami Buyurtmalar",
      value: stats.totalOrders,
      description: `${stats.pendingOrders} ta kutilmoqda`,
      icon: ShoppingBag,
    },
    {
      title: "Mijozlar",
      value: stats.totalUsers,
      description: "Faol foydalanuvchilar",
      icon: Users,
    },
    {
      title: "Mahsulotlar",
      value: stats.totalProducts,
      description: "Sotuvdagi mahsulotlar",
      icon: Package,
    },
    {
      title: "Bugun",
      value: stats.todayOrders,
      description: `${formatCurrency(stats.todayRevenue)} so'm tushum`,
      icon: TrendingUp,
      primary: true,
    },
  ]

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#a855f7', '#ec4899', '#f43f5e', '#8b5cf6'];

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Xush kelibsiz!</h2>
        <p className="text-muted-foreground">
          Do'koningizning bugungi holati va asosiy ko'rsatkichlari.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => (
          <Card key={card.title} className={card.primary ? "border-primary/50 shadow-sm" : ""}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
              <card.icon className={card.primary ? "h-4 w-4 text-primary" : "h-4 w-4 text-muted-foreground"} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
              <p className="text-xs text-muted-foreground">{card.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-7">
        <Card className="col-span-full lg:col-span-4">
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="grid gap-1">
              <CardTitle>Sotuvlar dinamikasi</CardTitle>
              <CardDescription>Oxirgi 30 kundagi tushumlar grafigi.</CardDescription>
            </div>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="h-[320px] w-full pb-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={analytics.salesData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                <XAxis 
                  dataKey="date" 
                  tickLine={false} 
                  axisLine={false} 
                  tickFormatter={(val) => val.slice(5)} 
                  fontSize={12} 
                />
                <YAxis 
                  yAxisId="left" 
                  tickLine={false} 
                  axisLine={false} 
                  tickFormatter={(val) => `${(val / 1000).toFixed(0)}k`} 
                  fontSize={12} 
                  width={60}
                />
                <Tooltip 
                  formatter={(value: number) => [`${formatCurrency(value)} so'm`, 'Tushum']}
                  labelFormatter={(label) => `Sana: ${label}`}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Line 
                  yAxisId="left" 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#2563eb" 
                  strokeWidth={3} 
                  dot={false} 
                  activeDot={{ r: 6, fill: "#2563eb" }} 
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="col-span-full lg:col-span-3">
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="grid gap-1">
              <CardTitle>Kategoriyalar tahlili</CardTitle>
              <CardDescription>Barcha mahsulotlarning toifalarga bo'linishi.</CardDescription>
            </div>
            <PieChartIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="h-[320px] flex items-center justify-center pb-4">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={analytics.categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                  nameKey="name"
                >
                  {analytics.categoryData.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number) => [`${value} ta mahsulot`, 'Soni']}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-7">
        <Card className="col-span-full lg:col-span-4">
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="grid gap-1">
              <CardTitle>So'nggi buyurtmalar</CardTitle>
              <CardDescription>
                Yaqinda amalga oshirilgan 6 ta buyurtma.
              </CardDescription>
            </div>
            <Button asChild variant="outline" size="sm">
              <Link href="/admin/orders">
                Hammasini ko'rish <ChevronRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <AdminDataTable
              columns={recentOrderColumns}
              rows={recentOrders}
              getRowKey={(row) => row._id}
              emptyTitle="Buyurtmalar mavjud emas"
              emptyDescription="Hozircha hech qanday buyurtma berilmagan."
            />
          </CardContent>
        </Card>

        <Card className="col-span-full lg:col-span-3">
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="grid gap-1">
              <CardTitle>TOP Mahsulotlar</CardTitle>
              <CardDescription>Eng ko'p sotilgan mahsulotlar.</CardDescription>
            </div>
            <TrendingUp className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <AdminDataTable
              columns={topProductColumns}
              rows={topProducts}
              getRowKey={(row) => row._id}
              emptyTitle="Ma'lumot yo'q"
              emptyDescription="Eng ko'p sotilgan mahsulotlar ro'yxati hali shakllanmagan."
            />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="grid gap-1">
              <CardTitle>Yangi Kategoriyalar</CardTitle>
              <CardDescription>So'nggi qo'shilgan 5 ta kategoriya.</CardDescription>
            </div>
            <Layers className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.recentCategories?.map((cat: any) => (
                <div key={cat._id} className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm uppercase">
                      {cat.title?.uz?.charAt(0) || 'C'}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold">{cat.title?.uz || 'Nomsiz'}</span>
                      <span className="text-xs text-muted-foreground">{cat.isActive ? 'Faol kategoriya' : 'Nofaol kategoriya'}</span>
                    </div>
                  </div>
                  <Badge variant="secondary" className="font-medium">Tartib: {cat.order}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="grid gap-1">
              <CardTitle>Yangi Brendlar</CardTitle>
              <CardDescription>So'nggi qo'shilgan 5 ta brend.</CardDescription>
            </div>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.recentBrands?.map((brand: any) => (
                <div key={brand._id} className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-pink-100 flex items-center justify-center text-pink-600 font-bold text-sm uppercase">
                      {brand.title?.uz?.charAt(0) || 'B'}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold">{brand.title?.uz || 'Nomsiz'}</span>
                      <span className="text-xs text-muted-foreground">{brand.isActive ? 'Faol brend' : 'Nofaol brend'}</span>
                    </div>
                  </div>
                  <Badge variant="secondary" className="font-medium">Tartib: {brand.order}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
