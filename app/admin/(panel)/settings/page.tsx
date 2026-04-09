"use client"

import * as React from "react"
import ProfileContentSettings from "@/components/admin/settings/ProfileContentSettings"

export default function SettingsPage() {
  const [activeTab, setActiveTab] = React.useState("about")

  const tabs = [
    { id: "about", label: "Biz haqimizda" },
    { id: "delivery", label: "Yetkazib berish" },
    { id: "support", label: "Qo'llab-quvvatlash" },
  ]

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Sozlamalar</h2>
        <p className="text-muted-foreground">
          Ilova kontenti va umumiy sozlamalarni boshqarish.
        </p>
      </div>

      <div className="flex space-x-2 border-b border-border pb-px">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${
              activeTab === tab.id
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="mt-4">
        {activeTab === "about" && (
          <ProfileContentSettings contentKey="about" title="Biz haqimizda" />
        )}
        {activeTab === "delivery" && (
          <ProfileContentSettings contentKey="delivery" title="Yetkazib berish" />
        )}
        {activeTab === "support" && (
          <ProfileContentSettings contentKey="support" title="Qo'llab-quvvatlash" />
        )}
      </div>
    </div>
  )
}
