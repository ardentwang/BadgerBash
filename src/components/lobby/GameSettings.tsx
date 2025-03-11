"use client"

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { supabase } from '@/lib/supabase'

interface GameSettingsProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  lobby: any
}

export default function GameSettings({ lobby }: GameSettingsProps) {
  const [lobbyName, setLobbyName] = useState(lobby.name || 'New Lobby')
  const [isPublic, setIsPublic] = useState(lobby.is_public || false)
  const [isSaving, setIsSaving] = useState(false)
  
  const handleSaveSettings = async () => {
    setIsSaving(true)
    
    try {
      const { error } = await supabase
        .from('lobbies')
        .update({
          name: lobbyName,
          is_public: isPublic
        })
        .eq('lobby_code', lobby.lobby_code)
      
      if (error) {
        console.error('Error updating lobby settings:', error)
        alert('Failed to save settings')
      }
    } catch (err) {
      console.error('Error in save settings:', err)
      alert('An error occurred')
    } finally {
      setIsSaving(false)
    }
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Game Settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="lobby-name">Lobby Name</Label>
          <Input
            id="lobby-name"
            value={lobbyName}
            onChange={(e) => setLobbyName(e.target.value)}
            placeholder="Enter lobby name"
          />
        </div>
        
        <div className="flex items-center justify-between">
          <Label htmlFor="public-lobby">Public Lobby</Label>
          <Switch
            id="public-lobby"
            checked={isPublic}
            onCheckedChange={setIsPublic}
          />
        </div>
        
        <Button 
          onClick={handleSaveSettings} 
          disabled={isSaving}
          className="w-full"
        >
          {isSaving ? 'Saving...' : 'Save Settings'}
        </Button>
      </CardContent>
    </Card>
  )
}