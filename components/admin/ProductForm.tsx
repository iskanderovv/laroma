"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Plus, Trash2, Globe2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import ImageUploader from "./ImageUploader"

const productSchema = z.object({
  titleUz: z.string().min(2, "Nom (UZ) kamida 2 ta belgidan iborat bo'lishi kerak"),
  titleRu: z.string().min(2, "Nom (RU) kamida 2 ta belgidan iborat bo'lishi kerak"),
  descriptionUz: z.string().optional(),
  descriptionRu: z.string().optional(),
  price: z.number().min(0, "Narx manfiy bo'lishi mumkin emas"),
  oldPrice: z.number().optional().nullable(),
  categoryId: z.string().min(1, "Kategoriyani tanlang"),
  brandId: z.string().optional().nullable(),
  thumbnail: z.string().optional(),
  stock: z.number().default(0),
  isActive: z.boolean().default(true),
  isNew: z.boolean().default(false),
  isPopular: z.boolean().default(false),
  order: z.number().default(0),
  volume: z.string().optional(),
})

type ProductFormValues = z.input<typeof productSchema>

interface ProductFormProps {
  initialData?: any
  categories: any[]
  brands: any[]
  onSubmit: (data: ProductFormValues) => void
  isLoading?: boolean
}

export default function ProductForm({
  initialData,
  categories,
  brands,
  onSubmit,
  isLoading,
}: ProductFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: initialData
      ? {
          titleUz: initialData.title?.uz || "",
          titleRu: initialData.title?.ru || "",
          descriptionUz: initialData.description?.uz || "",
          descriptionRu: initialData.description?.ru || "",
          price: initialData.price || 0,
          oldPrice: initialData.oldPrice || null,
          categoryId: initialData.categoryId?._id || initialData.categoryId || "",
          brandId: initialData.brandId?._id || initialData.brandId || null,
          thumbnail: initialData.thumbnail || "",
          stock: initialData.stock || 0,
          isActive: initialData.isActive ?? true,
          isNew: initialData.isNew ?? false,
          isPopular: initialData.isPopular ?? false,
          order: initialData.order || 0,
          volume: initialData.volume || "",
        }
      : {
          titleUz: "",
          titleRu: "",
          price: 0,
          categoryId: "",
          isActive: true,
          isNew: true,
          stock: 10,
        },
  })

  const formValues = watch()

  return (
    <DialogContent className="sm:max-w-[850px] h-[90vh] p-0 flex flex-col overflow-hidden">
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col h-full overflow-hidden">
        <DialogHeader className="p-6 pb-4 px-8 border-b shrink-0">
          <DialogTitle className="text-2xl">
            {initialData ? "Mahsulotni tahrirlash" : "Yangi mahsulot qo'shish"}
          </DialogTitle>
          <DialogDescription>
            Mahsulot ma'lumotlarini kiriting va rasm yuklang.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1">
          <div className="p-8 pt-4 pb-12">
            <div className="grid gap-8 px-2"> {/* x o'qi bo'yicha padding */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="space-y-3">
                    <Label className="text-base font-semibold">Asosiy rasm (Thumbnail)</Label>
                    <ImageUploader
                      value={formValues.thumbnail}
                      onChange={(url) => setValue("thumbnail", url)}
                      onRemove={() => setValue("thumbnail", "")}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="price">Narxi (so'm)</Label>
                      <Input id="price" type="number" {...register("price", { valueAsNumber: true })} className="h-10" />
                      {errors.price && (
                        <p className="text-xs text-destructive">{errors.price.message}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="oldPrice">Eski narxi</Label>
                      <Input id="oldPrice" type="number" {...register("oldPrice", { valueAsNumber: true })} className="h-10" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="stock">Zaxira (soni)</Label>
                      <Input id="stock" type="number" {...register("stock", { valueAsNumber: true })} className="h-10" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="volume">Hajmi (masalan: 100ml)</Label>
                      <Input id="volume" {...register("volume")} className="h-10" />
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="titleUz">Nomi (UZ)</Label>
                      <Input id="titleUz" {...register("titleUz")} className="h-10" />
                      {errors.titleUz && (
                        <p className="text-xs text-destructive">{errors.titleUz.message}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="titleRu">Nomi (RU)</Label>
                      <Input id="titleRu" {...register("titleRu")} className="h-10" />
                      {errors.titleRu && (
                        <p className="text-xs text-destructive">{errors.titleRu.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Kategoriya</Label>
                    <Select
                      value={formValues.categoryId}
                      onValueChange={(val) => setValue("categoryId", val)}
                    >
                      <SelectTrigger className="h-10">
                        <SelectValue placeholder="Tanlang" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((c) => (
                          <SelectItem key={c._id} value={c._id}>
                            {c.title?.uz}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Brend</Label>
                    <Select
                      value={formValues.brandId || "none"}
                      onValueChange={(val) => setValue("brandId", val === "none" ? null : val)}
                    >
                      <SelectTrigger className="h-10">
                        <SelectValue placeholder="Tanlang" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Brendsiz</SelectItem>
                        {brands.map((b) => (
                          <SelectItem key={b._id} value={b._id}>
                            {b.title?.uz}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="descriptionUz">Tavsif (UZ)</Label>
                  <Textarea id="descriptionUz" {...register("descriptionUz")} rows={5} className="resize-none" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="descriptionRu">Tavsif (RU)</Label>
                  <Textarea id="descriptionRu" {...register("descriptionRu")} rows={5} className="resize-none" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 border p-6 rounded-xl bg-muted/30">
                <div className="flex items-center justify-between space-x-2">
                  <Label htmlFor="isActive" className="cursor-pointer">Sotuvda mavjud</Label>
                  <Switch
                    id="isActive"
                    checked={formValues.isActive}
                    onCheckedChange={(val) => setValue("isActive", val)}
                  />
                </div>
                <div className="flex items-center justify-between space-x-2">
                  <Label htmlFor="isNew" className="cursor-pointer">Yangi mahsulot</Label>
                  <Switch
                    id="isNew"
                    checked={formValues.isNew}
                    onCheckedChange={(val) => setValue("isNew", val)}
                  />
                </div>
                <div className="flex items-center justify-between space-x-2">
                  <Label htmlFor="isPopular" className="cursor-pointer">TOP mahsulot</Label>
                  <Switch
                    id="isPopular"
                    checked={formValues.isPopular}
                    onCheckedChange={(val) => setValue("isPopular", val)}
                  />
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>

        <DialogFooter className="p-6 px-8 border-t shrink-0 bg-background">
          <Button type="submit" disabled={isLoading} className="w-full sm:w-auto h-11 px-10 text-base font-semibold">
            {isLoading ? "Saqlanmoqda..." : "Mahsulotni saqlash"}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  )
}
