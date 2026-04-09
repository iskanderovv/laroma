"use client"

import * as React from "react"
import { useMutation } from "@tanstack/react-query"
import { Send, Plus, Trash2, X } from "lucide-react"
import { adminApi } from "@/lib/admin/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import ImageUploader from "@/components/admin/ImageUploader"

export default function BroadcastPage() {
  const [message, setMessage] = React.useState("")
  const [images, setImages] = React.useState<string[]>([])
  const [buttons, setButtons] = React.useState<{ text: string, url: string }[]>([])

  const broadcastMutation = useMutation({
    mutationFn: (payload: any) => adminApi.sendBroadcast(payload),
    onSuccess: (res) => {
      alert(`Xabar yuborish boshlandi. Maqsadli foydalanuvchilar: ${res.targetCount}`)
      setMessage("")
      setImages([])
      setButtons([])
    },
    onError: () => {
      alert("Xabar yuborishda xatolik yuz berdi!")
    }
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim() && images.length === 0) {
      alert("Xabar matni yoki rasm kiriting!")
      return
    }

    // Clean up empty buttons
    const validButtons = buttons.filter(b => b.text.trim() && b.url.trim())

    broadcastMutation.mutate({
      message,
      images,
      buttons: validButtons
    })
  }

  return (
    <div className="flex flex-col gap-6 w-full">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Xabarnoma yuborish</h2>
        <p className="text-muted-foreground">
          Telegram bot orqali barcha foydalanuvchilarga ommaviy xabar yuborish.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Yangi xabar</CardTitle>
          <CardDescription>
            Matn, rasm va tugmalarni qo'shishingiz mumkin.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-2">
              <Label>Xabar matni</Label>
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Xabar matnini kiriting... (HTML teglar ishlatsangiz bo'ladi: <b>bold</b>, <i>italic</i>)"
                className="min-h-[150px]"
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Rasmlar</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setImages([...images, ""])}
                >
                  <Plus className="h-4 w-4 mr-2" /> Rasm qo'shish
                </Button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {images.map((img, index) => (
                  <div key={index} className="relative border rounded-lg p-2">
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute -top-3 -right-3 h-6 w-6 rounded-full z-10"
                      onClick={() => {
                        const newImages = [...images]
                        newImages.splice(index, 1)
                        setImages(newImages)
                      }}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                    <ImageUploader
                      value={img}
                      onChange={(url) => {
                        const newImages = [...images]
                        newImages[index] = url
                        setImages(newImages)
                      }}
                      onRemove={() => {
                        const newImages = [...images]
                        newImages[index] = ""
                        setImages(newImages)
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Inline tugmalar (Bot ostida chiqadi)</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setButtons([...buttons, { text: "", url: "" }])}
                >
                  <Plus className="h-4 w-4 mr-2" /> Tugma qo'shish
                </Button>
              </div>

              <div className="space-y-3">
                {buttons.map((btn, index) => (
                  <div key={index} className="flex items-start gap-4 p-4 border rounded-md relative">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute top-2 right-2 text-destructive h-8 w-8"
                      onClick={() => {
                        const newButtons = [...buttons]
                        newButtons.splice(index, 1)
                        setButtons(newButtons)
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1 pr-8">
                      <div className="space-y-2">
                        <Label>Tugma matni</Label>
                        <Input
                          value={btn.text}
                          onChange={(e) => {
                            const newButtons = [...buttons]
                            newButtons[index].text = e.target.value
                            setButtons(newButtons)
                          }}
                          placeholder="Batafsil"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Tugma linki</Label>
                        <Input
                          value={btn.url}
                          onChange={(e) => {
                            const newButtons = [...buttons]
                            newButtons[index].url = e.target.value
                            setButtons(newButtons)
                          }}
                          placeholder="https://..."
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Button type="submit" disabled={broadcastMutation.isPending} className="w-full">
              {broadcastMutation.isPending ? "Yuborilmoqda..." : <><Send className="mr-2 h-4 w-4" /> Barchaga yuborish</>}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
