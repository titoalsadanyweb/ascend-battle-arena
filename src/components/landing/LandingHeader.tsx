
import React from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Shield, Moon, Sun } from 'lucide-react'
import { motion } from 'framer-motion'
import { useTheme } from '@/lib/ThemeProvider'

export const LandingHeader = () => {
  const { theme, setTheme } = useTheme()

  return (
    <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <motion.div 
            className="flex items-center"
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
          >
            <motion.div
              className="relative mr-3"
              whileHover={{ rotate: 5 }}
              transition={{ duration: 0.3 }}
            >
              <Shield className="h-8 w-8 text-primary shield-glow" />
            </motion.div>
            <h1 className="text-xl font-black text-primary">
              ASCEND ARENA
            </h1>
          </motion.div>
          <nav className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="text-muted-foreground hover:text-foreground"
            >
              {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
            <Link to="/login">
              <Button variant="ghost" className="text-foreground hover:bg-primary/10">
                Sign In
              </Button>
            </Link>
            <Link to="/assessment">
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-lg">
                Join the Battle
              </Button>
            </Link>
          </nav>
        </div>
      </div>
    </header>
  )
}
