import { Extension } from "@tiptap/core";
import type { Editor, Range } from "@tiptap/core";
import Suggestion from "@tiptap/suggestion";
import { ReactRenderer } from "@tiptap/react";
import { SlashCommandMenu } from "@/components/features/admin/slash-command-menu";

export interface SlashCommandItem {
  title: string;
  description: string;
  command: (props: { editor: Editor; range: Range }) => void;
}

const ITEMS: SlashCommandItem[] = [
  {
    title: "Titre",
    description: "Titre de section",
    command: ({ editor, range }) =>
      editor.chain().focus().deleteRange(range).setHeading({ level: 2 }).run(),
  },
  {
    title: "Liste à puces",
    description: "Liste simple non ordonnée",
    command: ({ editor, range }) =>
      editor.chain().focus().deleteRange(range).toggleBulletList().run(),
  },
  {
    title: "Liste numérotée",
    description: "Liste ordonnée avec numéros",
    command: ({ editor, range }) =>
      editor.chain().focus().deleteRange(range).toggleOrderedList().run(),
  },
  {
    title: "Citation",
    description: "Bloc de citation",
    command: ({ editor, range }) =>
      editor.chain().focus().deleteRange(range).toggleBlockquote().run(),
  },
  {
    title: "Séparateur",
    description: "Ligne de séparation horizontale",
    command: ({ editor, range }) =>
      editor.chain().focus().deleteRange(range).setHorizontalRule().run(),
  },
];

export const SlashCommand = Extension.create({
  name: "slashCommand",

  addOptions() {
    return {
      suggestion: {
        char: "/",
        command: ({
          editor,
          range,
          props,
        }: {
          editor: Editor;
          range: Range;
          props: SlashCommandItem;
        }) => {
          props.command({ editor, range });
        },
      },
    };
  },

  addProseMirrorPlugins() {
    return [
      Suggestion({
        editor: this.editor,
        ...this.options.suggestion,
        items: ({ query }: { query: string }) =>
          ITEMS.filter((item) => item.title.toLowerCase().startsWith(query.toLowerCase())).slice(
            0,
            10,
          ),
        render: () => {
          let component: ReactRenderer | null = null;
          let unmount: (() => void) | null = null;

          return {
            onStart: (props) => {
              component = new ReactRenderer(SlashCommandMenu, {
                props,
                editor: props.editor,
              });
              unmount = props.mount(component.element as HTMLElement);
            },
            onUpdate: (props) => {
              component?.updateProps(props);
            },
            onKeyDown: (props) => {
              if (props.event.key === "Escape") {
                unmount?.();
                component?.destroy();
                unmount = null;
                component = null;
                return true;
              }
              return (
                (component?.ref as { onKeyDown: (p: typeof props) => boolean } | null)?.onKeyDown(
                  props,
                ) ?? false
              );
            },
            onExit: () => {
              unmount?.();
              component?.destroy();
              unmount = null;
              component = null;
            },
          };
        },
      }),
    ];
  },
});
