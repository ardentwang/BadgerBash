import {
    InputOTP,
    InputOTPGroup,
    InputOTPSeparator,
    InputOTPSlot,
  } from "@/components/ui/input-otp"
import { 
    Tabs, 
    TabsContent, 
    TabsList, 
    TabsTrigger 
} from "@/components/ui/tabs"
import { ChevronLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"


export default function Lobby () {
    return(
        <div>
            <Button className="absolute mt-5 ml-5" variant="outline" size="icon" asChild>
                <Link href="/">
                    <ChevronLeft />
                </Link>
            </Button>
            <div className="absolute top-1/4 left-1/2 transform -translate-x-1/2">
                <Tabs className="w-full max-w-md">
                    <TabsList>
                        <TabsTrigger value="public">Public Lobbies</TabsTrigger>
                        <TabsTrigger value="private">Private Lobbies</TabsTrigger>
                    </TabsList>
                    <TabsContent value="public">
                        {/* List of available game lobbies */}
                    </TabsContent>
                    <TabsContent value="private" className="absolute flex flex-col">
                        <div className="mb-5">Please enter the 6 digit code provided to the owner of the private lobby</div>
                        <InputOTP maxLength={6}>
                            <InputOTPGroup>
                                <InputOTPSlot index={0} />
                                <InputOTPSlot index={1} />
                                <InputOTPSlot index={2} />
                            </InputOTPGroup>
                            <InputOTPSeparator />
                            <InputOTPGroup>
                                <InputOTPSlot index={3} />
                                <InputOTPSlot index={4} />
                                <InputOTPSlot index={5} />
                            </InputOTPGroup>
                        </InputOTP>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    )
}