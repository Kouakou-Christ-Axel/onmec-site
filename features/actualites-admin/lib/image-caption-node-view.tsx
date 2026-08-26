"use client";

import type { NodeViewProps } from "@tiptap/react";
import { NodeViewWrapper } from "@tiptap/react";
import { Trash2 } from "lucide-react";
import { IconButton } from "@/components/ui/icon-button";
import { cn } from "@/components/ui/cn";

export function ImageCaptionView({ node, updateAttributes, deleteNode, selected }: NodeViewProps) {
  return (
    <NodeViewWrapper
      as="figure"
      className={cn(
        "group relative m-0",
        selected && "outline-2 outline-offset-2 outline-focus-ring",
      )}
    >
      <img
        src={node.attrs.src}
        alt={node.attrs.alt ?? ""}
        title={node.attrs.title ?? undefined}
        className="max-w-full rounded-md"
      />
      <IconButton
        icon={Trash2}
        label="Supprimer l’image"
        size="sm"
        variant="ghost"
        contentEditable={false}
        onClick={deleteNode}
        className="absolute top-2 right-2 bg-surface-card/90 opacity-0 shadow-raise transition-opacity group-hover:opacity-100"
      />
      <figcaption>
        <input
          value={node.attrs.caption ?? ""}
          onChange={(event) => updateAttributes({ caption: event.target.value })}
          placeholder="Légende (optionnel)"
          className="mt-2 w-full border-0 bg-transparent p-0 text-center text-sm italic text-muted-foreground outline-none placeholder:text-n-300"
        />
      </figcaption>
    </NodeViewWrapper>
  );
}
