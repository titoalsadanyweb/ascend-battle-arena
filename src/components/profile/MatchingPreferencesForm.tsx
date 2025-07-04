import React from 'react'
import { UseFormReturn } from 'react-hook-form'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { X, Plus, Users, AlertCircle } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface MatchingPreferencesFormProps {
  form: UseFormReturn<any>
  profile: any
}

const LANGUAGES = [
  'English', 'Spanish', 'French', 'German', 'Portuguese', 'Italian', 
  'Russian', 'Japanese', 'Korean', 'Chinese', 'Arabic', 'Hindi', 
  'Dutch', 'Swedish', 'Norwegian', 'Danish', 'Finnish', 'Polish',
  'Turkish', 'Greek', 'Hebrew', 'Czech', 'Hungarian', 'Romanian'
]

const RELIGIONS = [
  'Christian', 'Catholic', 'Protestant', 'Orthodox', 'Muslim', 'Jewish', 
  'Buddhist', 'Hindu', 'Sikh', 'Shinto', 'Other', 'Spiritual but not religious'
]

const COUNTRIES = [
  'United States', 'Canada', 'United Kingdom', 'Australia', 'Germany', 
  'France', 'Spain', 'Italy', 'Netherlands', 'Sweden', 'Norway', 'Denmark',
  'Brazil', 'Mexico', 'Argentina', 'Japan', 'South Korea', 'India', 'Other'
]

export const MatchingPreferencesForm: React.FC<MatchingPreferencesFormProps> = ({ form, profile }) => {
  const [selectedLanguages, setSelectedLanguages] = React.useState<string[]>(
    profile?.preferred_languages || ['English']
  )
  const [selectedReligions, setSelectedReligions] = React.useState<string[]>(
    profile?.preferred_religions || []
  )
  const [selectedCountries, setSelectedCountries] = React.useState<string[]>(
    profile?.preferred_countries || []
  )

  const isLookingForAlly = form.watch('looking_for_ally')

  const addLanguage = (language: string) => {
    if (!selectedLanguages.includes(language)) {
      const updated = [...selectedLanguages, language]
      setSelectedLanguages(updated)
      form.setValue('preferred_languages', updated)
    }
  }

  const removeLanguage = (language: string) => {
    const updated = selectedLanguages.filter(l => l !== language)
    setSelectedLanguages(updated)
    form.setValue('preferred_languages', updated)
  }

  const addReligion = (religion: string) => {
    if (!selectedReligions.includes(religion)) {
      const updated = [...selectedReligions, religion]
      setSelectedReligions(updated)
      form.setValue('preferred_religions', updated)
    }
  }

  const removeReligion = (religion: string) => {
    const updated = selectedReligions.filter(r => r !== religion)
    setSelectedReligions(updated)
    form.setValue('preferred_religions', updated)
  }

  const addCountry = (country: string) => {
    if (!selectedCountries.includes(country)) {
      const updated = [...selectedCountries, country]
      setSelectedCountries(updated)
      form.setValue('preferred_countries', updated)
    }
  }

  const removeCountry = (country: string) => {
    const updated = selectedCountries.filter(c => c !== country)
    setSelectedCountries(updated)
    form.setValue('preferred_countries', updated)
  }

  return (
    <Card className="bg-gradient-card border-ascend-secondary/20 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-ascend-secondary">Battle Ally Matching Preferences</CardTitle>
        <CardDescription>
          Help us find the perfect battle allies for you (all fields are optional)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Battle Ally Status - Make this prominent */}
        <Alert className={`${isLookingForAlly ? 'border-green-500 bg-green-50 dark:bg-green-950' : 'border-orange-500 bg-orange-50 dark:bg-orange-950'}`}>
          <Users className={`h-4 w-4 ${isLookingForAlly ? 'text-green-600' : 'text-orange-600'}`} />
          <AlertDescription className="flex items-center justify-between">
            <div>
              <strong>{isLookingForAlly ? 'Active Battle Ally Seeker' : 'Not Currently Seeking Allies'}</strong>
              <p className="text-sm mt-1">
                {isLookingForAlly 
                  ? 'Your profile will be visible to other warriors looking for battle allies.'
                  : 'You won\'t appear in ally searches. Enable this to connect with other warriors.'
                }
              </p>
            </div>
            <Checkbox 
              checked={isLookingForAlly !== false}
              onCheckedChange={(checked) => form.setValue('looking_for_ally', checked)}
              className="ml-4"
            />
          </AlertDescription>
        </Alert>

        {/* Personal Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="language">Your Primary Language</Label>
            <Select 
              onValueChange={(value) => form.setValue('language', value)} 
              defaultValue={profile?.language || 'English'}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select your language" />
              </SelectTrigger>
              <SelectContent>
                {LANGUAGES.map((lang) => (
                  <SelectItem key={lang} value={lang}>{lang}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="secondary_language">Secondary Language (Optional)</Label>
            <Select 
              onValueChange={(value) => form.setValue('secondary_language', value === 'none' ? null : value)} 
              defaultValue={profile?.secondary_language || 'none'}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select secondary language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No secondary language</SelectItem>
                {LANGUAGES.map((lang) => (
                  <SelectItem key={lang} value={lang}>{lang}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="country">Your Country</Label>
            <Select 
              onValueChange={(value) => form.setValue('country', value === 'prefer-not-to-say' ? null : value)} 
              defaultValue={profile?.country || 'prefer-not-to-say'}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select your country" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                {COUNTRIES.map((country) => (
                  <SelectItem key={country} value={country}>{country}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="religion">Your Religion/Beliefs</Label>
            <Select 
              onValueChange={(value) => form.setValue('religion', value === 'prefer-not-to-say' ? null : value)} 
              defaultValue={profile?.religion || 'prefer-not-to-say'}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select your religion/beliefs" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                <SelectItem value="none">No religion/Atheist</SelectItem>
                {RELIGIONS.map((religion) => (
                  <SelectItem key={religion} value={religion}>{religion}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="bio">Bio (Optional)</Label>
          <Textarea
            id="bio"
            placeholder="Tell potential allies a bit about yourself, your goals, or what motivates you..."
            {...form.register('bio')}
            rows={3}
          />
        </div>

        {/* Matching Preferences - Only show when looking for allies */}
        {isLookingForAlly && (
          <div className="space-y-4 pt-4 border-t border-border/50">
            <h4 className="font-medium text-ascend-accent">Ally Matching Preferences</h4>
            
            <div className="space-y-2">
              <Label>Preferred Languages for Allies</Label>
              <div className="flex flex-wrap gap-2 mb-2">
                {selectedLanguages.map((lang) => (
                  <Badge key={lang} variant="secondary" className="gap-1">
                    {lang}
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-auto p-0 w-4 h-4"
                      onClick={() => removeLanguage(lang)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
              <Select onValueChange={addLanguage}>
                <SelectTrigger>
                  <SelectValue placeholder="Add preferred languages..." />
                </SelectTrigger>
                <SelectContent>
                  {LANGUAGES.filter(lang => !selectedLanguages.includes(lang)).map((lang) => (
                    <SelectItem key={lang} value={lang}>{lang}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Preferred Religions/Beliefs for Allies</Label>
              <div className="flex flex-wrap gap-2 mb-2">
                {selectedReligions.map((religion) => (
                  <Badge key={religion} variant="secondary" className="gap-1">
                    {religion}
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-auto p-0 w-4 h-4"
                      onClick={() => removeReligion(religion)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
                {selectedReligions.length === 0 && (
                  <span className="text-sm text-muted-foreground">No preference - all beliefs welcome</span>
                )}
              </div>
              <Select onValueChange={addReligion}>
                <SelectTrigger>
                  <SelectValue placeholder="Add preferred religions/beliefs..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No religion/Atheist</SelectItem>
                  {RELIGIONS.filter(religion => !selectedReligions.includes(religion)).map((religion) => (
                    <SelectItem key={religion} value={religion}>{religion}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Nationality Preference</Label>
              <Select 
                onValueChange={(value) => form.setValue('nationality_preference', value)} 
                defaultValue={profile?.nationality_preference || 'no_preference'}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="no_preference">No preference - any country</SelectItem>
                  <SelectItem value="same_country">Prefer allies from my country</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Preferred Countries for Allies (if specific preference)</Label>
              <div className="flex flex-wrap gap-2 mb-2">
                {selectedCountries.map((country) => (
                  <Badge key={country} variant="secondary" className="gap-1">
                    {country}
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-auto p-0 w-4 h-4"
                      onClick={() => removeCountry(country)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
                {selectedCountries.length === 0 && (
                  <span className="text-sm text-muted-foreground">No preference - any country</span>
                )}
              </div>
              <Select onValueChange={addCountry}>
                <SelectTrigger>
                  <SelectValue placeholder="Add preferred countries..." />
                </SelectTrigger>
                <SelectContent>
                  {COUNTRIES.filter(country => !selectedCountries.includes(country)).map((country) => (
                    <SelectItem key={country} value={country}>{country}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {!isLookingForAlly && (
          <Alert className="border-blue-500 bg-blue-50 dark:bg-blue-950">
            <AlertCircle className="h-4 w-4 text-blue-600" />
            <AlertDescription>
              <strong>Want to find battle allies?</strong> Enable "I'm looking for battle allies" above to access matching preferences and connect with other warriors on their journey.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  )
}

export default MatchingPreferencesForm
