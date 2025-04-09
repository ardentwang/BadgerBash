"use client"
import { useAuth } from "@/context/AuthContext"

const Test = () => {
    const user = useAuth()
    const userId = user.user?.id
    const userName = user.user?.user_metadata.username
    const userProfile = user.user?.user_metadata.avatar_url
    const userInformation = {
        userId,
        userName,
        userProfile
    }
    console.log(userInformation)

    return(
        <div>Hello World</div>
    )
}

export default Test;