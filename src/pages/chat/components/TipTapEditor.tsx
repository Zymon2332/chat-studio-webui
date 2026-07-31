"use client";

import { useEffect, useRef, forwardRef, useImperativeHandle, type MutableRefObject } from "react";
import { Editor } from "@tiptap/core";
import StarterKit from "@tiptap/starter-kit";
import Mention from "@tiptap/extension-mention";
import Placeholder from "@tiptap/extension-placeholder";
import { PluginKey } from "@tiptap/pm/state";
import { fetchAgentPage } from "@/lib/agents";
import { fetchSkillPage } from "@/lib/skills";
import type { SuggestionProps, SuggestionKeyDownProps } from "@tiptap/suggestion";

interface CacheState { items: any[]; page: number; hasMore: boolean; }

export interface TipTapEditorRef {
  getText: () => string;
  getAgentIds: () => string[];
  getSkillIds: () => string[];
  clear: () => void;
  isEmpty: () => boolean;
}

interface TipTapEditorProps {
  placeholder?: string;
  onEnterSubmit?: () => void;
  onFocusChange?: (focused: boolean) => void;
}

function editorToText(editor: Editor): string {
  const parts: string[] = [];
  editor.state.doc.descendants(node => {
    if (node.type.name === "mention") {
      const prefix = node.attrs.type === "agent" ? "@" : "/";
      parts.push(`${prefix}${node.attrs.label || ""}`);
    } else if (node.isText) {
      parts.push(node.text || "");
    }
  });
  return parts.join("").trim();
}

function createSuggestionRenderer(type: "agent" | "skill", stateRef: MutableRefObject<CacheState>) {
  let el: HTMLDivElement | null = null;
  let unmount: (() => void) | null = null;
  let currentQuery = "";
  let currentCommand: ((props: Record<string, string>) => void) | null = null;

  const state = stateRef.current;

  function renderPopup(items: any[], query: string, command: (props: Record<string, string>) => void) {
    if (!el) return;
    const filtered = query
      ? items.filter((item: any) => item.name.toLowerCase().includes(query.toLowerCase()))
      : items;

    el.innerHTML = "";

    if (filtered.length === 0) {
      el.innerHTML = '<div style="padding: 0.75rem; text-align: center; font-size: 0.75rem; color: hsl(var(--muted-foreground));">暂无内容</div>';
      return;
    }

    const list = document.createElement("div");
    list.style.cssText = "max-height: 12rem; overflow-y: auto; overflow-x: hidden; padding: 0.25rem;";

    const header = document.createElement("div");
    header.textContent = type === "agent" ? "Agents" : "Skills";
    header.style.cssText = "padding: 0.375rem 0.5rem; font-size: 0.75rem; font-weight: 600; color: hsl(var(--muted-foreground)); text-transform: uppercase; letter-spacing: 0.05em;";
    list.appendChild(header);

    for (const item of filtered) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.style.cssText = [
        "display: grid", "grid-template-columns: auto minmax(0, auto) minmax(0, 1fr)",
        "width: 100%", "align-items: center",
        "padding: 0.375rem 0.5rem", "font-size: 0.875rem", "border-radius: 0.375rem",
        "text-align: left", "cursor: pointer", "border: none", "background: none",
        "color: inherit", "font-family: inherit", "overflow: hidden",
      ].join(";");
      btn.className = "hover:bg-accent";

      const prefix = document.createElement("span");
      prefix.textContent = type === "agent" ? "@" : "/";
      prefix.style.cssText = "color: hsl(var(--primary)); font-weight: 500; flex-shrink: 0; margin-right: 0.5rem;";
      btn.appendChild(prefix);

      const nameSpan = document.createElement("span");
      nameSpan.textContent = item.name;
      nameSpan.style.cssText = "font-weight: 500; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;";
      btn.appendChild(nameSpan);

      if (item.description) {
        nameSpan.style.marginRight = "0.5rem";
        const descSpan = document.createElement("span");
        descSpan.textContent = item.description;
        descSpan.style.cssText = "font-size: 0.75rem; color: hsl(var(--muted-foreground)); overflow: hidden; text-overflow: ellipsis; white-space: nowrap;";
        btn.appendChild(descSpan);
      }

      btn.addEventListener("mousedown", e => {
        e.preventDefault();
        command({ id: String(item.id), label: item.name, type });
      });

      list.appendChild(btn);
    }

    if (state.hasMore) {
      const loadBtn = document.createElement("button");
      loadBtn.type = "button";
      loadBtn.textContent = "加载更多...";
      loadBtn.style.cssText = [
        "width: 100%", "padding: 0.5rem", "font-size: 0.75rem",
        "text-align: center", "cursor: pointer", "border: none",
        "background: none", "color: hsl(var(--muted-foreground))",
        "font-family: inherit", "border-radius: 0.375rem",
      ].join(";");
      loadBtn.className = "hover:bg-accent";
      loadBtn.addEventListener("mousedown", async e => {
        e.preventDefault();
        const fetchFn = type === "agent" ? fetchAgentPage : fetchSkillPage;
        const result = await fetchFn({ pageNum: state.page + 1, pageSize: 10 });
        const records = result.records || [];
        state.items.push(...records);
        state.page++;
        state.hasMore = records.length === 10;
        renderPopup(state.items, currentQuery, currentCommand!);
      });
      list.appendChild(loadBtn);
    }

    el.appendChild(list);
  }

  return {
    onStart: (props: SuggestionProps) => {
      el = document.createElement("div");
      currentQuery = props.query;
      currentCommand = props.command;

      const editorElement = props.editor.view.dom;
      const chatInputEl = editorElement?.parentElement;
      const rect = chatInputEl!.getBoundingClientRect();

      el.style.cssText = [
        "position: fixed",
        `bottom: ${window.innerHeight - rect.top}px`,
        `left: ${rect.left}px`,
        `width: ${rect.width}px`,
        "z-index: 999",
        "border-radius: 0.5rem",
        "border: 1px solid hsl(var(--border))",
        "box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1)",
        "background: hsl(var(--popover))",
      ].join("; ");

      document.body.appendChild(el);
      renderPopup(props.items, props.query, props.command);

      const updatePosition = () => {
        if (!el || !chatInputEl) return;
        const r = chatInputEl.getBoundingClientRect();
        el.style.bottom = `${window.innerHeight - r.top}px`;
        el.style.left = `${r.left}px`;
        el.style.width = `${r.width}px`;
      };
      const onScroll = () => updatePosition();
      const onResize = () => updatePosition();
      window.addEventListener("scroll", onScroll, true);
      window.addEventListener("resize", onResize);

      unmount = () => {
        window.removeEventListener("scroll", onScroll, true);
        window.removeEventListener("resize", onResize);
        el!.remove();
        el = null;
      };
    },
    onUpdate: (props: SuggestionProps) => {
      currentQuery = props.query;
      currentCommand = props.command;
      renderPopup(props.items, props.query, props.command);
    },
    onKeyDown: (_props: SuggestionKeyDownProps) => false,
    onExit: () => {
      if (unmount) { unmount(); unmount = null; }
      state.items = [];
      state.page = 0;
      state.hasMore = true;
    },
  };
}

const mentionNodeConfig = {
  renderHTML({ node, HTMLAttributes }: { node: any; HTMLAttributes: Record<string, any> }) {
    const prefix = node.attrs.type === "agent" ? "@" : "/";
    return [
      "span",
      {
        ...HTMLAttributes,
        "data-mention": `${prefix}${node.attrs.label}`,
        class: `mention mention-${node.attrs.type || "agent"}`,
        style: "display: inline-flex; align-items: center; margin: 0 1px; padding: 0 4px; background: hsl(var(--primary) / 0.1); color: hsl(var(--primary)); border-radius: 4px; font-size: 0.875rem;",
      },
      `${prefix}${node.attrs.label}`,
    ] as const;
  },
  addAttributes() {
    return {
      id: { default: null },
      label: { default: null },
      type: { default: null },
    };
  },
};

export const TipTapEditor = forwardRef<TipTapEditorRef, TipTapEditorProps>(
  ({ placeholder = "给我发消息或布置任务", onEnterSubmit, onFocusChange }, ref) => {
    const editorRef = useRef<Editor | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const onEnterSubmitRef = useRef(onEnterSubmit);
    onEnterSubmitRef.current = onEnterSubmit;
    const onFocusChangeRef = useRef(onFocusChange);
    onFocusChangeRef.current = onFocusChange;
    const agentStateRef = useRef<CacheState>({ items: [], page: 0, hasMore: true });
    const skillStateRef = useRef<CacheState>({ items: [], page: 0, hasMore: true });

    useImperativeHandle(ref, () => ({
      getText: () => editorRef.current ? editorToText(editorRef.current) : "",
      getAgentIds: () => {
        if (!editorRef.current) return [];
        const ids: string[] = [];
        editorRef.current.state.doc.descendants(node => {
          if (node.type.name === "mention" && node.attrs.type === "agent" && node.attrs.id) {
            ids.push(node.attrs.id);
          }
        });
        return ids;
      },
      getSkillIds: () => {
        if (!editorRef.current) return [];
        const ids: string[] = [];
        editorRef.current.state.doc.descendants(node => {
          if (node.type.name === "mention" && node.attrs.type === "skill" && node.attrs.id) {
            ids.push(node.attrs.id);
          }
        });
        return ids;
      },
      clear: () => editorRef.current?.commands.clearContent(),
      isEmpty: () => {
        if (!editorRef.current) return true;
        const text = editorToText(editorRef.current);
        return text.length === 0;
      },
    }), []);

    useEffect(() => {
      if (!containerRef.current) return;

      const editor = new Editor({
        element: containerRef.current,
        extensions: [
          StarterKit.configure({
            heading: false, codeBlock: false, blockquote: false,
            horizontalRule: false, bulletList: false, orderedList: false, listItem: false,
          }),
          Placeholder.configure({ placeholder }),
          Mention.extend(mentionNodeConfig).configure({
            HTMLAttributes: { class: "mention" },
            suggestions: [
              {
                char: "@",
                pluginKey: new PluginKey("agent-mention"),
                placement: "top-start",
                items: async () => {
                  const state = agentStateRef.current;
                  if (state.items.length > 0) return state.items;
                  const result = await fetchAgentPage({ pageNum: 1, pageSize: 10 });
                  state.items = result.records || [];
                  state.page = 1;
                  state.hasMore = state.items.length === 10;
                  return state.items;
                },
                command: ({ editor, range, props }) => {
                  editor.chain().focus().insertContentAt(range, [
                    { type: "mention", attrs: { id: props.id, label: props.label, type: "agent" } },
                    { type: "text", text: " " },
                  ]).run();
                },
                render: () => createSuggestionRenderer("agent", agentStateRef),
              },
              {
                char: "/",
                pluginKey: new PluginKey("skill-mention"),
                placement: "top-start",
                items: async () => {
                  const state = skillStateRef.current;
                  if (state.items.length > 0) return state.items;
                  const result = await fetchSkillPage({ pageNum: 1, pageSize: 10 });
                  state.items = result.records || [];
                  state.page = 1;
                  state.hasMore = state.items.length === 10;
                  return state.items;
                },
                command: ({ editor, range, props }) => {
                  editor.chain().focus().insertContentAt(range, [
                    { type: "mention", attrs: { id: props.id, label: props.label, type: "skill" } },
                    { type: "text", text: " " },
                  ]).run();
                },
                render: () => createSuggestionRenderer("skill", skillStateRef),
              },
            ],
          }),
        ],
        editorProps: {
          attributes: {
            class: "text-sm focus:outline-none min-h-20 px-3 py-3",
          },
          handleKeyDown: (_view, event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              onEnterSubmitRef.current?.();
              return true;
            }
          },
        },
        onFocus: () => onFocusChangeRef.current?.(true),
        onBlur: () => onFocusChangeRef.current?.(false),
      });

      editorRef.current = editor;

      return () => {
        editor.destroy();
        editorRef.current = null;
      };
    }, []);

    useEffect(() => {
      if (!editorRef.current) return;
      editorRef.current.view.dom.dataset.placeholder = placeholder;
    }, [placeholder]);

    return <div ref={containerRef} className="max-h-40 min-h-20 overflow-y-auto" />;
  }
);

TipTapEditor.displayName = "TipTapEditor";
