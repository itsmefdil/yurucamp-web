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
        <div className="min-h-[500px] -mx-4 blocknote-custom-wrapper">
            <style jsx global>{`
                .blocknote-custom-wrapper .bn-editor {
                    background: transparent !important;
                    font-family: var(--font-nunito), sans-serif !important;
                }
                .blocknote-custom-wrapper .bn-block-content {
                    font-size: 1.125rem !important; /* text-lg */
                    line-height: 1.75rem !important;
                    color: #374151 !important; /* text-gray-700 */
                }
                .blocknote-custom-wrapper .bn-block-content[data-content-type="heading"][data-level="1"] {
                    font-size: 2.25rem !important;
                    font-weight: 800 !important;
                    margin-top: 1.5rem !important;
                    margin-bottom: 0.5rem !important;
                }
                .blocknote-custom-wrapper .bn-block-content[data-content-type="heading"][data-level="2"] {
                    font-size: 1.875rem !important;
                    font-weight: 700 !important;
                    margin-top: 1.25rem !important;
                    margin-bottom: 0.5rem !important;
                }
                .blocknote-custom-wrapper .bn-block-content[data-content-type="heading"][data-level="3"] {
                    font-size: 1.5rem !important;
                    font-weight: 600 !important;
                    margin-top: 1rem !important;
                    margin-bottom: 0.5rem !important;
                }
            `}</style>
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
