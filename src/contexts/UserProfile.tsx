
import { createContext, useContext } from "react";

interface GuestAccount{
    id: string
    name: string
    isHost: boolean
}

const id = GenerateUserID()

//should check for duplicates
//ideally could just check database for current length of users + 1 for new id
function GenerateUserID() {
    return (Math.random() + 1).toString(36).substring(7)
}

//Add User account with authentication later
const UserProfile = createContext<GuestAccount>({
    id: id,
    isHost: false,
    name: 'BadgerBash# ' + id
})

export function useProfile(){
    return useContext(UserProfile)
}