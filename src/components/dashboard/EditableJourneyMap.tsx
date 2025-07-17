import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { CheckCircle, X, Calendar, Edit2 } from 'lucide-react'
import { format, subDays, startOfDay } from 'date-fns'
import EditCheckInDialog from '@/components/check-in/EditCheckInDialog'

interface CheckInData {
  date_local: string
  status: string
  tokens_awarded: number
}

interface EditableJourneyMapProps {
  checkInsHistory: CheckInData[]
  isLoading?: boolean
}

const EditableJourneyMap: React.FC<EditableJourneyMapProps> = ({ checkInsHistory, isLoading }) => {
  const [showEditDialog, setShowEditDialog] = useState(false)

  // Generate last 30 days in correct order (oldest to newest, left to right)
  const generateLast30Days = () => {
    const days = []
    const today = startOfDay(new Date())
    
    // Generate from 29 days ago to today (30 days total)
    for (let i = 29; i >= 0; i--) {
      const date = subDays(today, i)
      days.push(format(date, 'yyyy-MM-dd'))
    }
    
    return days
  }

  const last30Days = generateLast30Days()

  // Create a map for quick lookup of check-in data
  const checkInMap = new Map(
    checkInsHistory.map(checkIn => [checkIn.date_local, checkIn])
  )

  const getNodeColor = (date: string) => {
    const checkIn = checkInMap.get(date)
    if (!checkIn) return 'bg-muted border-muted-foreground' // No data (missed day)
    if (checkIn.status === 'victory') return 'bg-green-500 border-green-400'
    return 'bg-red-500 border-red-400' // Failed day
  }

  const getNodeIcon = (date: string) => {
    const checkIn = checkInMap.get(date)
    if (!checkIn) return null
    if (checkIn.status === 'victory') return <CheckCircle className="h-3 w-3 text-white" />
    return <X className="h-3 w-3 text-white" />
  }

  const formatDateForTooltip = (date: string) => {
    return format(new Date(date), 'MMM d, yyyy')
  }

  // Convert check-ins data for edit dialog
  const checkInsForEdit = checkInsHistory.map(checkIn => ({
    date: checkIn.date_local,
    status: checkIn.status as 'victory' | 'defeat'
  }))

  if (isLoading) {
    return (
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Path of Valor
          </CardTitle>
          <CardDescription>
            Your 30-day journey visualization
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-1">
            {[...Array(30)].map((_, i) => (
              <div
                key={i}
                className="w-8 h-8 bg-muted border border-border rounded animate-pulse"
              />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card className="bg-card border-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                Path of Valor
              </CardTitle>
              <CardDescription>
                Your 30-day journey - {formatDateForTooltip(last30Days[0])} to {formatDateForTooltip(last30Days[29])}
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowEditDialog(true)}
              className="gap-2"
            >
              <Edit2 className="h-4 w-4" />
              Edit Days
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <TooltipProvider>
            <div className="grid grid-cols-10 gap-1 sm:gap-2">
              {last30Days.map((date) => {
                const checkIn = checkInMap.get(date)
                return (
                  <Tooltip key={date}>
                    <TooltipTrigger asChild>
                      <div
                        className={`
                          w-8 h-8 border-2 rounded flex items-center justify-center
                          transition-all hover:scale-110 cursor-pointer
                          ${getNodeColor(date)}
                        `}
                        onClick={() => setShowEditDialog(true)}
                      >
                        {getNodeIcon(date)}
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <div className="text-center">
                        <p className="font-medium">{formatDateForTooltip(date)}</p>
                        {checkIn ? (
                          <div className="mt-1">
                            <p className="text-sm">
                              Status: {checkIn.status === 'victory' ? 'Victory!' : 'Missed'}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              +{checkIn.tokens_awarded} Valor Shards
                            </p>
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground">No check-in (click to edit)</p>
                        )}
                      </div>
                    </TooltipContent>
                  </Tooltip>
                )
              })}
            </div>
            <div className="mt-4 flex items-center justify-center gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-green-500 rounded"></div>
                <span>Victory</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-red-500 rounded"></div>
                <span>Missed</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-muted rounded"></div>
                <span>No Data</span>
              </div>
            </div>
          </TooltipProvider>
        </CardContent>
      </Card>

      <EditCheckInDialog
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        checkIns={checkInsForEdit}
      />
    </>
  )
}

export default EditableJourneyMap