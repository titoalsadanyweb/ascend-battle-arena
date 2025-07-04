
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import { User, Clock, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useProfile } from '@/lib/hooks/useProfile'
import { toast } from '@/hooks/use-toast'
import { TimezoneSelector } from './TimezoneSelector'

const onboardingSchema = z.object({
  username: z.string()
    .min(3, 'Username must be at least 3 characters')
    .max(20, 'Username must be at most 20 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
  timezone: z.string().min(1, 'Please select your timezone'),
})

type OnboardingFormData = z.infer<typeof onboardingSchema>

export const OnboardingForm = () => {
  const navigate = useNavigate()
  const { createProfile } = useProfile()
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<OnboardingFormData>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
    }
  })

  const onSubmit = async (data: OnboardingFormData) => {
    const { username, timezone } = data
    
    setIsLoading(true)
    try {
      createProfile(
        { username, timezone },
        {
          onSuccess: () => {
            toast({
              title: "Welcome to the Arena!",
              description: "Your battle station is ready. Time to declare your first victory!",
            })
            navigate('/')
          },
          onError: (error: any) => {
            let errorMessage = "Please try again."
            
            if (error.message && error.message.includes('already taken')) {
              errorMessage = "This username already exists. Please choose a different one."
            } else if (error.message) {
              errorMessage = error.message
            }
            
            toast({
              title: "Setup Failed",
              description: errorMessage,
              variant: "destructive",
            })
          }
        }
      )
    } catch (error: any) {
      let errorMessage = "Please try again."
      
      if (error.message && error.message.includes('already taken')) {
        errorMessage = "This username already exists. Please choose a different one."
      }
      
      toast({
        title: "Setup Failed",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="username" className="text-foreground flex items-center gap-2">
          <User className="h-4 w-4" />
          Warrior Name
        </Label>
        <Input
          id="username"
          placeholder="Choose your battle name"
          {...register('username')}
          className={`bg-background/50 border-border text-foreground placeholder:text-muted-foreground ${
            errors.username ? 'border-destructive' : ''
          }`}
        />
        {errors.username && (
          <p className="text-sm text-destructive">{errors.username.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="timezone" className="text-foreground flex items-center gap-2">
          <Clock className="h-4 w-4" />
          Your Timezone
        </Label>
        <TimezoneSelector
          value={watch('timezone')}
          onValueChange={(value) => setValue('timezone', value)}
          error={errors.timezone?.message}
        />
      </div>

      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
        <Button
          type="submit"
          className="w-full gradient-primary text-primary-foreground font-semibold"
          disabled={isLoading}
        >
          {isLoading ? (
            "Setting up your battle station..."
          ) : (
            <>
              Enter the Arena
              <ArrowRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </motion.div>
    </form>
  )
}
