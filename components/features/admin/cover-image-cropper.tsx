"use client";

import { useCallback, useState } from "react";
import Cropper, { type Area } from "react-easy-crop";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTitle, useLastNonNull } from "@/components/ui/dialog";
import { getCroppedImageFile } from "@/features/actualites-admin/lib/get-cropped-image";
import { MAX_IMAGE_BYTES, MAX_IMAGE_LABEL } from "@/features/actualites-admin/lib/image-limits";

const ASPECT_RATIO = 16 / 9;

interface CoverImageCropperProps {
  open: boolean;
  imageSrc: string | null;
  fileName: string;
  onCancel: () => void;
  onConfirm: (file: File) => void;
}

export function CoverImageCropper({
  open,
  imageSrc,
  fileName,
  onCancel,
  onConfirm,
}: CoverImageCropperProps) {
  const shownSrc = useLastNonNull(imageSrc);

  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [processing, setProcessing] = useState(false);

  const handleCropComplete = useCallback((_area: Area, areaPixels: Area) => {
    setCroppedAreaPixels(areaPixels);
  }, []);

  async function handleConfirm() {
    if (!croppedAreaPixels || !shownSrc) return;
    setProcessing(true);
    try {
      const file = await getCroppedImageFile(shownSrc, croppedAreaPixels, fileName);
      if (file.size > MAX_IMAGE_BYTES) {
        toast.error(
          `Image trop lourde une fois recadrée (maximum ${MAX_IMAGE_LABEL}). Zoomez moins ou choisissez une autre image.`,
        );
        return;
      }
      onConfirm(file);
    } finally {
      setProcessing(false);
    }
  }

  if (!shownSrc) return null;

  return (
    <Dialog
      open={open}
      onClose={onCancel}
      wide
      className="gap-4 border-transparent bg-surface-card p-5"
    >
      <DialogTitle asChild>
        <span className="text-[0.6875rem] font-semibold tracking-[0.13em] text-muted-foreground uppercase">
          Recadrer l’image
        </span>
      </DialogTitle>
      <div className="relative h-[65vh] overflow-hidden rounded-md bg-ink">
        <Cropper
          image={shownSrc}
          crop={crop}
          zoom={zoom}
          aspect={ASPECT_RATIO}
          onCropChange={setCrop}
          onZoomChange={setZoom}
          onCropComplete={handleCropComplete}
        />
      </div>
      <input
        type="range"
        min={1}
        max={3}
        step={0.05}
        value={zoom}
        onChange={(event) => setZoom(Number(event.target.value))}
        aria-label="Zoom"
        className="w-full"
      />
      <div className="flex justify-end gap-2.5">
        <Button variant="secondary" onClick={onCancel} disabled={processing}>
          Annuler
        </Button>
        <Button
          variant="primary"
          onClick={handleConfirm}
          disabled={processing || !croppedAreaPixels}
        >
          {processing ? "Traitement..." : "Valider le cadrage"}
        </Button>
      </div>
    </Dialog>
  );
}
