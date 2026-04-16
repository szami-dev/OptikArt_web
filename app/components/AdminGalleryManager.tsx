"use client";

// app/components/AdminGalleryManager.tsx
// ÚJ: Cover photo kijelölés – hosszan tartott kattintás vagy dedicated cover gomb

import { useState, useCallback, useRef } from "react";

type GalleryImage = {
  id: number;
  publicId: string;
  thumbnailUrl: string;
  previewUrl: string;
  fileName: string | null;
  width: number | null;
  height: number | null;
  bytes: number | null;
};
type GalleryVideo = {
  id: number;
  publicId: string;
  streamUrl: string;
  thumbnailUrl: string | null;
  fileName: string | null;
  bytes: number | null;
  duration: number | null;
};
type Gallery = {
  id: number;
  title: string | null;
  description: string | null;
  coverImageUrl: string | null;
  isPublic: boolean;
  hasPassword: boolean;
  expiresAt: string | null;
  shareToken: string;
  googleDriveUrl: string | null;
  images: GalleryImage[];
  videos: GalleryVideo[];
  _count?: { images: number };
};
type UploadItem = {
  id: string;
  file: File;
  type: "image" | "video";
  status: "pending" | "uploading" | "done" | "error";
  progress: number;
  error?: string;
};

function formatBytes(b: number) {
  if (b < 1024) return `${b} B`;
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`;
  return `${(b / (1024 * 1024)).toFixed(1)} MB`;
}
function formatDuration(s: number) {
  const m = Math.floor(s / 60),
    sec = Math.floor(s % 60);
  return `${m}:${String(sec).padStart(2, "0")}`;
}
function getCloudinaryUrl(url: string, t: string) {
  return url.replace("/upload/", `/upload/${t}/`);
}

async function uploadToCloudinary(
  file: File,
  resourceType: "image" | "video",
  onProgress: (pct: number) => void,
) {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!;
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!;
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", uploadPreset);
  formData.append(
    "folder",
    resourceType === "video" ? "gallery_videos" : "galleries",
  );
  return new Promise<any>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open(
      "POST",
      `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`,
    );
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable)
        onProgress(Math.round((e.loaded / e.total) * 100));
    };
    xhr.onload = () =>
      xhr.status === 200
        ? resolve(JSON.parse(xhr.responseText))
        : reject(new Error(xhr.statusText));
    xhr.onerror = () => reject(new Error("Network error"));
    xhr.send(formData);
  });
}

function Lightbox({
  images,
  index,
  onClose,
  onPrev,
  onNext,
}: {
  images: GalleryImage[];
  index: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}) {
  const img = images[index];
  if (!img) return null;
  return (
    <div
      className="fixed inset-0 z-[300] bg-black/95 flex items-center justify-center"
      onClick={onClose}
    >
      <button
        onClick={(e) => {
          e.stopPropagation();
          onPrev();
        }}
        className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 border border-white/20 flex items-center justify-center text-white/60 hover:text-white transition-all z-10"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          className="w-5 h-5"
        >
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </button>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onNext();
        }}
        className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 border border-white/20 flex items-center justify-center text-white/60 hover:text-white transition-all z-10"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          className="w-5 h-5"
        >
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </button>
      <button
        onClick={onClose}
        className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center text-white/50 hover:text-white"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          className="w-5 h-5"
        >
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
      <div
        className="relative max-w-5xl max-h-[85vh] mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={img.previewUrl}
          alt={img.fileName ?? ""}
          className="max-h-[85vh] max-w-full object-contain"
        />
        <div className="absolute bottom-0 left-0 right-0 bg-black/60 px-4 py-2 flex items-center justify-between">
          <span className="text-[11px] text-white/60">{img.fileName}</span>
          <span className="text-[11px] text-white/40">
            {index + 1} / {images.length}
          </span>
        </div>
      </div>
    </div>
  );
}

export default function AdminGalleryManager({
  projectId,
  projectName,
  clientEmail,
  clientName,
  initialGallery,
  onGalleryCreated,
  onSent,
}: {
  projectId: number;
  projectName?: string;
  clientEmail?: string | null;
  clientName?: string | null;
  initialGallery?: Gallery | null;
  onGalleryCreated?: (gallery: Gallery) => void;
  onSent?: () => void;
}) {
  const [gallery, setGallery] = useState<Gallery | null>(
    initialGallery ?? null,
  );
  const [images, setImages] = useState<GalleryImage[]>(
    initialGallery?.images ?? [],
  );
  const [videos, setVideos] = useState<GalleryVideo[]>(
    initialGallery?.videos ?? [],
  );
  const [uploads, setUploads] = useState<UploadItem[]>([]);
  const [lightbox, setLightbox] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<"photos" | "videos">("photos");
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [settingCover, setSettingCover] = useState<number | null>(null);
  const [deletingImg, setDeletingImg] = useState<number | null>(null);
  const [deletingVid, setDeletingVid] = useState<number | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [sendModal, setSendModal] = useState(false);
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState("");

  const imgRef = useRef<HTMLInputElement>(null);
  const vidRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState(initialGallery?.title ?? "");
  const [desc, setDesc] = useState(initialGallery?.description ?? "");
  const [isPublic, setIsPublic] = useState(initialGallery?.isPublic ?? false);
  const [password, setPassword] = useState("");
  const [removePass, setRemovePass] = useState(false);
  const [expiresAt, setExpiresAt] = useState(
    initialGallery?.expiresAt?.slice(0, 10) ?? "",
  );
  const [driveUrl, setDriveUrl] = useState(
    initialGallery?.googleDriveUrl ?? "",
  );

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  // ── Cover photo beállítása ─────────────────────────────────
  async function handleSetCover(img: GalleryImage) {
    if (!gallery) return;
    const isCurrent = gallery.coverImageUrl === img.previewUrl;
    setSettingCover(img.id);
    try {
      const res = await fetch(`/api/galleries/${gallery.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          // Ha már ez a cover, töröljük (toggle)
          coverImageUrl: isCurrent ? null : img.previewUrl,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setGallery((prev) =>
        prev ? { ...prev, coverImageUrl: data.gallery.coverImageUrl } : prev,
      );
      showToast(isCurrent ? "Cover törölve" : "Cover photo beállítva!");
    } catch (e: any) {
      showToast(`Hiba: ${e.message}`);
    } finally {
      setSettingCover(null);
    }
  }

  // ── Galéria küldése ────────────────────────────────────────
  async function handleSendGallery() {
    if (!gallery || !clientEmail) return;
    setSending(true);
    setSendError("");
    try {
      const res = await fetch(`/api/galleries/${gallery.id}/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientEmail,
          clientName: clientName ?? "Ügyfelünk",
          projectName: projectName ?? "projekt",
          galleryUrl: `${window.location.origin}/gallery/${gallery.shareToken}`,
          hasPassword: gallery.hasPassword,
        }),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      setSendModal(false);
      showToast("Galéria értesítő elküldve!");
      onSent?.();
    } catch (e: any) {
      setSendError(e.message);
    } finally {
      setSending(false);
    }
  }

  // ── Galéria létrehozása ────────────────────────────────────
  async function handleCreate() {
    setCreating(true);
    try {
      const res = await fetch("/api/galleries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId,
          title,
          description: desc,
          isPublic,
          password: password || null,
          expiresAt: expiresAt || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setGallery(data.gallery);
      setImages([]);
      setVideos([]);
      onGalleryCreated?.(data.gallery);
      showToast("Galéria létrehozva!");
    } catch (e: any) {
      showToast(`Hiba: ${e.message}`);
    } finally {
      setCreating(false);
    }
  }

  // ── Galéria mentése ────────────────────────────────────────
  async function handleSave() {
    if (!gallery) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/galleries/${gallery.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description: desc,
          isPublic,
          password: password || undefined,
          removePassword: removePass,
          expiresAt: expiresAt || null,
          googleDriveUrl: driveUrl || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setGallery(data.gallery);
      setEditing(false);
      setPassword("");
      showToast("Galéria mentve!");
    } catch (e: any) {
      showToast(`Hiba: ${e.message}`);
    } finally {
      setSaving(false);
    }
  }

  // ── Képek feltöltése ───────────────────────────────────────
  const handleImageFiles = useCallback(
    async (files: FileList | File[]) => {
      if (!gallery) return;
      const arr = Array.from(files);
      const items: UploadItem[] = arr.map((f) => ({
        id: `${f.name}-${Date.now()}-${Math.random()}`,
        file: f,
        type: "image",
        status: "pending",
        progress: 0,
      }));
      setUploads((prev) => [...prev, ...items]);
      const results: any[] = [];
      for (const item of items) {
        setUploads((prev) =>
          prev.map((u) =>
            u.id === item.id ? { ...u, status: "uploading" } : u,
          ),
        );
        try {
          const r = await uploadToCloudinary(item.file, "image", (pct) =>
            setUploads((prev) =>
              prev.map((u) => (u.id === item.id ? { ...u, progress: pct } : u)),
            ),
          );
          results.push(r);
          setUploads((prev) =>
            prev.map((u) =>
              u.id === item.id ? { ...u, status: "done", progress: 100 } : u,
            ),
          );
        } catch (e: any) {
          setUploads((prev) =>
            prev.map((u) =>
              u.id === item.id
                ? { ...u, status: "error", error: e.message }
                : u,
            ),
          );
        }
      }
      if (!results.length) return;
      try {
        const res = await fetch(`/api/galleries/${gallery.id}/images`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            images: results.map((r) => ({
              publicId: r.public_id,
              originalUrl: r.secure_url,
              thumbnailUrl: getCloudinaryUrl(
                r.secure_url,
                "c_fill,h_400,w_400,g_auto,q_auto,f_auto",
              ),
              previewUrl: getCloudinaryUrl(
                r.secure_url,
                "c_limit,w_1200,h_900,q_auto,f_auto",
              ),
              fileName: r.original_filename,
              width: r.width,
              height: r.height,
              bytes: r.bytes,
            })),
          }),
        });
        if (!res.ok) throw new Error("DB mentés sikertelen");
        const gRes = await fetch(`/api/galleries/${gallery.id}`);
        const gData = await gRes.json();
        setImages(gData.gallery.images ?? []);
        setTimeout(() => setUploads([]), 2000);
        showToast(`${results.length} kép feltöltve!`);
      } catch (e: any) {
        showToast(`DB hiba: ${e.message}`);
      }
    },
    [gallery],
  );

  // ── Videók feltöltése ──────────────────────────────────────
  const handleVideoFiles = useCallback(
    async (files: FileList | File[]) => {
      if (!gallery) return;
      const arr = Array.from(files);
      const items: UploadItem[] = arr.map((f) => ({
        id: `${f.name}-${Date.now()}-${Math.random()}`,
        file: f,
        type: "video",
        status: "pending",
        progress: 0,
      }));
      setUploads((prev) => [...prev, ...items]);
      const results: any[] = [];
      for (const item of items) {
        setUploads((prev) =>
          prev.map((u) =>
            u.id === item.id ? { ...u, status: "uploading" } : u,
          ),
        );
        try {
          const r = await uploadToCloudinary(item.file, "video", (pct) =>
            setUploads((prev) =>
              prev.map((u) => (u.id === item.id ? { ...u, progress: pct } : u)),
            ),
          );
          results.push(r);
          setUploads((prev) =>
            prev.map((u) =>
              u.id === item.id ? { ...u, status: "done", progress: 100 } : u,
            ),
          );
        } catch (e: any) {
          setUploads((prev) =>
            prev.map((u) =>
              u.id === item.id
                ? { ...u, status: "error", error: e.message }
                : u,
            ),
          );
        }
      }
      if (!results.length) return;
      try {
        const res = await fetch(`/api/galleries/${gallery.id}/videos`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            videos: results.map((r) => ({
              publicId: r.public_id,
              originalUrl: r.secure_url,
              streamUrl: r.secure_url,
              thumbnailUrl: r.secure_url.replace(
                "/upload/",
                "/upload/so_0,f_jpg,q_auto,w_400/",
              ),
              fileName: r.original_filename + "." + r.format,
              bytes: r.bytes,
              duration: r.duration ?? null,
              width: r.width ?? null,
              height: r.height ?? null,
              format: r.format ?? null,
            })),
          }),
        });
        if (!res.ok) throw new Error("Videó DB mentés sikertelen");
        const gData = await res.json();
        setVideos(gData.gallery?.videos ?? []);
        setTimeout(() => setUploads([]), 2000);
        showToast(`${results.length} videó feltöltve!`);
      } catch (e: any) {
        showToast(`DB hiba: ${e.message}`);
      }
    },
    [gallery],
  );

  const [dragOver, setDragOver] = useState(false);
  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      handleImageFiles(e.dataTransfer.files);
    },
    [handleImageFiles],
  );

  async function handleDeleteImage(imageId: number) {
    if (!gallery) return;
    setDeletingImg(imageId);
    try {
      const res = await fetch(`/api/galleries/${gallery.id}/images`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageId }),
      });
      if (!res.ok) throw new Error();
      // Ha a törölt kép volt a cover, töröljük azt is
      if (
        gallery.coverImageUrl &&
        images.find((i) => i.id === imageId)?.previewUrl ===
          gallery.coverImageUrl
      ) {
        await fetch(`/api/galleries/${gallery.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ coverImageUrl: null }),
        });
        setGallery((prev) => (prev ? { ...prev, coverImageUrl: null } : prev));
      }
      setImages((prev) => prev.filter((i) => i.id !== imageId));
      showToast("Kép törölve");
    } catch {
      showToast("Törlési hiba");
    } finally {
      setDeletingImg(null);
    }
  }

  async function handleDeleteVideo(videoId: number) {
    if (!gallery) return;
    setDeletingVid(videoId);
    try {
      const res = await fetch(`/api/galleries/${gallery.id}/videos`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ videoId }),
      });
      if (!res.ok) throw new Error();
      setVideos((prev) => prev.filter((v) => v.id !== videoId));
      showToast("Videó törölve");
    } catch {
      showToast("Törlési hiba");
    } finally {
      setDeletingVid(null);
    }
  }

  function copyShareLink() {
    if (!gallery) return;
    navigator.clipboard.writeText(
      `${window.location.origin}/gallery/${gallery.shareToken}`,
    );
    showToast("Link másolva!");
  }

  const shareUrl = gallery
    ? `${typeof window !== "undefined" ? window.location.origin : ""}/gallery/${gallery.shareToken}`
    : "";

  return (
    <div className="flex flex-col gap-4">
      {/* Toast */}
      {toast && (
        <div className="fixed bottom-4 right-4 z-[200] bg-[#0E0C0A] border border-[#C8A882]/30 text-[#D4C4B0] px-4 py-3 text-[13px] flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[#C8A882]" />
          {toast}
        </div>
      )}

      {lightbox !== null && (
        <Lightbox
          images={images}
          index={lightbox}
          onClose={() => setLightbox(null)}
          onPrev={() => setLightbox((i) => Math.max(0, (i ?? 0) - 1))}
          onNext={() =>
            setLightbox((i) => Math.min(images.length - 1, (i ?? 0) + 1))
          }
        />
      )}

      {/* Küldés modal */}
      {sendModal && (
        <div
          className="fixed inset-0 z-[150] flex items-center justify-center"
          onClick={() => setSendModal(false)}
        >
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
          <div
            className="relative z-10 w-full max-w-sm mx-4 bg-[#0E0C0A] border border-white/[0.08] p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-3 mb-5">
              <div className="w-9 h-9 border border-[#C8A882]/30 flex items-center justify-center shrink-0 text-[#C8A882]">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  className="w-4 h-4"
                >
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
              </div>
              <div>
                <div className="text-[13px] text-[#D4C4B0] mb-1">
                  Galéria küldése az ügyfélnek?
                </div>
                {clientEmail && (
                  <div className="text-[11px] text-[#C8A882]/60">
                    → {clientEmail}
                  </div>
                )}
                {!clientEmail && (
                  <div className="text-[11px] text-red-400/70 mt-1">
                    ⚠ Nincs hozzárendelt ügyfél
                  </div>
                )}
                {gallery?.hasPassword && (
                  <div className="text-[11px] text-[#FBBF24]/70 mt-1.5">
                    🔒 A galéria jelszóvédett
                  </div>
                )}
              </div>
            </div>
            {sendError && (
              <div className="mb-4 px-3 py-2 bg-red-500/10 border border-red-500/20 text-[11px] text-red-400">
                {sendError}
              </div>
            )}
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setSendModal(false);
                  setSendError("");
                }}
                className="flex-1 py-2.5 border border-white/[0.08] text-[11px] text-[#5A5248] hover:text-[#D4C4B0] transition-all"
              >
                Mégsem
              </button>
              <button
                onClick={handleSendGallery}
                disabled={sending || !clientEmail}
                className="flex-1 py-2.5 bg-[#C8A882] text-[11px] tracking-[0.1em] uppercase text-[#0C0A08] font-medium hover:bg-[#D4B892] transition-all disabled:opacity-50"
              >
                {sending ? "Küldés..." : "Küldés megerősítése"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Nincs galéria ── */}
      {!gallery && (
        <div className="bg-[#0E0C0A] border border-white/[0.05] p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-4 h-px bg-[#C8A882]/40" />
            <span className="text-[9px] tracking-[0.2em] uppercase text-[#C8A882]/50">
              Új galéria
            </span>
          </div>
          <div className="flex flex-col gap-3">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Galéria neve (opcionális)"
              className="w-full bg-[#141210] border border-white/[0.08] text-[13px] text-[#D4C4B0] placeholder:text-[#3A3530] px-3 py-2.5 focus:outline-none focus:border-[#C8A882]/40"
            />
            <textarea
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              rows={2}
              placeholder="Leírás (opcionális)"
              className="w-full bg-[#141210] border border-white/[0.08] text-[13px] text-[#D4C4B0] placeholder:text-[#3A3530] px-3 py-2.5 focus:outline-none focus:border-[#C8A882]/40 resize-none"
            />
            <div className="grid grid-cols-2 gap-3">
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                placeholder="Jelszó (opcionális)"
                className="bg-[#141210] border border-white/[0.08] text-[13px] text-[#D4C4B0] placeholder:text-[#3A3530] px-3 py-2.5 focus:outline-none focus:border-[#C8A882]/40"
              />
              <input
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
                type="date"
                className="bg-[#141210] border border-white/[0.08] text-[13px] text-[#D4C4B0] px-3 py-2.5 focus:outline-none focus:border-[#C8A882]/40"
                style={{ colorScheme: "dark" }}
              />
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <div
                onClick={() => setIsPublic((v) => !v)}
                className={`w-10 h-5 rounded-full transition-colors relative ${isPublic ? "bg-[#C8A882]" : "bg-white/[0.08]"}`}
              >
                <div
                  className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${isPublic ? "translate-x-5" : "translate-x-0.5"}`}
                />
              </div>
              <span className="text-[12px] text-[#5A5248]">
                Publikusan megosztható
              </span>
            </label>
            <button
              onClick={handleCreate}
              disabled={creating}
              className="py-2.5 bg-[#C8A882] text-[11px] tracking-[0.12em] uppercase text-[#0C0A08] font-medium hover:bg-[#D4B892] transition-all disabled:opacity-50"
            >
              {creating ? "Létrehozás..." : "Galéria létrehozása"}
            </button>
          </div>
        </div>
      )}

      {/* ── Van galéria ── */}
      {gallery && (
        <>
          {/* ── Cover photo előnézet ── */}
          {gallery.coverImageUrl && (
            <div className="relative bg-[#0E0C0A] border border-white/[0.05] overflow-hidden">
              <div className="relative h-48 sm:h-64">
                <img
                  src={gallery.coverImageUrl}
                  alt="Cover"
                  className="w-full h-full object-cover opacity-70"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0C0A08] via-transparent to-transparent" />
                <div className="absolute bottom-3 left-4 flex items-center gap-2">
                  <span className="text-[9px] tracking-[0.16em] uppercase text-[#C8A882]/70 border border-[#C8A882]/30 bg-[#C8A882]/10 px-2 py-1">
                    ✦ Cover photo
                  </span>
                </div>
                <button
                  onClick={() =>
                    handleSetCover({
                      id: -1,
                      previewUrl: gallery.coverImageUrl!,
                    } as any)
                  }
                  className="absolute top-3 right-3 w-7 h-7 bg-black/60 flex items-center justify-center text-white/50 hover:text-red-400 transition-colors"
                  title="Cover törlése"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    className="w-3.5 h-3.5"
                  >
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
            </div>
          )}

          {/* Fejléc */}
          <div className="bg-[#0E0C0A] border border-white/[0.05] p-5">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-4 h-px bg-[#C8A882]/40" />
                  <span className="text-[9px] tracking-[0.2em] uppercase text-[#C8A882]/50">
                    Galéria
                  </span>
                </div>
                <div className="text-[15px] text-[#D4C4B0]">
                  {gallery.title ?? "Névtelen galéria"}
                </div>
                <div className="text-[11px] text-[#3A3530] mt-0.5 flex items-center gap-2 flex-wrap">
                  <span>{images.length} kép</span>
                  {videos.length > 0 && <span>· {videos.length} videó</span>}
                  {gallery.coverImageUrl && (
                    <span className="text-[#C8A882]/50">
                      · ✦ Cover beállítva
                    </span>
                  )}
                  {gallery.hasPassword && (
                    <span className="text-[#FBBF24]">🔒 Jelszóvédett</span>
                  )}
                  {gallery.isPublic && (
                    <span className="text-[#34D399]">🌐 Publikus</span>
                  )}
                  {gallery.expiresAt && (
                    <span className="text-[#F87171]">
                      ⏰ Lejár:{" "}
                      {new Date(gallery.expiresAt).toLocaleDateString("hu-HU")}
                    </span>
                  )}
                  {gallery.googleDriveUrl && (
                    <span className="text-[#60A5FA]">📁 Drive</span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => setSendModal(true)}
                  className="flex items-center gap-2 px-3 py-2 border border-[#C8A882]/30 text-[11px] tracking-[0.08em] uppercase text-[#C8A882]/70 hover:text-[#C8A882] hover:border-[#C8A882]/50 hover:bg-[#C8A882]/5 transition-all"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    className="w-3.5 h-3.5"
                  >
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22,6 12,13 2,6" />
                  </svg>
                  Küldés ügyfélnek
                </button>
                {gallery.isPublic && (
                  <button
                    onClick={copyShareLink}
                    className="flex items-center gap-2 px-3 py-2 border border-[#34D399]/20 text-[11px] tracking-[0.08em] uppercase text-[#34D399]/70 hover:text-[#34D399] hover:border-[#34D399]/40 transition-all"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      className="w-3.5 h-3.5"
                    >
                      <circle cx="18" cy="5" r="3" />
                      <circle cx="6" cy="12" r="3" />
                      <circle cx="18" cy="19" r="3" />
                      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                      <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                    </svg>
                    Megosztás
                  </button>
                )}
                <button
                  onClick={() => setEditing((v) => !v)}
                  className="flex items-center gap-2 px-3 py-2 border border-white/[0.08] text-[11px] tracking-[0.08em] uppercase text-[#5A5248] hover:text-[#C8A882] hover:border-[#C8A882]/30 transition-all"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    className="w-3.5 h-3.5"
                  >
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                  Szerkesztés
                </button>
              </div>
            </div>

            {gallery.isPublic && (
              <div className="mt-4 pt-4 border-t border-white/[0.04] flex items-center gap-2">
                <code className="flex-1 text-[10px] text-[#3A3530] truncate">
                  {shareUrl}
                </code>
                <button
                  onClick={copyShareLink}
                  className="text-[10px] text-[#C8A882]/60 hover:text-[#C8A882] transition-colors whitespace-nowrap"
                >
                  Másolás
                </button>
              </div>
            )}

            {/* Szerkesztő */}
            {editing && (
              <div className="mt-4 pt-4 border-t border-white/[0.04] flex flex-col gap-3">
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Galéria neve"
                  className="w-full bg-[#141210] border border-white/[0.08] text-[13px] text-[#D4C4B0] placeholder:text-[#3A3530] px-3 py-2.5 focus:outline-none focus:border-[#C8A882]/40"
                />
                <textarea
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  rows={2}
                  placeholder="Leírás"
                  className="w-full bg-[#141210] border border-white/[0.08] text-[13px] text-[#D4C4B0] placeholder:text-[#3A3530] px-3 py-2.5 focus:outline-none focus:border-[#C8A882]/40 resize-none"
                />
                <div className="grid grid-cols-2 gap-3">
                  <input
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    type="password"
                    placeholder={
                      gallery.hasPassword
                        ? "Új jelszó (hagyd üresen)"
                        : "Jelszó hozzáadása"
                    }
                    className="bg-[#141210] border border-white/[0.08] text-[13px] text-[#D4C4B0] placeholder:text-[#3A3530] px-3 py-2.5 focus:outline-none focus:border-[#C8A882]/40"
                  />
                  <input
                    value={expiresAt}
                    onChange={(e) => setExpiresAt(e.target.value)}
                    type="date"
                    className="bg-[#141210] border border-white/[0.08] text-[13px] text-[#D4C4B0] px-3 py-2.5 focus:outline-none focus:border-[#C8A882]/40"
                    style={{ colorScheme: "dark" }}
                  />
                </div>
                <div>
                  <div className="text-[9px] tracking-[0.12em] uppercase text-[#3A3530] mb-1.5">
                    Google Drive archív link (opcionális)
                  </div>
                  <input
                    value={driveUrl}
                    onChange={(e) => setDriveUrl(e.target.value)}
                    placeholder="https://drive.google.com/drive/folders/..."
                    className="w-full bg-[#141210] border border-white/[0.08] text-[13px] text-[#D4C4B0] placeholder:text-[#3A3530] px-3 py-2.5 focus:outline-none focus:border-[#60A5FA]/40"
                  />
                </div>
                <div className="flex items-center gap-4 flex-wrap">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <div
                      onClick={() => setIsPublic((v) => !v)}
                      className={`w-10 h-5 rounded-full transition-colors relative ${isPublic ? "bg-[#C8A882]" : "bg-white/[0.08]"}`}
                    >
                      <div
                        className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${isPublic ? "translate-x-5" : "translate-x-0.5"}`}
                      />
                    </div>
                    <span className="text-[12px] text-[#5A5248]">
                      Publikusan megosztható
                    </span>
                  </label>
                  {gallery.hasPassword && (
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={removePass}
                        onChange={(e) => setRemovePass(e.target.checked)}
                        className="accent-[#F87171]"
                      />
                      <span className="text-[12px] text-[#F87171]">
                        Jelszó eltávolítása
                      </span>
                    </label>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setEditing(false)}
                    className="flex-1 py-2 border border-white/[0.08] text-[11px] text-[#5A5248] hover:text-[#D4C4B0] transition-all"
                  >
                    Mégsem
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex-1 py-2 bg-[#C8A882] text-[11px] tracking-[0.1em] uppercase text-[#0C0A08] font-medium hover:bg-[#D4B892] transition-all disabled:opacity-50"
                  >
                    {saving ? "Mentés..." : "Mentés"}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Tab + feltöltés */}
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex border border-white/[0.06]">
              <button
                onClick={() => setActiveTab("photos")}
                className={`px-4 py-2 text-[10px] tracking-[0.1em] uppercase transition-all border-r border-white/[0.04] ${activeTab === "photos" ? "bg-[#C8A882]/15 text-[#C8A882]" : "text-[#3A3530] hover:text-[#5A5248]"}`}
              >
                Fotók ({images.length})
              </button>
              <button
                onClick={() => setActiveTab("videos")}
                className={`px-4 py-2 text-[10px] tracking-[0.1em] uppercase transition-all ${activeTab === "videos" ? "bg-[#C8A882]/15 text-[#C8A882]" : "text-[#3A3530] hover:text-[#5A5248]"}`}
              >
                Videók ({videos.length})
              </button>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => imgRef.current?.click()}
                className="flex items-center gap-2 px-3 py-2 border border-white/[0.08] text-[11px] tracking-[0.08em] uppercase text-[#5A5248] hover:text-[#C8A882] hover:border-[#C8A882]/30 transition-all"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  className="w-3.5 h-3.5"
                >
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
                Képek
              </button>
              <button
                onClick={() => vidRef.current?.click()}
                className="flex items-center gap-2 px-3 py-2 border border-white/[0.08] text-[11px] tracking-[0.08em] uppercase text-[#5A5248] hover:text-[#C8A882] hover:border-[#C8A882]/30 transition-all"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  className="w-3.5 h-3.5"
                >
                  <polygon points="23 7 16 12 23 17 23 7" />
                  <rect x="1" y="5" width="15" height="14" rx="2" />
                </svg>
                Videók
              </button>
            </div>
          </div>
          <input
            ref={imgRef}
            type="file"
            multiple
            accept="image/*"
            className="hidden"
            onChange={(e) => e.target.files && handleImageFiles(e.target.files)}
          />
          <input
            ref={vidRef}
            type="file"
            multiple
            accept="video/*"
            className="hidden"
            onChange={(e) => e.target.files && handleVideoFiles(e.target.files)}
          />

          {/* Drag & drop zóna */}
          {activeTab === "photos" && (
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => imgRef.current?.click()}
              className={`border-2 border-dashed p-6 text-center cursor-pointer transition-all ${dragOver ? "border-[#C8A882]/60 bg-[#C8A882]/5" : "border-white/[0.08] hover:border-white/[0.14] hover:bg-white/[0.02]"}`}
            >
              <p className="text-[12px] text-[#5A5248]">
                Húzd ide a képeket vagy kattints
              </p>
              <p className="text-[10px] text-[#3A3530] mt-1">
                JPG, PNG, WebP · Max 20 MB / kép
              </p>
            </div>
          )}

          {/* Upload progress */}
          {uploads.length > 0 && (
            <div className="bg-[#0E0C0A] border border-white/[0.05] p-4 flex flex-col gap-2">
              <div className="text-[9px] tracking-[0.16em] uppercase text-[#3A3530] mb-1">
                Feltöltés folyamatban
              </div>
              {uploads.map((u) => (
                <div key={u.id} className="flex items-center gap-3">
                  <span className="text-[10px] text-[#3A3530] shrink-0">
                    {u.type === "video" ? "🎬" : "🖼"}
                  </span>
                  <span className="text-[11px] text-[#5A5248] truncate flex-1">
                    {u.file.name}
                  </span>
                  <div className="w-24 h-1 bg-white/[0.06] shrink-0">
                    <div
                      className="h-full transition-all"
                      style={{
                        width: `${u.progress}%`,
                        background:
                          u.status === "error"
                            ? "#F87171"
                            : u.status === "done"
                              ? "#34D399"
                              : "#C8A882",
                      }}
                    />
                  </div>
                  <span
                    className="text-[10px] shrink-0"
                    style={{
                      color:
                        u.status === "error"
                          ? "#F87171"
                          : u.status === "done"
                            ? "#34D399"
                            : "#5A5248",
                    }}
                  >
                    {u.status === "error"
                      ? "❌"
                      : u.status === "done"
                        ? "✓"
                        : `${u.progress}%`}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* ── Képek grid – cover kijelöléssel ── */}
          {activeTab === "photos" && images.length > 0 && (
            <>
              <div className="flex items-center gap-2 text-[10px] text-[#3A3530]">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  className="w-3.5 h-3.5 text-[#C8A882]/50"
                >
                  <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                  <polyline points="10 17 15 12 10 7" />
                  <line x1="15" y1="12" x2="3" y2="12" />
                </svg>
                Hover a képre → cover jelölő gomb jelenik meg
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-1.5">
                {images.map((img, i) => {
                  const isCover = gallery.coverImageUrl === img.previewUrl;
                  return (
                    <div
                      key={img.id}
                      className={`group relative bg-[#141210] overflow-hidden ${isCover ? "ring-2 ring-[#C8A882]" : ""}`}
                      style={{ aspectRatio: "1/1" }}
                    >
                      <img
                        src={img.thumbnailUrl}
                        alt={img.fileName ?? ""}
                        loading="lazy"
                        className="w-full h-full object-cover cursor-pointer transition-all group-hover:scale-105 group-hover:opacity-70"
                        onClick={() => setLightbox(i)}
                      />

                      {/* Cover badge ha be van állítva */}
                      {isCover && (
                        <div className="absolute top-1 left-1 bg-[#C8A882] text-[#0C0A08] text-[7px] tracking-[0.1em] uppercase px-1.5 py-0.5 font-medium">
                          ✦ Cover
                        </div>
                      )}

                      {/* Hover overlay */}
                      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1.5 bg-black/50">
                        {/* Cover toggle gomb */}
                        <button
                          onClick={() => handleSetCover(img)}
                          disabled={settingCover === img.id}
                          title={
                            isCover ? "Cover törlése" : "Beállítás covernek"
                          }
                          className={`flex items-center gap-1 px-2 py-1 text-[9px] tracking-[0.08em] uppercase transition-all ${
                            isCover
                              ? "bg-[#C8A882] text-[#0C0A08]"
                              : "bg-white/20 text-white hover:bg-[#C8A882] hover:text-[#0C0A08]"
                          }`}
                        >
                          {settingCover === img.id ? (
                            <div className="w-2.5 h-2.5 border border-current/40 border-t-current rounded-full animate-spin" />
                          ) : (
                            <svg
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              className="w-2.5 h-2.5"
                            >
                              <rect x="3" y="3" width="18" height="18" rx="2" />
                              <circle cx="8.5" cy="8.5" r="1.5" />
                              <polyline points="21 15 16 10 5 21" />
                            </svg>
                          )}
                          {isCover ? "Cover" : "Cover"}
                        </button>

                        {/* Lightbox + törlés */}
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => setLightbox(i)}
                            className="w-7 h-7 bg-white/10 flex items-center justify-center hover:bg-white/20"
                          >
                            <svg
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="white"
                              strokeWidth="1.5"
                              className="w-4 h-4"
                            >
                              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                              <circle cx="12" cy="12" r="3" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDeleteImage(img.id)}
                            disabled={deletingImg === img.id}
                            className="w-7 h-7 bg-red-500/20 flex items-center justify-center hover:bg-red-500/40"
                          >
                            {deletingImg === img.id ? (
                              <div className="w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                              <svg
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="white"
                                strokeWidth="1.5"
                                className="w-4 h-4"
                              >
                                <polyline points="3 6 5 6 21 6" />
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                              </svg>
                            )}
                          </button>
                        </div>
                      </div>

                      {img.bytes && (
                        <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-[8px] text-white/50 px-1.5 py-0.5 text-center opacity-0 group-hover:opacity-100 transition-opacity">
                          {formatBytes(img.bytes)}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {/* Videók lista */}
          {activeTab === "videos" && (
            <div className="flex flex-col gap-2">
              {videos.length === 0 && uploads.length === 0 && (
                <div className="text-center py-8 border border-dashed border-white/[0.06]">
                  <p className="text-[12px] text-[#3A3530]">Még nincs videó</p>
                  <button
                    onClick={() => vidRef.current?.click()}
                    className="mt-3 text-[11px] text-[#C8A882]/60 hover:text-[#C8A882] transition-colors"
                  >
                    + Videók hozzáadása
                  </button>
                </div>
              )}
              {videos.map((v) => (
                <div
                  key={v.id}
                  className="flex items-center gap-3 bg-[#0E0C0A] border border-white/[0.05] p-3"
                >
                  <div className="w-16 h-12 bg-[#141210] shrink-0 overflow-hidden">
                    {v.thumbnailUrl ? (
                      <img
                        src={v.thumbnailUrl}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="#C8A882"
                          strokeWidth="1"
                          className="w-6 h-6 opacity-40"
                        >
                          <polygon points="5 3 19 12 5 21 5 3" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[12px] text-[#D4C4B0] truncate">
                      {v.fileName ?? "videó"}
                    </div>
                    <div className="text-[10px] text-[#3A3530] flex items-center gap-2 mt-0.5">
                      {v.bytes && <span>{formatBytes(v.bytes)}</span>}
                      {v.duration && (
                        <span>· {formatDuration(v.duration)}</span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteVideo(v.id)}
                    disabled={deletingVid === v.id}
                    className="shrink-0 px-3 py-1.5 border border-red-500/20 text-[10px] text-red-400/60 hover:text-red-400 hover:border-red-500/40 transition-all disabled:opacity-50"
                  >
                    {deletingVid === v.id ? "..." : "Töröl"}
                  </button>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
