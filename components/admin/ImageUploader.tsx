"use client"

import * as React from "react"
import { Upload, X, ImageIcon, Loader2 } from "lucide-react"
import { adminApi } from "@/lib/admin/api"
import { Button } from "@/components/ui/button"
import { cn, fullUrl } from "@/lib/utils"

interface ImageUploaderProps {
  value?: string
  onChange: (url: string) => void
  onRemove: () => void
  className?: string
}

export default function ImageUploader({
  value,
  onChange,
  onRemove,
  className,
}: ImageUploaderProps) {
  const [isUploading, setIsUploading] = React.useState(false)
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    try {
      const res = await adminApi.uploadImage(file)
      onChange(res.url)
    } catch (error) {
      console.error("Upload error:", error)
      alert("Rasm yuklashda xatolik yuz berdi")
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className={cn("space-y-2", className)}>
      <div
        onClick={() => !value && !isUploading && fileInputRef.current?.click()}
        className={cn(
          "relative flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-lg transition-colors overflow-hidden",
          !value ? "hover:bg-muted/50 cursor-pointer" : "bg-muted/30",
          isUploading && "opacity-50 cursor-not-allowed"
        )}
      >
        {value ? (
          <>
            <img src={fullUrl(value)} alt="Preview" className="w-full h-full object-contain" />
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                onRemove()
              }}
              className="absolute top-2 right-2 p-1 bg-destructive text-destructive-foreground rounded-full hover:bg-destructive/90 transition-opacity"
            >
              <X className="h-4 w-4" />
            </button>
          </>
        ) : (
          <div className="flex flex-col items-center gap-2 text-muted-foreground">
            {isUploading ? (
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            ) : (
              <>
                <Upload className="h-8 w-8" />
                <span className="text-sm">Rasm yuklash uchun bosing</span>
              </>
            )}
          </div>
        )}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          className="hidden"
        />
      </div>
    </div>
  )
}
