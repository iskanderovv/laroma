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

const categorySchema = z.object({
  titleUz: z.string().min(2, "O'zbekcha nom kamida 2 ta belgidan iborat bo'lishi kerak"),
  titleRu: z.string().min(2, "Ruscha nom kamida 2 ta belgidan iborat bo'lishi kerak"),
  parentId: z.string().optional().nullable(),
  isActive: z.boolean().default(true),
  order: z.number().default(0),
})

type CategoryFormValues = z.input<typeof categorySchema>

interface CategoryFormProps {
  initialData?: any
  categories: any[]
  onSubmit: (data: CategoryFormValues) => void
  isLoading?: boolean
}

export default function CategoryForm({
  initialData,
  categories,
  onSubmit,
  isLoading,
}: CategoryFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: initialData
      ? {
          titleUz: initialData.title?.uz || "",
          titleRu: initialData.title?.ru || "",
          parentId: initialData.parentId?._id || initialData.parentId || null,
          isActive: initialData.isActive ?? true,
          order: initialData.order || 0,
        }
      : {
          titleUz: "",
          titleRu: "",
          parentId: null,
          isActive: true,
          order: 0,
        },
  })

  const isActive = watch("isActive")
  const parentId = watch("parentId")

  return (
    <DialogContent className="sm:max-w-[500px]">
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogHeader>
          <DialogTitle>
            {initialData ? "Kategoriyani tahrirlash" : "Yangi kategoriya qo'shish"}
          </DialogTitle>
          <DialogDescription>
            Kategoriya ma'lumotlarini kiriting. Saqlash tugmasini bosishni unutmang.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="titleUz">Nomi (UZ)</Label>
              <Input id="titleUz" {...register("titleUz")} placeholder="Masalan: Atir" />
              {errors.titleUz && (
                <p className="text-xs text-destructive">{errors.titleUz.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="titleRu">Nomi (RU)</Label>
              <Input id="titleRu" {...register("titleRu")} placeholder="Masalan: Духи" />
              {errors.titleRu && (
                <p className="text-xs text-destructive">{errors.titleRu.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Asosiy kategoriya (ixtiyoriy)</Label>
            <Select
              value={parentId || "none"}
              onValueChange={(value) => setValue("parentId", value === "none" ? null : value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Tanlang" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Asosiy (Root)</SelectItem>
                {categories
                  .filter((c) => c._id !== initialData?._id)
                  .map((category) => (
                    <SelectItem key={category._id} value={category._id}>
                      {category.title?.uz}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4 items-center">
            <div className="space-y-2">
              <Label htmlFor="order">Tartib raqami</Label>
              <Input
                id="order"
                type="number"
                {...register("order", { valueAsNumber: true })}
              />
            </div>
            <div className="flex items-center space-x-2 pt-6">
              <Switch
                id="isActive"
                checked={isActive}
                onCheckedChange={(checked) => setValue("isActive", checked)}
              />
              <Label htmlFor="isActive">Faol holatda</Label>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Saqlanmoqda..." : "Saqlash"}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  )
}
