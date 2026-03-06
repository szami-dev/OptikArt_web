//shadcn
'use client'
import { Button } from "@/components/ui/button";
import {Card, CardHeader, CardDescription, CardContent, CardTitle} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";

import {FaGithub} from "react-icons/fa"
import {FcGoogle} from "react-icons/fc"
import Link from "next/dist/client/link";

export default function SignIn() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#1b0918] rounded-none">
        <Card className="md:h-auto w-full md:w-[400px] p-4 sm:p-8">
            <CardHeader>
                <CardTitle className="text-center">Login</CardTitle>
                <CardDescription className="text-sm text-center text-accent-foreground">Sign up to start using OptikArt</CardDescription>
                
            </CardHeader>
            <CardContent className="px-2 sm:px-6">
                <form action='' className="space-y-3">
                    
                    <Input 
                        placeholder="Email address" 
                        type="email" 
                        disabled={false} 
                        value={""} 
                        onChange={() => {}} 
                        required
                    />
                    <Input 
                        placeholder="Password" 
                        type="password" 
                        disabled={false} 
                        value={""} 
                        onChange={() => {}} 
                        required
                    />
                    <Button disabled={false} size="lg" className="w-full">Sign In</Button>

                </form>
                <Separator />
                <div className="flex my-2 justify-evenly mx-auto items-center" >

                    <Button disabled={false} variant="outline" onClick={() => {}} size="lg" className="bg-slate-300 hover:gb-slate-400 hover:scale-110">
                        <FcGoogle className="size-8 left-2.5 top 2.5"/>
                    </Button>
                    <Button disabled={false} variant="outline" onClick={() => {}} size="lg" className="bg-slate-300 hover:gb-slate-400 hover:scale-110">
                        <FaGithub className="size-8 left-2.5 top 2.5"/>
                    </Button>
                    
                </div>
                <p className="text-sm text-muted-foreground text-center">Create new account? <Link className="p-0 text-sm font-medium" href="sign-up">Sign Up</Link></p>
            </CardContent>
        </Card>
    </div>
  );
}