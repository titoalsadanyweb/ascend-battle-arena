import React from 'react'
import { format } from 'date-fns'
import { useCheckIn } from '@/lib/hooks/useCheckIn'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Shield, XCircle } from 'lucide-react'

interface EditCheckInDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  checkIns: Array<{
    date: string
    status: 'victory' | 'defeat'
  }>
}

const EditCheckInDialog: React.FC<EditCheckInDialogProps> = ({
  open,
  onOpenChange,
  checkIns
}) => {
  const { checkIn, isCheckingIn } = useCheckIn()
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(new Date())
  const [showConfirmDialog, setShowConfirmDialog] = React.useState(false)
  const [pendingStatus, setPendingStatus] = React.useState<'victory' | 'defeat' | null>(null)

  const handleStatusChange = (status: 'victory' | 'defeat') => {
    if (!selectedDate) return
    setPendingStatus(status)
    setShowConfirmDialog(true)
  }

  const confirmStatusChange = async () => {
    if (!selectedDate || !pendingStatus) return
    
    try {
      await checkIn({
        status: pendingStatus,
        date: selectedDate.toISOString().split('T')[0],
        isEdit: true
      })
      setShowConfirmDialog(false)
      setPendingStatus(null)
      onOpenChange(false) // Close the main dialog after successful edit
    } catch (error) {
      console.error('Failed to update check-in:', error)
    }
  }

  const getCheckInStatus = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0]
    return checkIns.find(c => c.date === dateStr)?.status
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Past Check-ins</DialogTitle>
          <DialogDescription>
            Select a date to change its check-in status. You can edit check-ins from the last 30 days.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            disabled={(date) => {
              const thirtyDaysAgo = new Date()
              thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
              return date < thirtyDaysAgo || date > new Date()
            }}
            modifiers={{
              victory: (date) => getCheckInStatus(date) === 'victory',
              defeat: (date) => getCheckInStatus(date) === 'defeat'
            }}
            modifiersStyles={{
              victory: { backgroundColor: 'var(--ascend-success)', color: 'white' },
              defeat: { backgroundColor: 'var(--destructive)', color: 'white' }
            }}
          />
        </div>

        {selectedDate && (
          <div className="flex gap-3 justify-end">
            <Button
              variant="outline"
              onClick={() => handleStatusChange('victory')}
              disabled={isCheckingIn || getCheckInStatus(selectedDate) === 'victory'}
            >
              <Shield className="h-4 w-4 mr-2" />
              Mark as Victory
            </Button>
            <Button
              variant="outline"
              className="border-destructive/50 text-destructive hover:bg-destructive/10"
              onClick={() => handleStatusChange('defeat')}
              disabled={isCheckingIn || getCheckInStatus(selectedDate) === 'defeat'}
            >
              <XCircle className="h-4 w-4 mr-2" />
              Mark as Defeat
            </Button>
          </div>
        )}

        <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Status Change</DialogTitle>
              <DialogDescription>
                Are you sure you want to mark {selectedDate && format(selectedDate, 'MMMM do, yyyy')} as {pendingStatus}?
                This will affect your streak calculation.
              </DialogDescription>
            </DialogHeader>
            <div className="flex gap-3 justify-end mt-4">
              <Button
                variant="outline"
                onClick={() => setShowConfirmDialog(false)}
              >
                Cancel
              </Button>
              <Button
                variant={pendingStatus === 'victory' ? 'default' : 'destructive'}
                onClick={confirmStatusChange}
              >
                Confirm Change
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </DialogContent>
    </Dialog>
  )
}

export default EditCheckInDialog 