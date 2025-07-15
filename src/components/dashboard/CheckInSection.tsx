import React from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { format, formatDistanceToNow } from 'date-fns'
import { useCheckIn } from "@/lib/hooks/useCheckIn"
import { Shield, CheckCircle, Flame, Trophy, Swords, XCircle, Edit2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface CheckInSectionProps {
  hasCheckedInToday: boolean
  lastCheckInDate?: string
  isLoading: boolean
  onEditCheckIn?: (date: string) => void
}

const CheckInSection: React.FC<CheckInSectionProps> = ({
  hasCheckedInToday,
  lastCheckInDate,
  isLoading,
  onEditCheckIn
}) => {
  const { checkIn, isCheckingIn } = useCheckIn()
  const [showDefeatDialog, setShowDefeatDialog] = React.useState(false)

  if (isLoading) {
    return (
      <Card className="border-0 bg-gradient-card backdrop-blur-sm">
        <CardHeader>
          <Skeleton className="h-6 w-40 bg-muted/50" />
          <Skeleton className="h-4 w-56 bg-muted/50" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-4 w-32 bg-muted/50" />
          <Skeleton className="h-4 w-48 bg-muted/50" />
          <Skeleton className="h-16 w-full bg-muted/50" />
        </CardContent>
      </Card>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: -30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6 }}
    >
      <Card className={`border-0 backdrop-blur-sm overflow-hidden relative ${
        hasCheckedInToday 
          ? 'bg-gradient-card border-ascend-success/20' 
          : 'bg-gradient-card border-ascend-primary/20'
      }`}>
        {/* Background texture */}
        <div className="absolute inset-0 opacity-5 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.3)_1px,transparent_0)] bg-[length:25px_25px]"></div>
        
        {/* Background symbols */}
        <div className="absolute top-4 right-4 opacity-10">
          <Swords className="h-8 w-8 text-ascend-primary transform rotate-45" />
        </div>
        <div className="absolute bottom-4 left-4 opacity-10">
          <Shield className="h-6 w-6 text-ascend-primary" />
        </div>
        
        <div className="relative z-10">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-foreground text-xl font-black flex items-center gap-3 tracking-wide uppercase">
                  <motion.div
                    animate={{ 
                      scale: hasCheckedInToday ? [1, 1.1, 1] : 1,
                      rotate: hasCheckedInToday ? [0, 5, -5, 0] : 0
                    }}
                    transition={{ duration: 2, repeat: hasCheckedInToday ? Infinity : 0 }}
                  >
                    <Shield className="h-6 w-6 text-ascend-primary shield-glow" />
                  </motion.div>
                  VICTORY DECLARATION
                </CardTitle>
                <CardDescription className="text-muted-foreground font-medium uppercase tracking-wide">
                  {hasCheckedInToday ? "Mission accomplished today" : "Declare your daily victory"}
                </CardDescription>
              </div>
              {hasCheckedInToday && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.5, type: "spring" }}
                >
                  <Badge className="bg-ascend-success/10 text-ascend-success border-ascend-success/30 font-black uppercase tracking-wide">
                    <Trophy className="h-3 w-3 mr-1" />
                    VICTORIOUS
                  </Badge>
                </motion.div>
              )}
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {hasCheckedInToday ? (
              <motion.div 
                className="space-y-4"
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.4 }}
              >
                <div className="flex items-center gap-3 p-4 bg-ascend-success/10 rounded-lg border border-ascend-success/20">
                  <CheckCircle className="h-5 w-5 text-ascend-success" />
                  <span className="text-ascend-success font-bold tracking-wide uppercase">Victory achieved! Another step toward mastery!</span>
                </div>
                
                {lastCheckInDate && (
                  <div className="space-y-2 text-foreground">
                    <div className="flex items-center gap-2">
                      <Flame className="h-4 w-4 text-ascend-primary" />
                      <span className="text-sm font-medium uppercase tracking-wide">
                        Declared {formatDistanceToNow(new Date(lastCheckInDate), { addSuffix: true })}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                      On {format(new Date(lastCheckInDate), "EEEE, MMMM do 'at' h:mm a")}
                    </div>
                  </div>
                )}
              </motion.div>
            ) : (
              <div className="space-y-4">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="relative"
                >
                  <Button 
                    onClick={() => checkIn({ status: 'victory' })} 
                    disabled={isCheckingIn} 
                    className="w-full h-24 bg-gradient-to-r from-ascend-primary via-ascend-secondary to-ascend-primary hover:from-ascend-primary/90 hover:via-ascend-secondary/90 hover:to-ascend-primary/90 text-white font-black text-xl shadow-2xl border-2 border-ascend-primary/50 transition-all duration-500 uppercase tracking-wider relative overflow-hidden group"
                    style={{
                      background: isCheckingIn 
                        ? 'linear-gradient(45deg, #FFD700, #FFA500, #FFD700)' 
                        : undefined
                    }}
                  >
                    {/* Animated background effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                    
                    {isCheckingIn ? (
                      <motion.div 
                        className="flex items-center gap-4 text-white relative z-10"
                        animate={{ 
                          scale: [1, 1.05, 1],
                          rotateY: [0, 5, -5, 0]
                        }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        <motion.div 
                          className="w-7 h-7 border-3 border-white border-t-transparent rounded-full"
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        />
                        <div className="flex flex-col items-center">
                          <span className="text-lg">⚔️ DECLARING VICTORY ⚔️</span>
                          <span className="text-sm opacity-90">Forging your destiny...</span>
                        </div>
                      </motion.div>
                    ) : (
                      <motion.div 
                        className="flex items-center gap-4 text-white relative z-10"
                        whileHover={{ scale: 1.05 }}
                      >
                        <motion.div
                          animate={{ 
                            rotate: [0, 10, -10, 0],
                            scale: [1, 1.1, 1]
                          }}
                          transition={{ duration: 3, repeat: Infinity }}
                        >
                          <Shield className="h-8 w-8 text-white drop-shadow-lg" />
                        </motion.div>
                        <div className="flex flex-col items-center">
                          <span className="text-xl tracking-widest">⚔️ DECLARE VICTORY ⚔️</span>
                          <span className="text-sm opacity-90 tracking-wide">Claim your daily triumph</span>
                        </div>
                      </motion.div>
                    )}
                  </Button>
                </motion.div>

                <Dialog open={showDefeatDialog} onOpenChange={setShowDefeatDialog}>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full border-destructive/50 text-destructive hover:bg-destructive/10"
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Declare Defeat
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Declare Defeat?</DialogTitle>
                      <DialogDescription>
                        This will reset your streak. Are you sure you want to declare defeat for today?
                      </DialogDescription>
                    </DialogHeader>
                    <div className="flex gap-3 justify-end mt-4">
                      <Button
                        variant="outline"
                        onClick={() => setShowDefeatDialog(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={() => {
                          checkIn({ status: 'defeat' })
                          setShowDefeatDialog(false)
                        }}
                      >
                        Yes, Declare Defeat
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>

                {onEditCheckIn && (
                  <Button
                    variant="ghost"
                    className="w-full text-muted-foreground hover:text-foreground"
                    onClick={() => onEditCheckIn(new Date().toISOString().split('T')[0])}
                  >
                    <Edit2 className="h-4 w-4 mr-2" />
                    Edit Past Check-ins
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </div>
      </Card>
    </motion.div>
  )
}

export default CheckInSection
