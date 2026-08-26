"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Bold, Italic, Heading2, List, ListOrdered, Link as LinkIcon } from "lucide-react";
import { IconButton } from "@/components/ui/icon-button";

interface ArticleBodyEditorProps {
  initialContent?: string;
  onChange: (html: string, text: string) => void;
}

export function ArticleBodyEditor({ initialContent = "", onChange }: ArticleBodyEditorProps) {
  const editor = useEditor({
    extensions: [StarterKit],
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

  function setLink() {
    const url = window.prompt("URL du lien");
    if (url) {
      editor?.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
    } else {
      editor?.chain().focus().unsetLink().run();
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-1 border-b border-border-subtle pb-2.5">
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
      <EditorContent editor={editor} />
    </div>
  );
}
