"use client";

import { useId } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import { FloatingMenu } from "@tiptap/react/menus";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import { Placeholder } from "@tiptap/extensions";
import DragHandle from "@tiptap/extension-drag-handle-react";
import { GripVertical, Plus } from "lucide-react";
import { toast } from "sonner";
import { useUploadActualiteImage } from "@/features/actualites-admin/mutations/use-upload-actualite-image";
import { ApiError } from "@/lib/api-error";
import { MAX_IMAGE_BYTES, MAX_IMAGE_LABEL } from "@/features/actualites-admin/lib/image-limits";
import { convertToWebp } from "@/features/actualites-admin/lib/convert-to-webp";
import { SlashCommand } from "@/features/actualites-admin/lib/slash-command-extension";
import { ArticleFormatMenu } from "@/components/features/admin/article-format-menu";

interface ArticleBodyEditorProps {
  initialContent?: string;
  onChange: (html: string, text: string) => void;
}

export function ArticleBodyEditor({ initialContent = "", onChange }: ArticleBodyEditorProps) {
  const imageInputId = useId();
  const uploadImage = useUploadActualiteImage();

  const editor = useEditor({
    extensions: [
      StarterKit,
      Image,
      Placeholder.configure({
        placeholder: "Commencez à écrire votre article…",
      }),
      SlashCommand,
    ],
    content: initialContent,
    immediatelyRender: false,
    onCreate: ({ editor }) => onChange(editor.getHTML(), editor.getText()),
    onUpdate: ({ editor }) => onChange(editor.getHTML(), editor.getText()),
    editorProps: {
      attributes: {
        class: "min-h-[44vh] font-sans text-lg leading-relaxed text-[#2b3646] outline-none",
      },
    },
  });

  if (!editor) return null;

  async function handleImageFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file || !editor) return;

    let webpFile: File;
    try {
      webpFile = await convertToWebp(file);
    } catch {
      toast.error("Impossible de traiter cette image. Réessayez.");
      return;
    }

    if (webpFile.size > MAX_IMAGE_BYTES) {
      toast.error(
        `Image trop lourde (maximum ${MAX_IMAGE_LABEL}). Choisissez une image plus légère.`,
      );
      return;
    }
    const formData = new FormData();
    formData.set("image", webpFile);
    uploadImage.mutate(formData, {
      onSuccess: ({ url }) => {
        editor.chain().focus().setImage({ src: url }).run();
      },
      onError: (error) => {
        if (error instanceof ApiError && error.status === 413) {
          toast.error(
            `Image trop lourde (maximum ${MAX_IMAGE_LABEL}). Choisissez une image plus légère.`,
          );
        } else {
          toast.error("Impossible d’ajouter l’image. Réessayez.");
        }
      },
    });
  }

  return (
    <div className="flex flex-col gap-3">
      <ArticleFormatMenu editor={editor} />

      <FloatingMenu editor={editor}>
        <label
          htmlFor={imageInputId}
          title="Ajouter une image"
          className={`inline-grid h-8 w-8 cursor-pointer place-items-center rounded-sm border border-ink/24 bg-transparent text-ink transition-colors hover:border-ink hover:bg-n-100 ${
            uploadImage.isPending ? "pointer-events-none opacity-45" : ""
          }`}
        >
          <span className="sr-only">Ajouter une image</span>
          <Plus size={16} />
        </label>
      </FloatingMenu>

      <input
        id={imageInputId}
        type="file"
        accept="image/*"
        disabled={uploadImage.isPending}
        className="hidden"
        onChange={handleImageFile}
      />

      <DragHandle editor={editor}>
        <div className="inline-grid h-6 w-6 cursor-grab place-items-center rounded-sm text-muted-foreground hover:bg-n-100 active:cursor-grabbing">
          <GripVertical size={14} />
        </div>
      </DragHandle>

      <EditorContent editor={editor} />
    </div>
  );
}
