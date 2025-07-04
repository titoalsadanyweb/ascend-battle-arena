
import React from 'react'
import { Button } from '@/components/ui/button'
import { useCheckIn } from '@/lib/hooks/useCheckIn'
import { Shield, CheckCircle, Loader2 } from 'lucide-react'

interface CheckInButtonProps {
  hasCheckedInToday: boolean
  currentStreak: number
}

const CheckInButton: React.FC<CheckInButtonProps> = ({ 
  hasCheckedInToday, 
  currentStreak 
}) => {
  const { checkIn, isCheckingIn } = useCheckIn()

  if (hasCheckedInToday) {
    return (
      <Button 
        disabled 
        size="lg" 
        className="w-full bg-green-600 hover:bg-green-600"
      >
        <CheckCircle className="mr-2 h-5 w-5" />
        Victory Declared Today!
      </Button>
    )
  }

  return (
    <Button 
      onClick={() => checkIn()}
      disabled={isCheckingIn}
      size="lg"
      className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold"
    >
      {isCheckingIn ? (
        <>
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          Declaring Victory...
        </>
      ) : (
        <>
          <Shield className="mr-2 h-5 w-5" />
          Declare Victory Today
        </>
      )}
    </Button>
  )
}

export default CheckInButton
