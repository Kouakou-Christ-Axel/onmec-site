"use client";

import type { Editor } from "@tiptap/react";
import { BubbleMenu } from "@tiptap/react/menus";
import { Bold, Italic, Heading2, List, ListOrdered, Link as LinkIcon } from "lucide-react";
import { IconButton } from "@/components/ui/icon-button";

interface ArticleFormatMenuProps {
  editor: Editor;
}

export function ArticleFormatMenu({ editor }: ArticleFormatMenuProps) {
  function setLink() {
    const url = window.prompt("URL du lien");
    if (url) {
      editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
    } else {
      editor.chain().focus().unsetLink().run();
    }
  }

  return (
    <BubbleMenu editor={editor}>
      <div className="flex items-center gap-1 rounded-md border border-border-strong bg-surface-card p-1 shadow-overlay">
        <IconButton
          icon={Bold}
          label="Gras"
          size="sm"
          variant={editor.isActive("bold") ? "outline" : "ghost"}
          onClick={() => editor.chain().focus().toggleBold().run()}
        />
        <IconButton
          icon={Italic}
          label="Italique"
          size="sm"
          variant={editor.isActive("italic") ? "outline" : "ghost"}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        />
        <IconButton
          icon={Heading2}
          label="Titre de section"
          size="sm"
          variant={editor.isActive("heading", { level: 2 }) ? "outline" : "ghost"}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        />
        <IconButton
          icon={List}
          label="Liste à puces"
          size="sm"
          variant={editor.isActive("bulletList") ? "outline" : "ghost"}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        />
        <IconButton
          icon={ListOrdered}
          label="Liste numérotée"
          size="sm"
          variant={editor.isActive("orderedList") ? "outline" : "ghost"}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        />
        <IconButton
          icon={LinkIcon}
          label="Lien"
          size="sm"
          variant={editor.isActive("link") ? "outline" : "ghost"}
          onClick={setLink}
        />
      </div>
    </BubbleMenu>
  );
}
