"use client";

import { useState } from "react";
import * as Popover from "@radix-ui/react-popover";
import type { Editor } from "@tiptap/react";
import { BubbleMenu } from "@tiptap/react/menus";
import { Bold, Italic, Heading2, List, ListOrdered, Link as LinkIcon } from "lucide-react";
import { IconButton } from "@/components/ui/icon-button";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/components/ui/cn";

interface ArticleFormatMenuProps {
  editor: Editor;
}

export function ArticleFormatMenu({ editor }: ArticleFormatMenuProps) {
  const [linkOpen, setLinkOpen] = useState(false);
  const [url, setUrl] = useState("");

  function openLinkPopover() {
    setUrl(editor.getAttributes("link").href ?? "");
    setLinkOpen(true);
  }

  function applyLink() {
    if (url.trim()) {
      editor.chain().focus().extendMarkRange("link").setLink({ href: url.trim() }).run();
    }
    setLinkOpen(false);
  }

  function removeLink() {
    editor.chain().focus().unsetLink().run();
    setLinkOpen(false);
  }

  return (
    <BubbleMenu editor={editor} shouldShow={({ state }) => linkOpen || !state.selection.empty}>
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
        <Popover.Root open={linkOpen} onOpenChange={setLinkOpen}>
          <Popover.Trigger asChild>
            <IconButton
              icon={LinkIcon}
              label="Lien"
              size="sm"
              variant={editor.isActive("link") ? "outline" : "ghost"}
              onClick={openLinkPopover}
            />
          </Popover.Trigger>
          <Popover.Content
            side="bottom"
            align="start"
            sideOffset={8}
            onEscapeKeyDown={() => setLinkOpen(false)}
            style={{ transformOrigin: "var(--radix-popover-content-transform-origin)" }}
            className={cn(
              "z-100 flex w-64 flex-col gap-2 rounded-[10px] border border-border-strong bg-surface-card p-3 shadow-overlay",
              "data-[state=open]:animate-mec-pop data-[state=closed]:animate-mec-pop-out",
            )}
          >
            <Input
              autoFocus
              value={url}
              onChange={(event) => setUrl(event.target.value)}
              placeholder="https://…"
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  applyLink();
                }
              }}
            />
            <div className="flex gap-2">
              <Button variant="primary" size="sm" onClick={applyLink}>
                Appliquer
              </Button>
              {editor.isActive("link") ? (
                <Button variant="ghost" size="sm" onClick={removeLink}>
                  Retirer le lien
                </Button>
              ) : null}
            </div>
          </Popover.Content>
        </Popover.Root>
      </div>
    </BubbleMenu>
  );
}
