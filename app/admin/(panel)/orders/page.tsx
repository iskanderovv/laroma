"use client"

import * as React from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { CheckCircle2, ExternalLink, Loader2, PackageCheck, Truck, XCircle, Eye } from "lucide-react"

import { adminApi } from "@/lib/admin/api"
import type { AdminRecentOrder } from "@/lib/admin/types"
import AdminDataTable, { type AdminTableColumn } from "@/components/admin/AdminDataTable"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { fullUrl } from "@/lib/utils"
import AdminSurface from "@/components/admin/AdminSurface"

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("uz-UZ").format(amount)
}

function formatDate(value?: string) {
  if (!value) return "-"
  return new Date(value).toLocaleString("uz-UZ")
}

function getStatusBadge(status: string) {
  switch (status) {
    case "confirmed":
      return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">Tasdiqlangan</Badge>
    case "shipping":
      return <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100">Yetkazilmoqda</Badge>
    case "delivered":
      return <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Yetkazildi</Badge>
    case "cancelled":
      return <Badge variant="destructive">Bekor qilingan</Badge>
    default:
      return <Badge variant="secondary">Pending</Badge>
  }
}

function getPaymentReviewBadge(status?: string) {
  switch (status) {
    case "approved":
      return <Badge className="bg-green-100 text-green-700 hover:bg-green-100">To'lov tasdiqlangan</Badge>
    case "rejected":
      return <Badge variant="destructive">To'lov rad etilgan</Badge>
    default:
      return <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100">Chek tekshirilmoqda</Badge>
  }
}

export default function AdminOrdersPage() {
  const queryClient = useQueryClient()
  const [selectedOrder, setSelectedOrder] = React.useState<AdminRecentOrder | null>(null)

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["admin-orders"],
    queryFn: () => adminApi.getOrders(),
  })

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => adminApi.updateOrderStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] })
      queryClient.invalidateQueries({ queryKey: ["admin-dashboard-stats"] })
      queryClient.invalidateQueries({ queryKey: ["admin-dashboard-recent-orders"] })

      // Update selected order locally if dialog is open
      if (selectedOrder) {
        // Find updated order from list is best done after query refetch or just close dialog.
        // For simple UX we can just close the dialog or refetch and the list updates. 
        // We'll just close it to avoid complex state sync.
        setSelectedOrder(null)
      }
    },
  })

  const columns: AdminTableColumn<AdminRecentOrder>[] = [
    {
      key: "orderNumber",
      header: "ID",
      render: (row) => <span className="font-medium text-gray-900">{row.orderNumber}</span>,
    },
    {
      key: "customer",
      header: "Mijoz",
      render: (row) => (
        <div className="flex flex-col">
          <span className="text-sm font-medium">{row.deliveryDetails?.firstName} {row.deliveryDetails?.lastName || ""}</span>
          <span className="text-xs text-muted-foreground">{row.deliveryDetails?.phone}</span>
        </div>
      ),
    },
    {
      key: "status",
      header: "Holati",
      render: (row) => (
        <div className="flex flex-col gap-1 items-start">
          {getStatusBadge(row.status)}
          {row.paymentMethod === 'card' && getPaymentReviewBadge(row.paymentReviewStatus)}
        </div>
      ),
    },
    {
      key: "totalPrice",
      header: "Summa",
      render: (row) => <span className="font-semibold">{formatCurrency(row.totalPrice)} so'm</span>,
    },
    {
      key: "createdAt",
      header: "Vaqti",
      render: (row) => <span className="text-sm text-muted-foreground">{formatDate(row.createdAt)}</span>,
    },
    {
      key: "actions",
      header: "Amallar",
      render: (row) => (
        <Button
          variant="outline"
          size="sm"
          onClick={() => setSelectedOrder(row)}
        >
          <Eye className="mr-2 h-4 w-4" /> Batafsil
        </Button>
      ),
    },
  ]

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Buyurtmalar</h2>
        <p className="text-muted-foreground">
          Manual to'lov cheklarini ko'rib chiqing va buyurtmalarni keyingi bosqichga o'tkazing.
        </p>
      </div>

      <AdminSurface className="p-0 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-24 text-muted-foreground">
            <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Yuklanmoqda...
          </div>
        ) : orders.length === 0 ? (
          <div className="py-20 text-center text-muted-foreground">Buyurtmalar hali yo'q.</div>
        ) : (
          <AdminDataTable
            columns={columns}
            rows={orders}
            getRowKey={(row) => row._id}
            emptyTitle="Buyurtmalar topilmadi"
            emptyDescription="Hali hech kim buyurtma bermagan."
          />
        )}
      </AdminSurface>

      <Dialog open={!!selectedOrder} onOpenChange={(open) => !open && setSelectedOrder(null)}>
        {selectedOrder && (
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Buyurtma tafsilotlari - {selectedOrder.orderNumber}</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between pt-4">
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  {getStatusBadge(selectedOrder.status)}
                  {selectedOrder.paymentMethod === 'card' && getPaymentReviewBadge(selectedOrder.paymentReviewStatus)}
                </div>

                <div className="grid gap-2 text-sm text-gray-600 sm:grid-cols-2">
                  <p><span className="font-medium text-gray-900">Mijoz:</span> {selectedOrder.deliveryDetails.firstName} {selectedOrder.deliveryDetails.lastName || ""}</p>
                  <p><span className="font-medium text-gray-900">Telefon:</span> {selectedOrder.deliveryDetails.phone}</p>
                  <p><span className="font-medium text-gray-900">To'lov:</span> {selectedOrder.paymentMethod.toUpperCase()}</p>
                  <p><span className="font-medium text-gray-900">Yaratilgan:</span> {formatDate(selectedOrder.createdAt)}</p>
                  <p className="sm:col-span-2"><span className="font-medium text-gray-900">Manzil:</span> {selectedOrder.deliveryDetails.address}</p>
                  {selectedOrder.paymentSubmittedAt ? (
                    <p><span className="font-medium text-gray-900">Chek vaqti:</span> {formatDate(selectedOrder.paymentSubmittedAt)}</p>
                  ) : null}
                  {selectedOrder.notes ? (
                    <p className="sm:col-span-2"><span className="font-medium text-gray-900">Izoh:</span> {selectedOrder.notes}</p>
                  ) : null}
                </div>
              </div>

              <div className="rounded-2xl border border-black/5 bg-gray-50 p-4 lg:w-[220px]">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Jami summa</p>
                <p className="mt-1 text-2xl font-bold text-gray-900">{formatCurrency(selectedOrder.totalPrice)} so'm</p>
              </div>
            </div>

            <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_220px]">
              <div className="rounded-2xl border border-black/5 bg-white p-4">
                <p className="text-sm font-semibold text-gray-900">Mahsulotlar</p>
                <div className="mt-3 space-y-2">
                  {selectedOrder.items.map((item, index) => (
                    <div key={`${item.title?.uz || "mahsulot"}-${index}`} className="rounded-xl bg-gray-50 px-3 py-2 text-sm text-gray-700">
                      <span className="font-medium text-gray-900">{item.title?.uz || "Nomsiz mahsulot"}</span>
                      {item.selectedVolume ? ` · ${item.selectedVolume}` : ""}
                      {item.selectedScentLabel?.uz ? ` · ${item.selectedScentLabel.uz}` : ""}
                      {` · ${item.quantity} dona`}
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-black/5 bg-white p-4">
                <p className="text-sm font-semibold text-gray-900">To'lov cheki</p>
                {selectedOrder.paymentReceiptUrl ? (
                  <>
                    <div className="relative mt-3 h-40 overflow-hidden rounded-xl bg-gray-100 flex items-center justify-center">
                      <img
                        src={fullUrl(selectedOrder.paymentReceiptUrl)}
                        alt={selectedOrder.orderNumber}
                        className="object-cover w-full h-full"
                      />
                    </div>
                    <a
                      href={fullUrl(selectedOrder.paymentReceiptUrl)}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
                    >
                      Kattalashtirib ko'rish
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </>
                ) : (
                  <p className="mt-3 text-sm text-gray-500">Chek yuklanmagan.</p>
                )}
              </div>
            </div>

            <div className="mt-6 flex flex-wrap justify-end gap-2 border-t pt-4">
              {selectedOrder.status === "pending" && (
                <>
                  <Button
                    onClick={() => updateStatusMutation.mutate({ id: selectedOrder._id, status: "confirmed" })}
                    disabled={updateStatusMutation.isPending}
                    className="bg-primary"
                  >
                    <CheckCircle2 className="mr-2 h-4 w-4" /> Tasdiqlash
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => updateStatusMutation.mutate({ id: selectedOrder._id, status: "cancelled" })}
                    disabled={updateStatusMutation.isPending}
                  >
                    <XCircle className="mr-2 h-4 w-4" /> Rad etish
                  </Button>
                </>
              )}

              {selectedOrder.status === "confirmed" && (
                <Button
                  variant="outline"
                  onClick={() => updateStatusMutation.mutate({ id: selectedOrder._id, status: "shipping" })}
                  disabled={updateStatusMutation.isPending}
                >
                  <Truck className="mr-2 h-4 w-4" /> Yetkazishga o'tkazish
                </Button>
              )}

              {selectedOrder.status === "shipping" && (
                <Button
                  variant="outline"
                  onClick={() => updateStatusMutation.mutate({ id: selectedOrder._id, status: "delivered" })}
                  disabled={updateStatusMutation.isPending}
                >
                  <PackageCheck className="mr-2 h-4 w-4" /> Yetkazildi deb belgilash
                </Button>
              )}
            </div>
          </DialogContent>
        )}
      </Dialog>
    </div>
  )
}