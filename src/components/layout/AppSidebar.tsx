import React from 'react'
import { Link } from 'react-router-dom'
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar"
import { useAuth } from '@/lib/AuthProvider'
import { useProfile } from '@/lib/hooks/useProfile'
import { Shield, User, Users, BookOpen, Swords, MessageCircle } from 'lucide-react'

const AppSidebar = () => {
  const { user } = useAuth()
  const { profile } = useProfile()
  
  if (!user || !profile) {
    return null
  }

  const sidebarItems = [
    {
      title: "War Room",
      url: "/",
      icon: Shield,
    },
    {
      title: "Battle Contracts",
      url: "/contracts",
      icon: Swords,
    },
    {
      title: "Quest Chronicles", 
      url: "/history",
      icon: BookOpen,
    },
    {
      title: "Ally Network",
      url: "/feed", 
      icon: Users,
    },
    {
      title: "Community Feed",
      url: "/community",
      icon: MessageCircle,
    },
    {
      title: "Battle Profile",
      url: "/profile",
      icon: User,
    },
  ]

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-ascend-primary font-bold uppercase tracking-wider">
            Ascend Arena
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {sidebarItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link to={item.url} className="flex items-center gap-3 font-medium">
                      <item.icon className="h-5 w-5" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}

export default AppSidebar
