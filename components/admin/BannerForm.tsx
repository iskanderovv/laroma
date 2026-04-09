"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import ImageUploader from "./ImageUploader"

const bannerSchema = z.object({
  titleUz: z.string().optional(),
  titleRu: z.string().optional(),
  imageUrl: z.string().min(1, "Rasm yuklash shart"),
  linkType: z.enum(["none", "category", "product"]).default("none"),
  linkId: z.string().optional(),
  type: z.enum(["hero", "middle"]).default("hero"),
  isActive: z.boolean().default(true),
  order: z.number().default(0),
})

type BannerFormValues = z.input<typeof bannerSchema>

interface BannerFormProps {
  initialData?: any
  onSubmit: (data: BannerFormValues) => void
  isLoading?: boolean
}

export default function BannerForm({
  initialData,
  onSubmit,
  isLoading,
}: BannerFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<BannerFormValues>({
    resolver: zodResolver(bannerSchema),
    defaultValues: {
      titleUz: initialData?.title?.uz || "",
      titleRu: initialData?.title?.ru || "",
      imageUrl: initialData?.image || "",
      linkType: initialData?.linkType || "none",
      linkId: initialData?.linkId || "",
      type: initialData?.type || "hero",
      isActive: initialData?.isActive ?? true,
      order: initialData?.order || 0,
    },
  })

  const formValues = watch()

  return (
    <DialogContent className="sm:max-w-[500px]">
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogHeader>
          <DialogTitle>
            {initialData ? "Bannerni tahrirlash" : "Yangi banner qo'shish"}
          </DialogTitle>
          <DialogDescription>
            Banner ma'lumotlarini kiriting va rasm yuklang.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label>Banner rasmi</Label>
            <ImageUploader
              value={formValues.imageUrl}
              onChange={(url) => setValue("imageUrl", url)}
              onRemove={() => setValue("imageUrl", "")}
            />
            {errors.imageUrl && (
              <p className="text-xs text-destructive">{errors.imageUrl.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="titleUz">Sarlavha (UZ)</Label>
              <Input id="titleUz" {...register("titleUz")} placeholder="Ixtiyoriy" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="titleRu">Sarlavha (RU)</Label>
              <Input id="titleRu" {...register("titleRu")} placeholder="Ixtiyoriy" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Banner turi (Joylashuvi)</Label>
              <Select
                value={formValues.type}
                onValueChange={(val: any) => setValue("type", val)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Turini tanlang" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hero">Asosiy (Hero)</SelectItem>
                  <SelectItem value="middle">O'rta (Middle)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Link turi</Label>
              <Select
                value={formValues.linkType}
                onValueChange={(val: any) => setValue("linkType", val)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Link turini tanlang" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Yo'q (None)</SelectItem>
                  <SelectItem value="category">Kategoriya</SelectItem>
                  <SelectItem value="product">Mahsulot</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="linkId">Yo'naltirish IDsi (Kategoriya/Mahsulot)</Label>
              <Input id="linkId" {...register("linkId")} placeholder="ID kiriting" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="order">Tartib raqami</Label>
              <Input id="order" type="number" {...register("order", { valueAsNumber: true })} />
            </div>
          </div>

          <div className="flex items-center space-x-2 pt-2">
            <Switch
              id="isActive"
              checked={formValues.isActive}
              onCheckedChange={(val) => setValue("isActive", val)}
            />
            <Label htmlFor="isActive">Faol holatda</Label>
          </div>
        </div>
        <DialogFooter>
          <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
            {isLoading ? "Saqlanmoqda..." : "Saqlash"}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  )
}
