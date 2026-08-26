"use client";

import { forwardRef, useEffect, useImperativeHandle, useState } from "react";
import type { SlashCommandItem } from "@/features/actualites-admin/lib/slash-command-extension";

interface SlashCommandMenuProps {
  items: SlashCommandItem[];
  command: (item: SlashCommandItem) => void;
}

export interface SlashCommandMenuRef {
  onKeyDown: (props: { event: KeyboardEvent }) => boolean;
}

export const SlashCommandMenu = forwardRef<SlashCommandMenuRef, SlashCommandMenuProps>(
  function SlashCommandMenu({ items, command }, ref) {
    const [selectedIndex, setSelectedIndex] = useState(0);

    useEffect(() => {
      setSelectedIndex(0);
    }, [items]);

    function selectItem(index: number) {
      const item = items[index];
      if (item) command(item);
    }

    useImperativeHandle(ref, () => ({
      onKeyDown({ event }) {
        if (event.key === "ArrowUp") {
          setSelectedIndex((prev) => (prev + items.length - 1) % items.length);
          return true;
        }
        if (event.key === "ArrowDown") {
          setSelectedIndex((prev) => (prev + 1) % items.length);
          return true;
        }
        if (event.key === "Enter") {
          selectItem(selectedIndex);
          return true;
        }
        return false;
      },
    }));

    if (items.length === 0) {
      return (
        <div className="rounded-md border border-border-strong bg-surface-card p-3 text-sm text-muted-foreground shadow-overlay">
          Aucun résultat
        </div>
      );
    }

    return (
      <div className="flex w-64 flex-col gap-0.5 rounded-md border border-border-strong bg-surface-card p-1.5 shadow-overlay">
        {items.map((item, index) => (
          <button
            key={item.title}
            type="button"
            onClick={() => selectItem(index)}
            className={`flex flex-col items-start rounded-sm px-2.5 py-1.5 text-left transition-colors ${
              index === selectedIndex ? "bg-n-100" : "hover:bg-n-50"
            }`}
          >
            <span className="text-sm font-medium text-ink">{item.title}</span>
            <span className="text-xs text-muted-foreground">{item.description}</span>
          </button>
        ))}
      </div>
    );
  },
);
