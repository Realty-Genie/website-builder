import { getLandingDomainsCollection, getUsersCollection } from "./server/mongodb";
import { LandingPageDomain } from "@/types/domain";
import { ObjectId } from "mongodb";

export async function getSubdomain(subdomain: string): Promise<LandingPageDomain | null>{
    const landingDomainsCollection = await getLandingDomainsCollection();
    const subdomainData = await landingDomainsCollection.findOne({
        subdomain
    })
    return subdomainData as LandingPageDomain | null;
}
