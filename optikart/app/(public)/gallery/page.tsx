import Button from "@/app/components/Button";
import ButtonShowcase from "@/app/components/Button"
export default function GalleryPage() {
  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold mb-4">My Gallery</h1>
      <p className="text-lg mb-6">
        Explore your collection of photos and manage your gallery settings.
      </p>
      <Button variant="outline">
      Küldés
    </Button>
  
      </div>
  );
}
