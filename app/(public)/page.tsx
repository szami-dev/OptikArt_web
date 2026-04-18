import { SEO, JSONLD } from "@/lib/seo";
import LandingPage from "./HomeClient";
export const metadata = SEO.home;

export default function HomePage() {
  return (
    <>
      <script type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(JSONLD.localBusiness) }}/>
      <LandingPage />
    </>
  );
}
