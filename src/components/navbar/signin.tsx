"use client"
import { useEffect, useState } from "react"
import { Button } from "../ui/button"

const SignIn = () => {
    const [loading, setLoading] = useState(false)

    useEffect(() =>{
        
    })

    return (
        <div>
            <Button 
                variant="default" 
                size="default"
            >
                Sign In
            </Button>
        </div>
    )
}

export default SignIn