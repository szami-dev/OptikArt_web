import { SEO, JSONLD } from "@/lib/seo";
import WeddingClient from "./WeddingClient";

export const metadata = SEO.wedding;

export default function WeddingPage() {
  return (
    <>
      <script type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(JSONLD.wedding) }}/>
      <WeddingClient />
    </>
  );
}
