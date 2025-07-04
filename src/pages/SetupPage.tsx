
import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Shield, Database, Key, CheckCircle } from 'lucide-react'

const SetupPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Shield className="h-12 w-12 text-blue-600" />
          </div>
          <CardTitle className="text-2xl font-bold">Ascend Arena Setup</CardTitle>
          <CardDescription>
            Complete the setup to begin your battle for self-mastery
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h3 className="font-semibold text-yellow-800 mb-2">Setup Required</h3>
            <p className="text-yellow-700 text-sm">
              To use Ascend Arena, you need to configure your Supabase backend. Follow the steps below to get started.
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <Database className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-semibold">1. Set up Supabase Project</h4>
                <p className="text-sm text-gray-600">
                  Create a new project at <a href="https://supabase.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">supabase.com</a>
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Key className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-semibold">2. Configure Environment Variables</h4>
                <p className="text-sm text-gray-600 mb-2">
                  Create a <code className="bg-gray-100 px-1 rounded">.env.local</code> file in your project root with:
                </p>
                <div className="bg-gray-900 text-green-400 p-3 rounded text-xs font-mono">
                  VITE_SUPABASE_URL=your_supabase_project_url<br />
                  VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
                </div>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-semibold">3. Set up Database Schema</h4>
                <p className="text-sm text-gray-600">
                  Run the provided SQL migrations in your Supabase SQL editor to create the required tables.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-800 mb-2">Need Help?</h3>
            <p className="text-blue-700 text-sm">
              Check the README.md file for detailed setup instructions, or visit the 
              <a href="https://docs.lovable.dev/integrations/supabase/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline ml-1">
                Supabase integration documentation
              </a>.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default SetupPage
