"use client";

import { BlockNoteEditor, PartialBlock } from "@blocknote/core";
import { BlockNoteView } from "@blocknote/mantine";
import "@blocknote/core/fonts/inter.css";
import "@blocknote/mantine/style.css";
import { useCreateBlockNote } from "@blocknote/react";
import { useEffect, useState } from "react";

interface EditorProps {
    onChange: (html: string) => void;
    initialContent?: string;
    editable?: boolean;
}

export default function Editor({ onChange, initialContent, editable = true }: EditorProps) {
    // Creates a new editor instance.
    const editor = useCreateBlockNote();

    useEffect(() => {
        async function loadContent() {
            if (initialContent && editor) {
                const blocks = await editor.tryParseHTMLToBlocks(initialContent);
                editor.replaceBlocks(editor.document, blocks);
            }
        }
        loadContent();
    }, [editor, initialContent]);

    if (!editor) {
        return null;
    }

    // Renders the editor instance using a React component.
    return (
        <div className="rounded-xl border border-gray-200 bg-gray-50 overflow-hidden min-h-[150px] focus-within:ring-2 focus-within:ring-primary/20 transition-all">
            <BlockNoteView
                editor={editor}
                editable={editable}
                onChange={async () => {
                    const html = await editor.blocksToHTMLLossy(editor.document);
                    onChange(html);
                }}
                theme="light"
            />
        </div>
    );
}
