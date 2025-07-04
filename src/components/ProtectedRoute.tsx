
import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/lib/AuthProvider'
import { useProfile } from '@/lib/hooks/useProfile'
import { Loader2 } from 'lucide-react'

interface ProtectedRouteProps {
  children: React.ReactNode
  requireProfile?: boolean
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requireProfile = true 
}) => {
  const { user, loading: authLoading } = useAuth()
  const { profile, isLoading: profileLoading } = useProfile()
  const location = useLocation()

  console.log('ProtectedRoute debug:', { 
    user: !!user, 
    profile: !!profile, 
    requireProfile, 
    currentPath: location.pathname,
    authLoading,
    profileLoading 
  })

  // Show loading spinner while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-amber-500" />
          <p className="text-slate-300">Checking authentication...</p>
        </div>
      </div>
    )
  }

  // Redirect to landing page if not authenticated
  if (!user) {
    return <Navigate to="/landing" state={{ from: location }} replace />
  }

  // Show loading while fetching profile data (only if profile is required)
  if (requireProfile && profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-amber-500" />
          <p className="text-slate-300">Loading your battle station...</p>
        </div>
      </div>
    )
  }

  // Redirect to onboarding if profile is required but doesn't exist
  if (requireProfile && !profile && location.pathname !== '/onboarding') {
    console.log('Redirecting to onboarding - no profile found')
    return <Navigate to="/onboarding" replace />
  }

  // If user has profile but tries to access onboarding, redirect to dashboard
  if (profile && location.pathname === '/onboarding') {
    console.log('Redirecting to dashboard - user already has profile')
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}

export default ProtectedRoute
