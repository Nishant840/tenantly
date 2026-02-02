"use client"

import { useRouter } from "next/navigation";
import { useState } from "react"

export default function OnboardingPage(){
    const [name,setName] = useState("");
    const [slug,setSlug] = useState("")
    const router = useRouter();

    async function handleSubmit(e: React.FormEvent){
        e.preventDefault();

        const res = await fetch("/api/organizations",{
            method: "POST",
            headers: {"Content-type":"application/json"},
            body: JSON.stringify({name,slug}),
        });

        if(res.ok){
            router.push("/dashboard");
        }
        else{
            alert("Failed to create organization");
        }
    }
    return(
        <form onSubmit={handleSubmit}>
            <h1>Create Organization</h1>
            <br />
            <input placeholder="Organization name" 
                   value={name}
                   onChange={(e)=>{setName(e.target.value)}} 
            />
            <br />
            <input placeholder="Slug"
                   value={slug}
                   onChange={(e)=>{setSlug(e.target.value)}}
            />
            <br />
            <button type="submit" >Create</button>
        </form>
    )
}