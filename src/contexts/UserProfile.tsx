
import { createContext, useContext } from "react";

interface GuestAccount{
    id: string
    name: string
    isHost: boolean
}

const id = GenerateUserID()

//should check for duplicates in da futura
//ideally could just check database for current length of users + 1 for new id, depends on wut database
function GenerateUserID() {
    return (Math.random() + 1).toString(36).substring(7)
}

//add User account with authentication later
const UserProfile = createContext<GuestAccount>({
    id: id,
    isHost: false,
    name: 'BadgerBash# ' + id
})

export function useProfile(){
    return useContext(UserProfile)
}
