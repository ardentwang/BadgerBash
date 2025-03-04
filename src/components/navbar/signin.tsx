"use client"
import { useState } from "react"
import { FC } from "react"
import { Button } from "../ui/button"
import SignInModal from "../signinmodal"

const SignIn: FC = () => {
    const [loading] = useState(false)
    const [isModalOpen, setIsModalOpen] = useState(false)

    const openModal = () => {
        setIsModalOpen(true)
    }

    const closeModal = () => {
        setIsModalOpen(false)
    }

    return (
        <div>
            <Button 
                variant="default" 
                size="default"
                onClick={openModal}
                disabled={loading}
            >
                {loading ? "Loading..." : "Sign In"}
            </Button>
            
            <SignInModal 
                isOpen={isModalOpen} 
                onClose={closeModal} 
            />
        </div>
    )
}

export default SignIn