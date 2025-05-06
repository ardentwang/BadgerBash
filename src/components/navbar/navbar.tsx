import { useState } from "react"
import { useAuth } from "@/context/AuthContext"
import { Button } from "@/components/ui/button"
import SignInModal from "@/components/signinmodal"
import SignUpModal from "@/components/signupmodal"
import { supabase } from "@/lib/supabase"
import AvatarSelector from "./AvatarSelector"
import Image from "next/image"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"

const NavBar = () => {
  const { user, isGuest, isLoading } = useAuth()
  const [isSignInModalOpen, setIsSignInModalOpen] = useState(false)
  const [isSignUpModalOpen, setIsSignUpModalOpen] = useState(false)
  const [showAvatarSelector, setShowAvatarSelector] = useState(false)
  const [isUsernameModalOpen, setIsUsernameModalOpen] = useState(false)
  const [newUsername, setNewUsername] = useState("")
  const [isUpdating, setIsUpdating] = useState(false)

  const handleAvatarChange = async (newAvatar: string) => {
    const { error } = await supabase.auth.updateUser({
      data: { avatar_url: newAvatar }
    })

    if (!error) {
      setShowAvatarSelector(false)
      window.location.reload() // You can use context-based update instead if preferred
    } else {
      console.error("Failed to update avatar:", error.message)
    }
  }

  const handleUsernameUpdate = async () => {
    if (!user || !newUsername.trim()) return;
    
    setIsUpdating(true);
    try {
      // Update auth metadata
      const { error: authError } = await supabase.auth.updateUser({
        data: { username: newUsername.trim() }
      });
      
      if (authError) {
        console.error("Error updating auth metadata:", authError);
        return;
      }
      
      // Update users table
      const { error: dbError } = await supabase
        .from('users')
        .update({ username: newUsername.trim() })
        .eq('id', user.id);
        
      if (dbError) {
        console.error("Error updating username in database:", dbError);
        return;
      }
      
      // Successful update
      setIsUsernameModalOpen(false);
      window.location.reload(); // Reload to reflect changes
      
    } catch (error) {
      console.error("Error changing username:", error);
    } finally {
      setIsUpdating(false);
    }
  }

  const username = user?.user_metadata?.username || "User"
  const avatarUrl = user?.user_metadata?.avatar_url || "/avatars/student.png"

  return (
    <div className="fixed flex w-full items-center justify-between mt-5 px-5">
      <div className="flex-shrink-0" />

      <div className="flex items-center space-x-4">
        {isLoading ? (
          <div>Loading...</div>
        ) : user ? (
          <div className="flex items-center gap-4">
            {isGuest && (
              <span className="text-sm bg-amber-100 text-amber-800 px-2 py-1 rounded-full">
                Guest
              </span>
            )}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  className="flex items-center gap-2 h-10 px-3 focus:outline-none focus-visible:ring-0 focus:ring-0"
                >
                  <div className="w-8 h-8 rounded-full overflow-hidden relative">
                    <Image 
                      src={avatarUrl}
                      alt="User avatar" 
                      width={32}
                      height={32}
                      className="object-cover"
                    />
                  </div>
                  <span>{username}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setShowAvatarSelector(true)}>
                  Change Avatar
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setIsUsernameModalOpen(true)}>
                  Change Username
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ) : (
          <>
            <Button 
              variant="outline" 
              size="default"
              onClick={() => setIsSignInModalOpen(true)}
            >
              Sign In
            </Button>
            
            <Button 
              variant="default" 
              size="default"
              onClick={() => setIsSignUpModalOpen(true)}
            >
              Sign Up
            </Button>
          </>
        )}
      </div>

      <SignInModal 
        isOpen={isSignInModalOpen} 
        onClose={() => setIsSignInModalOpen(false)} 
      />
      
      <SignUpModal 
        isOpen={isSignUpModalOpen} 
        onClose={() => setIsSignUpModalOpen(false)} 
      />

      {showAvatarSelector && (
        <div className="fixed inset-0 z-40" onClick={() => setShowAvatarSelector(false)}>
          <div 
            className="absolute top-20 right-4 z-50 bg-white p-4 rounded-xl shadow-lg border w-72"
            onClick={(e) => e.stopPropagation()} // Prevent clicks inside from closing
          >
            <h3 className="font-semibold mb-2 text-lg">Choose an Avatar</h3>
            <AvatarSelector
              currentAvatar={avatarUrl}
              onSelect={handleAvatarChange}
              onClose={() => setShowAvatarSelector(false)}
            />
            <Button
              variant="ghost"
              className="mt-3 w-full bg-red-100 hover:bg-red-200 text-red-800"
              onClick={() => setShowAvatarSelector(false)}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Username Change Modal */}
      <Dialog open={isUsernameModalOpen} onOpenChange={setIsUsernameModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Username</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Input
              type="text"
              placeholder="Enter new username"
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
              className="w-full"
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsUsernameModalOpen(false)}
              disabled={isUpdating}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUsernameUpdate}
              disabled={isUpdating || !newUsername.trim()}
            >
              {isUpdating ? "Updating..." : "Update"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default NavBar