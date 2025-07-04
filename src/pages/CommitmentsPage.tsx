import React, { useState } from 'react'
import { AppLayout } from '@/components/layout/AppLayout'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Swords, Plus, Shield, Trophy, AlertCircle, Heart } from 'lucide-react'
import { motion } from 'framer-motion'
import { useCommitments } from '@/lib/hooks/useCommitments'
import EnhancedCommitmentModal from '@/components/commitments/EnhancedCommitmentModal'
import CommitmentProgressCard from '@/components/commitments/CommitmentProgressCard'
import RegroupMissionCard from '@/components/commitments/RegroupMissionCard'

const CommitmentsPage = () => {
  const [showCommitmentModal, setShowCommitmentModal] = useState(false)
  const { 
    commitments, 
    activeCommitments, 
    regroupMissions,
    isLoading, 
    cancelCommitment,
    completeRegroupMission,
    isCompletingRegroup
  } = useCommitments()

  const completedCommitments = commitments.filter(c => c.status === 'succeeded')
  const failedCommitments = commitments.filter(c => c.status === 'failed')

  if (isLoading) {
    return (
      <AppLayout>
        <div className="max-w-4xl mx-auto p-6">
          <div className="space-y-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-32 bg-muted rounded-lg"></div>
              </div>
            ))}
          </div>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-6 p-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-3">
                <Swords className="h-8 w-8 text-primary" />
                Enhanced Battle Contracts
              </h1>
              <p className="text-muted-foreground mt-2">
                Advanced accountability system with penalty escalation and recovery missions
              </p>
            </div>
            <Button onClick={() => setShowCommitmentModal(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              New Contract
            </Button>
          </div>
        </motion.div>

        {/* Regroup Missions Section */}
        {regroupMissions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <Card className="border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5 text-amber-600" />
                  Recovery Missions Available
                </CardTitle>
                <CardDescription>
                  Complete these missions to recover tokens from recent contract failures
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {regroupMissions.map((mission) => (
                  <RegroupMissionCard
                    key={mission.id}
                    mission={mission}
                    onComplete={completeRegroupMission}
                    isCompleting={isCompletingRegroup}
                  />
                ))}
              </CardContent>
            </Card>
          </motion.div>
        )}

        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Tabs defaultValue="active" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="active" className="gap-2">
                <Shield className="h-4 w-4" />
                Active ({activeCommitments.length})
              </TabsTrigger>
              <TabsTrigger value="completed" className="gap-2">
                <Trophy className="h-4 w-4" />
                Victories ({completedCommitments.length})
              </TabsTrigger>
              <TabsTrigger value="failed" className="gap-2">
                <AlertCircle className="h-4 w-4" />
                Defeats ({failedCommitments.length})
              </TabsTrigger>
              <TabsTrigger value="all" className="gap-2">
                <Swords className="h-4 w-4" />
                All ({commitments.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="active" className="space-y-4">
              {activeCommitments.length === 0 ? (
                <Card className="border-dashed">
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <Shield className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Active Contracts</h3>
                    <p className="text-muted-foreground text-center mb-6">
                      Create your first enhanced battle contract with advanced penalty/recovery system
                    </p>
                    <Button onClick={() => setShowCommitmentModal(true)} className="gap-2">
                      <Plus className="h-4 w-4" />
                      Create Contract
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4">
                  {activeCommitments.map((commitment) => (
                    <CommitmentProgressCard
                      key={commitment.id}
                      commitment={commitment}
                      onCancel={cancelCommitment}
                    />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="completed" className="space-y-4">
              {completedCommitments.length === 0 ? (
                <Card className="border-dashed">
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <Trophy className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Victories Yet</h3>
                    <p className="text-muted-foreground text-center">
                      Complete your first contract to see your victories here
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4">
                  {completedCommitments.map((commitment) => (
                    <CommitmentProgressCard
                      key={commitment.id}
                      commitment={commitment}
                    />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="failed" className="space-y-4">
              {failedCommitments.length === 0 ? (
                <Card className="border-dashed">
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Defeats</h3>
                    <p className="text-muted-foreground text-center">
                      Your battle record remains untarnished
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4">
                  {failedCommitments.map((commitment) => (
                    <CommitmentProgressCard
                      key={commitment.id}
                      commitment={commitment}
                    />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="all" className="space-y-4">
              {commitments.length === 0 ? (
                <Card className="border-dashed">
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <Swords className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Contracts Yet</h3>
                    <p className="text-muted-foreground text-center mb-6">
                      Start your journey with an enhanced battle contract
                    </p>
                    <Button onClick={() => setShowCommitmentModal(true)} className="gap-2">
                      <Plus className="h-4 w-4" />
                      Begin Your First Enhanced Battle
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4">
                  {commitments.map((commitment) => (
                    <CommitmentProgressCard
                      key={commitment.id}
                      commitment={commitment}
                      onCancel={commitment.status === 'active' ? cancelCommitment : undefined}
                    />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </motion.div>

        {/* Enhanced System Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-primary" />
                Enhanced Battle Contract System
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4 text-sm">
                <div>
                  <h4 className="font-semibold mb-2 text-green-700">Success Rewards</h4>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>• Stake returned + duration bonus</li>
                    <li>• 1-day: +10%, 7-day: +30%, 30-day: +50%</li>
                    <li>• Ally stake matching available</li>
                    <li>• Success streaks unlock longer contracts</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2 text-red-700">Penalty Escalation</h4>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>• 1st failure: 100% stake lost</li>
                    <li>• 2nd failure: 50% stake lost</li>
                    <li>• 3rd+ failure: 25% stake lost</li>
                    <li>• Failed stakes shared with ally</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2 text-amber-700">Recovery System</h4>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>• Regroup Missions after failures</li>
                    <li>• Recover 30% of lost tokens</li>
                    <li>• Reflection-based learning</li>
                    <li>• Prevents demoralization spiral</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <EnhancedCommitmentModal
        open={showCommitmentModal}
        onOpenChange={setShowCommitmentModal}
      />
    </AppLayout>
  )
}

export default CommitmentsPage
