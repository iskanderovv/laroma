"use client"

import * as React from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Save, Plus, Trash2 } from "lucide-react"
import { adminApi } from "@/lib/admin/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function ProfileContentSettings({ contentKey, title }: { contentKey: string, title: string }) {
  const queryClient = useQueryClient()
  
  const { data: content, isLoading } = useQuery({
    queryKey: ["profile-content", contentKey],
    queryFn: () => adminApi.getProfileContent(contentKey),
  })

  const [formData, setFormData] = React.useState<any>({
    title: { uz: "", ru: "" },
    description: { uz: "", ru: "" },
    phone: "",
    socialLinks: [],
    sections: []
  })

  React.useEffect(() => {
    if (content) {
      setFormData({
        title: content.title || { uz: "", ru: "" },
        description: content.description || { uz: "", ru: "" },
        phone: content.phone || "",
        socialLinks: content.socialLinks || [],
        sections: content.sections || []
      })
    }
  }, [content])

  const updateMutation = useMutation({
    mutationFn: (data: any) => adminApi.updateProfileContent(contentKey, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile-content", contentKey] })
      alert("Muvaffaqiyatli saqlandi!")
    },
    onError: () => {
      alert("Xatolik yuz berdi!")
    }
  })

  const handleSave = () => {
    updateMutation.mutate(formData)
  }

  if (isLoading) {
    return <div className="p-4">Yuklanmoqda...</div>
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>
          {title} bo'limi ma'lumotlarini tahrirlash
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Sarlavha (UZ)</Label>
            <Input 
              value={formData.title?.uz || ""} 
              onChange={(e) => setFormData({ ...formData, title: { ...formData.title, uz: e.target.value } })}
            />
          </div>
          <div className="space-y-2">
            <Label>Sarlavha (RU)</Label>
            <Input 
              value={formData.title?.ru || ""} 
              onChange={(e) => setFormData({ ...formData, title: { ...formData.title, ru: e.target.value } })}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Tavsif (UZ)</Label>
            <Textarea 
              value={formData.description?.uz || ""} 
              onChange={(e) => setFormData({ ...formData, description: { ...formData.description, uz: e.target.value } })}
            />
          </div>
          <div className="space-y-2">
            <Label>Tavsif (RU)</Label>
            <Textarea 
              value={formData.description?.ru || ""} 
              onChange={(e) => setFormData({ ...formData, description: { ...formData.description, ru: e.target.value } })}
            />
          </div>
        </div>

        {contentKey === "support" && (
          <div className="space-y-2">
            <Label>Telefon raqam</Label>
            <Input 
              value={formData.phone || ""} 
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+998901234567"
            />
          </div>
        )}

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-base font-semibold">Qo'shimcha bo'limlar</Label>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                setFormData({
                  ...formData,
                  sections: [...formData.sections, { title: { uz: "", ru: "" }, description: { uz: "", ru: "" } }]
                })
              }}
            >
              <Plus className="h-4 w-4 mr-2" /> Bo'lim qo'shish
            </Button>
          </div>
          {formData.sections?.map((section: any, index: number) => (
            <div key={index} className="p-4 border rounded-md relative space-y-4">
              <Button 
                variant="ghost" 
                size="icon" 
                className="absolute top-2 right-2 text-destructive h-8 w-8"
                onClick={() => {
                  const newSections = [...formData.sections]
                  newSections.splice(index, 1)
                  setFormData({ ...formData, sections: newSections })
                }}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
              <div className="grid grid-cols-2 gap-4 pt-4">
                <div className="space-y-2">
                  <Label>Bo'lim sarlavhasi (UZ)</Label>
                  <Input 
                    value={section.title?.uz || ""} 
                    onChange={(e) => {
                      const newSections = [...formData.sections]
                      newSections[index].title.uz = e.target.value
                      setFormData({ ...formData, sections: newSections })
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Bo'lim sarlavhasi (RU)</Label>
                  <Input 
                    value={section.title?.ru || ""} 
                    onChange={(e) => {
                      const newSections = [...formData.sections]
                      newSections[index].title.ru = e.target.value
                      setFormData({ ...formData, sections: newSections })
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Bo'lim matni (UZ)</Label>
                  <Textarea 
                    value={section.description?.uz || ""} 
                    onChange={(e) => {
                      const newSections = [...formData.sections]
                      newSections[index].description.uz = e.target.value
                      setFormData({ ...formData, sections: newSections })
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Bo'lim matni (RU)</Label>
                  <Textarea 
                    value={section.description?.ru || ""} 
                    onChange={(e) => {
                      const newSections = [...formData.sections]
                      newSections[index].description.ru = e.target.value
                      setFormData({ ...formData, sections: newSections })
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {contentKey === "support" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold">Ijtimoiy tarmoqlar</Label>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  setFormData({
                    ...formData,
                    socialLinks: [...formData.socialLinks, { type: "telegram", label: "Telegram", value: "@username", url: "https://t.me/username" }]
                  })
                }}
              >
                <Plus className="h-4 w-4 mr-2" /> Tarmoq qo'shish
              </Button>
            </div>
            {formData.socialLinks?.map((link: any, index: number) => (
              <div key={index} className="flex items-start gap-4 p-4 border rounded-md">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 flex-1">
                  <div className="space-y-2">
                    <Label>Turi (masalan: telegram)</Label>
                    <Input 
                      value={link.type} 
                      onChange={(e) => {
                        const newLinks = [...formData.socialLinks]
                        newLinks[index].type = e.target.value
                        setFormData({ ...formData, socialLinks: newLinks })
                      }}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Nomi (masalan: Telegram)</Label>
                    <Input 
                      value={link.label} 
                      onChange={(e) => {
                        const newLinks = [...formData.socialLinks]
                        newLinks[index].label = e.target.value
                        setFormData({ ...formData, socialLinks: newLinks })
                      }}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Qiymati (@username)</Label>
                    <Input 
                      value={link.value} 
                      onChange={(e) => {
                        const newLinks = [...formData.socialLinks]
                        newLinks[index].value = e.target.value
                        setFormData({ ...formData, socialLinks: newLinks })
                      }}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Link (https://...)</Label>
                    <Input 
                      value={link.url} 
                      onChange={(e) => {
                        const newLinks = [...formData.socialLinks]
                        newLinks[index].url = e.target.value
                        setFormData({ ...formData, socialLinks: newLinks })
                      }}
                    />
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="text-destructive mt-8 h-8 w-8"
                  onClick={() => {
                    const newLinks = [...formData.socialLinks]
                    newLinks.splice(index, 1)
                    setFormData({ ...formData, socialLinks: newLinks })
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}

        <Button onClick={handleSave} disabled={updateMutation.isPending} className="w-full md:w-auto">
          {updateMutation.isPending ? "Saqlanmoqda..." : <><Save className="mr-2 h-4 w-4" /> Saqlash</>}
        </Button>
      </CardContent>
    </Card>
  )
}
