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

const brandSchema = z.object({
  titleUz: z.string().min(2, "O'zbekcha nom kamida 2 ta belgidan iborat bo'lishi kerak"),
  titleRu: z.string().min(2, "Ruscha nom kamida 2 ta belgidan iborat bo'lishi kerak"),
  isActive: z.boolean().default(true),
  order: z.number().default(0),
})

type BrandFormValues = z.input<typeof brandSchema>

interface BrandFormProps {
  initialData?: any
  onSubmit: (data: BrandFormValues) => void
  isLoading?: boolean
}

export default function BrandForm({
  initialData,
  onSubmit,
  isLoading,
}: BrandFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<BrandFormValues>({
    resolver: zodResolver(brandSchema),
    defaultValues: initialData
      ? {
          titleUz: initialData.title?.uz || "",
          titleRu: initialData.title?.ru || "",
          isActive: initialData.isActive ?? true,
          order: initialData.order || 0,
        }
      : {
          titleUz: "",
          titleRu: "",
          isActive: true,
          order: 0,
        },
  })

  const isActive = watch("isActive")

  return (
    <DialogContent className="sm:max-w-[500px]">
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogHeader>
          <DialogTitle>
            {initialData ? "Brendni tahrirlash" : "Yangi brend qo'shish"}
          </DialogTitle>
          <DialogDescription>
            Brend ma'lumotlarini kiriting. Saqlash tugmasini bosishni unutmang.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="titleUz">Nomi (UZ)</Label>
              <Input id="titleUz" {...register("titleUz")} placeholder="Masalan: Chanel" />
              {errors.titleUz && (
                <p className="text-xs text-destructive">{errors.titleUz.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="titleRu">Nomi (RU)</Label>
              <Input id="titleRu" {...register("titleRu")} placeholder="Masalan: Chanel" />
              {errors.titleRu && (
                <p className="text-xs text-destructive">{errors.titleRu.message}</p>
              )}
            </div>
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
