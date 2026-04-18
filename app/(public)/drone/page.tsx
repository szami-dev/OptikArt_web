import { SEO, JSONLD } from "@/lib/seo";
import DroneClient     from "./DroneClient";

export const metadata = SEO.drone;

export default function DronePage() {
  return (
    <>
      <script type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(JSONLD.drone) }}/>
      <DroneClient />
    </>
  );
}
