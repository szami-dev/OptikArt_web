import { SEO, JSONLD } from "@/lib/seo";
import EventClient from "./EventClient";
export const metadata = SEO.event;

export default function EventPage() {
  return (
    <>
      <script type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(JSONLD.event) }}/>
      <EventClient />
    </>
  );
}