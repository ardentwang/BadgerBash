"use client"

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

const NavBar = () => {
  const { user, isGuest, isLoading } = useAuth()
  const [isSignInModalOpen, setIsSignInModalOpen] = useState(false)
  const [isSignUpModalOpen, setIsSignUpModalOpen] = useState(false)
  const [showAvatarSelector, setShowAvatarSelector] = useState(false)

  const handleSignOut = async () => {
    await supabase.auth.signOut()
  }

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
                <Button variant="ghost" className="flex items-center gap-2 h-10 px-3">
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
                {isGuest ? (
                  <>
                    <DropdownMenuItem onClick={() => setIsSignUpModalOpen(true)}>
                      Create Full Account
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setIsSignInModalOpen(true)}>
                      Sign In with Existing Account
                    </DropdownMenuItem>
                  </>
                ) : (
                  <DropdownMenuItem onClick={handleSignOut}>
                    Sign Out
                  </DropdownMenuItem>
                )}
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
        <div className="absolute top-20 right-4 z-50 bg-white p-4 rounded-xl shadow-lg border w-72">
          <h3 className="font-semibold mb-2 text-lg">Choose an Avatar</h3>
          <AvatarSelector
            currentAvatar={avatarUrl}
            onSelect={handleAvatarChange}
          />
          <Button
            variant="ghost"
            className="mt-3 w-full"
            onClick={() => setShowAvatarSelector(false)}
          >
            Cancel
          </Button>
        </div>
      )}
    </div>
  )
}

export default NavBar