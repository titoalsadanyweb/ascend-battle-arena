
import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { CheckCircle, X, Calendar } from 'lucide-react'
import { format, subDays, startOfDay } from 'date-fns'

interface CheckInData {
  date_local: string
  status: string
  tokens_awarded: number
}

interface JourneyMapProps {
  checkInsHistory: CheckInData[]
  isLoading?: boolean
}

const JourneyMap: React.FC<JourneyMapProps> = ({ checkInsHistory, isLoading }) => {
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
    if (!checkIn) return 'bg-gray-600 border-gray-500' // No data (missed day)
    if (checkIn.status === 'success') return 'bg-green-500 border-green-400'
    return 'bg-red-500 border-red-400' // Failed day
  }

  const getNodeIcon = (date: string) => {
    const checkIn = checkInMap.get(date)
    if (!checkIn) return null
    if (checkIn.status === 'success') return <CheckCircle className="h-3 w-3 text-white" />
    return <X className="h-3 w-3 text-white" />
  }

  const formatDateForTooltip = (date: string) => {
    return format(new Date(date), 'MMM d, yyyy')
  }

  if (isLoading) {
    return (
      <Card className="bg-slate-800 text-white border-purple-600">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-purple-500" />
            Path of Valor
          </CardTitle>
          <CardDescription className="text-gray-400">
            Your 30-day journey visualization
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-1">
            {[...Array(30)].map((_, i) => (
              <div
                key={i}
                className="w-8 h-8 bg-gray-700 border border-gray-600 rounded animate-pulse"
              />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-slate-800 text-white border-purple-600">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-purple-500" />
          Path of Valor
        </CardTitle>
        <CardDescription className="text-gray-400">
          Your 30-day journey visualization - from {formatDateForTooltip(last30Days[0])} to {formatDateForTooltip(last30Days[29])}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <TooltipProvider>
          <div className="grid grid-cols-10 gap-1 sm:gap-2">
            {last30Days.map((date, index) => {
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
                      onClick={() => {
                        // Future: Could open edit dialog here
                        console.log('Date clicked:', date)
                      }}
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
                            Status: {checkIn.status === 'success' ? 'Victory!' : 'Missed'}
                          </p>
                          <p className="text-xs text-gray-300">
                            +{checkIn.tokens_awarded} Valor Shards
                          </p>
                        </div>
                      ) : (
                        <p className="text-sm text-gray-300">No check-in</p>
                      )}
                    </div>
                  </TooltipContent>
                </Tooltip>
              )
            })}
          </div>
          <div className="mt-4 flex items-center justify-center gap-4 text-xs text-gray-400">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-green-500 rounded"></div>
              <span>Victory</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-red-500 rounded"></div>
              <span>Missed</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-gray-600 rounded"></div>
              <span>No Data</span>
            </div>
          </div>
        </TooltipProvider>
      </CardContent>
    </Card>
  )
}

export default JourneyMap
