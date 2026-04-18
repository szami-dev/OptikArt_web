import { SEO, JSONLD }  from "@/lib/seo";
import MarketingClient from "./MarketingClient";

export const metadata = SEO.marketing;

export default function MarketingPage() {
  return (
    <>
      <script type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(JSONLD.marketing) }}/>
      <MarketingClient />
    </>
  );
}
