
import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '@/lib/AuthProvider'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Shield, Loader2, Moon, Sun } from 'lucide-react'
import { toast } from '@/hooks/use-toast'
import { useTheme } from '@/lib/ThemeProvider'
import { motion } from 'framer-motion'

const signUpSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

type SignUpFormData = z.infer<typeof signUpSchema>

const SignUpPage = () => {
  const { signUp } = useAuth()
  const { theme, setTheme } = useTheme()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [isLoading, setIsLoading] = useState(false)
  
  const fromAssessment = searchParams.get('fromAssessment') === 'true'

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
  })

  const onSubmit = async (data: SignUpFormData) => {
    setIsLoading(true)
    try {
      await signUp(data.email, data.password)
      toast({
        title: "Welcome to Ascend Arena!",
        description: "Check your email to verify your account, then return to complete your setup.",
      })
      // If they came from assessment, redirect to login with special flag
      if (fromAssessment) {
        navigate('/login?fromAssessment=true')
      } else {
        navigate('/login?newUser=true')
      }
    } catch (error: any) {
      toast({
        title: "Sign Up Failed",
        description: error.message || "Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-background flex items-center justify-center p-4">
      {/* Theme toggle */}
      <motion.div 
        className="absolute top-4 right-4"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="text-muted-foreground hover:text-foreground"
        >
          {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Card className="w-full max-w-md gradient-card border-primary/20 backdrop-blur-sm">
          <CardHeader className="text-center">
            <motion.div 
              className="flex justify-center mb-4"
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ duration: 0.3 }}
            >
              <Shield className="h-12 w-12 text-primary shield-glow" />
            </motion.div>
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              {fromAssessment ? 'Complete Your Recruitment' : 'Join Ascend Arena'}
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              {fromAssessment ? 'You\'re ready to begin your battle journey' : 'Begin your journey to self-mastery'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-foreground">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  {...register('email')}
                  className={`bg-background/50 border-border text-foreground placeholder:text-muted-foreground ${
                    errors.email ? 'border-destructive' : ''
                  }`}
                />
                {errors.email && (
                  <p className="text-sm text-destructive">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-foreground">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Create a strong password"
                  {...register('password')}
                  className={`bg-background/50 border-border text-foreground placeholder:text-muted-foreground ${
                    errors.password ? 'border-destructive' : ''
                  }`}
                />
                {errors.password && (
                  <p className="text-sm text-destructive">{errors.password.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-foreground">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm your password"
                  {...register('confirmPassword')}
                  className={`bg-background/50 border-border text-foreground placeholder:text-muted-foreground ${
                    errors.confirmPassword ? 'border-destructive' : ''
                  }`}
                />
                {errors.confirmPassword && (
                  <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
                )}
              </div>

              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  type="submit"
                  className="w-full gradient-primary text-primary-foreground font-semibold"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Joining Arena...
                    </>
                  ) : (
                    fromAssessment ? 'Enter the Arena' : 'Join the Battle'
                  )}
                </Button>
              </motion.div>
            </form>

            <div className="mt-6 text-center">
              <p className="text-muted-foreground">
                Already have an account?{' '}
                <Link 
                  to={fromAssessment ? "/login?fromAssessment=true" : "/login"} 
                  className="text-primary hover:text-primary/80 font-semibold transition-colors"
                >
                  Enter the Arena
                </Link>
              </p>
              
              <Link 
                to={fromAssessment ? "/assessment" : "/landing"} 
                className="text-muted-foreground hover:text-foreground text-sm transition-colors block mt-2"
              >
                ← {fromAssessment ? 'Back to assessment' : 'Back to landing'}
              </Link>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

export default SignUpPage
