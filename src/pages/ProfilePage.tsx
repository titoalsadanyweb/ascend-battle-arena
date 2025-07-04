
import React, { useState } from 'react'
import { AppLayout } from '@/components/layout/AppLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { User, MapPin, Globe, Heart, Pencil, Save, X } from 'lucide-react'
import { motion } from 'framer-motion'
import { useProfile } from '@/lib/hooks/useProfile'
import { toast } from '@/hooks/use-toast'

const ProfilePage: React.FC = () => {
  const { profile, updateProfile, isUpdating } = useProfile()
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    bio: profile?.bio || '',
    language: profile?.language || 'English',
    secondary_language: profile?.secondary_language || '',
    religion: profile?.religion || '',
    country: profile?.country || '',
  })

  const handleSave = async () => {
    try {
      await updateProfile(formData)
      setIsEditing(false)
      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated.",
      })
    } catch (error) {
      toast({
        title: "Update Failed",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleCancel = () => {
    setFormData({
      bio: profile?.bio || '',
      language: profile?.language || 'English',
      secondary_language: profile?.secondary_language || '',
      religion: profile?.religion || '',
      country: profile?.country || '',
    })
    setIsEditing(false)
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
                <User className="h-8 w-8 text-primary" />
                Warrior Profile
              </h1>
              <p className="text-muted-foreground mt-2">
                Manage your profile and preferences
              </p>
            </div>
            <Button
              onClick={() => setIsEditing(!isEditing)}
              variant={isEditing ? "outline" : "default"}
              className="gap-2"
            >
              {isEditing ? (
                <>
                  <X className="h-4 w-4" />
                  Cancel
                </>
              ) : (
                <>
                  <Pencil className="h-4 w-4" />
                  Edit Profile
                </>
              )}
            </Button>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Summary */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <Card>
              <CardHeader className="text-center">
                <Avatar className="h-24 w-24 mx-auto mb-4">
                  <AvatarFallback className="bg-primary/10 text-primary text-2xl font-bold">
                    {profile?.username?.charAt(0)?.toUpperCase() || 'W'}
                  </AvatarFallback>
                </Avatar>
                <CardTitle className="text-xl">{profile?.username || 'Warrior'}</CardTitle>
                <CardDescription>
                  Joined {new Date(profile?.created_at || '').toLocaleDateString()}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="p-3 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {profile?.current_streak || 0}
                    </div>
                    <div className="text-sm text-green-700">Current Streak</div>
                  </div>
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {profile?.best_streak || 0}
                    </div>
                    <div className="text-sm text-blue-700">Best Streak</div>
                  </div>
                </div>
                <div className="p-3 bg-amber-50 rounded-lg text-center">
                  <div className="text-2xl font-bold text-amber-600">
                    {profile?.token_balance || 0}
                  </div>
                  <div className="text-sm text-amber-700">Valor Shards</div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Profile Details */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-2"
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Profile Information
                </CardTitle>
                <CardDescription>
                  Your profile helps others find compatible Battle Allies
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {isEditing ? (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="bio">Bio</Label>
                      <Textarea
                        id="bio"
                        placeholder="Tell others about your journey..."
                        value={formData.bio}
                        onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                        className="min-h-[100px]"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="language">Primary Language</Label>
                        <Select 
                          value={formData.language} 
                          onValueChange={(value) => setFormData({ ...formData, language: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="English">English</SelectItem>
                            <SelectItem value="Spanish">Spanish</SelectItem>
                            <SelectItem value="French">French</SelectItem>
                            <SelectItem value="German">German</SelectItem>
                            <SelectItem value="Portuguese">Portuguese</SelectItem>
                            <SelectItem value="Arabic">Arabic</SelectItem>
                            <SelectItem value="Mandarin">Mandarin</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="secondary_language">Secondary Language</Label>
                        <Input
                          id="secondary_language"
                          placeholder="Optional"
                          value={formData.secondary_language}
                          onChange={(e) => setFormData({ ...formData, secondary_language: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="country">Country</Label>
                        <Input
                          id="country"
                          placeholder="Your country"
                          value={formData.country}
                          onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="religion">Religion/Faith (Optional)</Label>
                        <Input
                          id="religion"
                          placeholder="Optional"
                          value={formData.religion}
                          onChange={(e) => setFormData({ ...formData, religion: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <Button onClick={handleSave} disabled={isUpdating} className="gap-2">
                        <Save className="h-4 w-4" />
                        {isUpdating ? 'Saving...' : 'Save Changes'}
                      </Button>
                      <Button variant="outline" onClick={handleCancel}>
                        Cancel
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="space-y-6">
                    {profile?.bio && (
                      <div>
                        <h3 className="font-medium mb-2">Bio</h3>
                        <p className="text-muted-foreground">{profile.bio}</p>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="flex items-center gap-2">
                          <Globe className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">Languages</span>
                        </div>
                        <div className="space-y-1">
                          <p>{profile?.language || 'English'}</p>
                          {profile?.secondary_language && (
                            <p className="text-sm text-muted-foreground">
                              {profile.secondary_language}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">Location</span>
                        </div>
                        <p>{profile?.country || 'Not specified'}</p>
                      </div>
                    </div>

                    {profile?.religion && (
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Heart className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">Faith</span>
                        </div>
                        <p>{profile.religion}</p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </AppLayout>
  )
}

export default ProfilePage
