import { getLandingDomainsCollection } from "@/lib/server/mongodb";
import { NextResponse } from "next/server";


export const POST = async (req: Request) => {

    const {realtorId, code, subdomain, widgets} = await req.json();
    // console.log(realtorId,code,subdomain,widgets)
    const landingDomainsCollection = await getLandingDomainsCollection();
    const existingDomain = await landingDomainsCollection.findOne({
        realtorId
    })
    if(existingDomain){
        await landingDomainsCollection.updateOne(
            {realtorId},
            {$set: {code, subdomain, widgets}}
        )
    }else{
        await landingDomainsCollection.insertOne({
            realtorId,
            code,
            subdomain,
            widgets
        })
    }
    return NextResponse.json({success: true})
}