
import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { 
  Home, 
  Users, 
  Sword, 
  BarChart, 
  Trophy, 
  Coins,
  User,
  Settings,
  LogOut
} from 'lucide-react'
import { useAuth } from '@/lib/AuthProvider'
import { useProfile } from '@/lib/hooks/useProfile'

interface AppLayoutProps {
  children: React.ReactNode
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const { signOut } = useAuth()
  const { profile } = useProfile()
  const location = useLocation()

  const navItems = [
    { icon: Home, label: 'War Room', path: '/' },
    { icon: Users, label: 'Community', path: '/community' },
    { icon: Sword, label: 'Commitments', path: '/commitments' },
    { icon: BarChart, label: 'Analytics', path: '/analytics' },
    { icon: Trophy, label: 'Achievements', path: '/achievements' },
    { icon: Coins, label: 'Store', path: '/store' },
  ]

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/'
    }
    return location.pathname.startsWith(path)
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Sword className="h-6 w-6 text-primary" />
              <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Ascend Arena
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Token Balance */}
            <div className="hidden sm:flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-1">
              <Coins className="h-4 w-4 text-amber-600" />
              <span className="text-sm font-semibold text-amber-800">
                {profile?.token_balance || 0} SIT
              </span>
            </div>

            {/* User Menu */}
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary/10 text-primary font-semibold text-sm">
                  {profile?.username?.charAt(0)?.toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="hidden sm:block">
                <p className="text-sm font-medium">{profile?.username || 'Warrior'}</p>
                <p className="text-xs text-muted-foreground">
                  {profile?.current_streak || 0} day streak
                </p>
              </div>
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={signOut}
              className="text-muted-foreground hover:text-foreground"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="hidden md:flex w-64 flex-col border-r bg-card/30 backdrop-blur-sm">
          <nav className="flex-1 space-y-2 p-4">
            {navItems.map((item) => (
              <Link key={item.path} to={item.path}>
                <Button
                  variant={isActive(item.path) ? "secondary" : "ghost"}
                  className="w-full justify-start gap-3"
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Button>
              </Link>
            ))}
          </nav>

          <div className="p-4 border-t">
            <Link to="/profile">
              <Button variant="ghost" className="w-full justify-start gap-3">
                <User className="h-4 w-4" />
                Profile
              </Button>
            </Link>
            <Link to="/settings">
              <Button variant="ghost" className="w-full justify-start gap-3">
                <Settings className="h-4 w-4" />
                Settings
              </Button>
            </Link>
          </div>
        </aside>

        {/* Mobile Navigation */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-card border-t">
          <nav className="flex items-center justify-around py-2">
            {navItems.slice(0, 5).map((item) => (
              <Link key={item.path} to={item.path} className="p-2">
                <Button
                  variant={isActive(item.path) ? "secondary" : "ghost"}
                  size="icon"
                  className="h-10 w-10"
                >
                  <item.icon className="h-4 w-4" />
                </Button>
              </Link>
            ))}
          </nav>
        </div>

        {/* Main Content */}
        <main className="flex-1 md:pb-0 pb-16">
          {children}
        </main>
      </div>
    </div>
  )
}
