import { SEO, JSONLD } from "@/lib/seo";
import PortraitClient from "./PortraitClient";

export const metadata = SEO.portrait;

export default function PortraitPage() {
  return (
    <>
      <script type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(JSONLD.portrait) }}/>
      <PortraitClient />
    </>
  );
}
