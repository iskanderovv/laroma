"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutGrid,
  Users,
  ShoppingBag,
  ListTree,
  Image as ImageIcon,
  Settings,
  LogOut,
  Heart,
  Package,
  FileText,
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
} from "@/components/ui/sidebar"
import AdminBrand from "@/components/admin/AdminBrand"
import { clearAdminSession } from "@/lib/admin/auth"
import { useRouter } from "next/navigation"

const data = {
  navMain: [
    {
      title: "Dashboard",
      url: "/admin",
      icon: LayoutGrid,
    },
    {
      title: "Foydalanuvchilar",
      url: "/admin/users",
      icon: Users,
    },
    {
      title: "Mahsulotlar",
      url: "/admin/products",
      icon: Package,
    },
    {
      title: "Kategoriyalar",
      url: "/admin/categories",
      icon: ShoppingBag,
    },
    {
      title: "Bannerlar",
      url: "/admin/banners",
      icon: ImageIcon,
    },
    {
      title: "Brendlar",
      url: "/admin/brands",
      icon: Heart,
    },
    {
      title: "Buyurtmalar",
      url: "/admin/orders",
      icon: ListTree,
    },
    {
      title: "Xabarnoma",
      url: "/admin/broadcast",
      icon: FileText,
    },
  ],
  secondary: [
    {
      title: "Sozlamalar",
      url: "/admin/settings",
      icon: Settings,
    },
  ],
}

export default function AdminSidebar() {
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = () => {
    clearAdminSession()
    router.push("/admin/login")
  }

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="h-16 flex items-center justify-center border-b">
        <AdminBrand />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Asosiy</SidebarGroupLabel>
          <SidebarMenu>
            {data.navMain.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === item.url}
                  tooltip={item.title}
                >
                  <Link href={item.url}>
                    <item.icon />
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>

        <SidebarGroup className="mt-auto">
          <SidebarGroupContent>
            <SidebarMenu>
              {data.secondary.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    size="sm"
                    isActive={pathname === item.url}
                    tooltip={item.title}
                  >
                    <Link href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              className="md:h-12"
              onClick={handleLogout}
              tooltip="Chiqish"
            >
              <LogOut className="text-destructive" />
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold text-destructive">Chiqish</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
