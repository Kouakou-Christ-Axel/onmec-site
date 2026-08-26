"use client";

import { useEffect, useId, useMemo, useState } from "react";
import { ImagePlus, X } from "lucide-react";
import { IconButton } from "@/components/ui/icon-button";
import { CoverImageCropper } from "@/components/features/admin/cover-image-cropper";

interface CoverImageFieldProps {
  file: File | null;
  onChange: (file: File | null) => void;
  existingUrl?: string | null;
}

export function CoverImageField({ file, onChange, existingUrl }: CoverImageFieldProps) {
  const inputId = useId();
  const [dragOver, setDragOver] = useState(false);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const objectUrl = useMemo(() => (file ? URL.createObjectURL(file) : null), [file]);
  const pendingUrl = useMemo(
    () => (pendingFile ? URL.createObjectURL(pendingFile) : null),
    [pendingFile],
  );

  useEffect(() => {
    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [objectUrl]);

  useEffect(() => {
    return () => {
      if (pendingUrl) URL.revokeObjectURL(pendingUrl);
    };
  }, [pendingUrl]);

  const previewSrc = objectUrl ?? existingUrl ?? null;

  function handleFiles(fileList: FileList | null) {
    const picked = fileList?.[0];
    if (picked && picked.type.startsWith("image/")) {
      setPendingFile(picked);
    }
  }

  return (
    <>
      <div
        onDragOver={(event) => {
          event.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragOver(false);
          handleFiles(event.dataTransfer.files);
        }}
        className={`relative flex h-72 w-full flex-col items-center justify-center gap-2 overflow-hidden rounded-lg border-2 border-dashed transition-colors ${
          dragOver
            ? "border-blue-500 bg-blue-50"
            : "border-border-subtle bg-n-50 hover:border-border-strong"
        }`}
      >
        {previewSrc ? (
          <>
            <img
              src={previewSrc}
              alt="Aperçu de l’image de couverture"
              className="absolute inset-0 h-full w-full object-cover"
            />
            <label
              htmlFor={inputId}
              className="absolute inset-x-0 bottom-0 z-10 cursor-pointer bg-ink/70 px-3 py-1.5 text-center text-[0.8125rem] font-medium text-white transition-colors hover:bg-ink/85"
            >
              Remplacer l’image
            </label>
            <IconButton
              icon={X}
              label="Retirer l’image"
              size="sm"
              variant="invert"
              className="absolute top-2 right-2 z-10 bg-ink/70 text-white hover:bg-ink/85"
              onClick={() => onChange(null)}
            />
          </>
        ) : (
          <label
            htmlFor={inputId}
            className="flex h-full w-full cursor-pointer flex-col items-center justify-center gap-2"
          >
            <ImagePlus size={22} className="text-muted-foreground" />
            <p className="text-[0.8125rem] text-muted-foreground">
              Glissez une image ou cliquez pour en choisir une
            </p>
          </label>
        )}
        <input
          id={inputId}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(event) => {
            handleFiles(event.target.files);
            event.target.value = "";
          }}
        />
      </div>

      {pendingFile && pendingUrl ? (
        <CoverImageCropper
          imageSrc={pendingUrl}
          fileName={pendingFile.name}
          onCancel={() => setPendingFile(null)}
          onConfirm={(croppedFile) => {
            onChange(croppedFile);
            setPendingFile(null);
          }}
        />
      ) : null}
    </>
  );
}
