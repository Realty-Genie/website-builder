import { Domain } from "@/components/domain";
import { LandingRenderer } from "@/components/LandingRenderer";
import { getSubdomain } from "@/lib/getSubdomain";
import { LandingPageDomain } from "@/types/domain";

export default async function ({
  params,
}: {
  params: Promise<{ subdomain: string }>;
}) {
  const { subdomain } = await params;
  const subdomainData: LandingPageDomain | null = await getSubdomain(subdomain);
  if (!subdomainData) {
    return <div>Subdomain not found</div>;
  }

  return (
    <>
      <Domain>
        {subdomainData.widgets ? (
          <LandingRenderer
            widgets={subdomainData.widgets}
            realtorId={subdomainData.realtorId}
          />
        ) : (
          <div className="flex h-screen items-center justify-center">
            <div className="text-center">
              <h2 className="mb-2 text-2xl font-semibold">
                Missing JSON Configuration
              </h2>
              <p className="text-slate-500">
                This landing page was generated without widget JSON data. Please
                re-publish it from the builder.
              </p>
            </div>
          </div>
        )}
      </Domain>
    </>
  );
}
