'use client'

import { useEffect, useState } from 'react'

export default function GameDescription() {
  const descriptions = [
    "The ultimate badger-themed party game!",
    "Compete with friends in fun mini-games",
    "Play together and earn badges",
    "Create or join a game lobby to start"
  ]

  const [descriptionIndex, setDescriptionIndex] = useState(0)
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    // Animation timing
    const animationTimer = setInterval(() => {
      // First hide the text
      setIsVisible(false)
      
      // After it's hidden, change the text and show it again
      setTimeout(() => {
        setDescriptionIndex(prev => (prev + 1) % descriptions.length)
        setIsVisible(true)
      }, 500) // Time to wait after hiding before showing next description
      
    }, 4000) // Total time each description shows
    
    return () => clearInterval(animationTimer)
  }, [])

  return (
    <div className="h-16 flex items-center justify-center mb-12">
      <p 
        className={`text-foreground text-xl transition-all duration-500 ease-in-out ${
          isVisible 
            ? 'opacity-100 transform translate-y-0' 
            : 'opacity-0 transform -translate-y-4'
        }`}
      >
        {descriptions[descriptionIndex]}
      </p>
    </div>
  )
}