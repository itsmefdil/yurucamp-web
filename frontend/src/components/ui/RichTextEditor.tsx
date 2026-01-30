import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import ReactMarkdown from 'react-markdown';
import remarkBreaks from 'remark-breaks';
import {
    Bold,
    Italic,
    List,
    ListOrdered,
    Heading1,
    Heading2,
    Quote,
    Link as LinkIcon,
    Eye,
    Edit3,
    Maximize2,
    Minimize2
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { Button } from './button';
import { Textarea } from './textarea';

interface RichTextEditorProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
    minHeight?: string;
}

export default function RichTextEditor({
    value,
    onChange,
    placeholder = "Write something...",
    className,
    minHeight = "min-h-[300px]"
}: RichTextEditorProps) {
    const [isPreview, setIsPreview] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);

    // Cleanup body overflow on unmount or when fullscreen changes
    useEffect(() => {
        if (isFullscreen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }

        // Cleanup on unmount - ensures scroll is restored when leaving page
        return () => {
            document.body.style.overflow = '';
        };
    }, [isFullscreen]);

    const insertFormat = (prefix: string, suffix: string = '') => {
        const textarea = document.querySelector('textarea[name="editor-textarea"]') as HTMLTextAreaElement;
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const text = textarea.value;
        const before = text.substring(0, start);
        const selection = text.substring(start, end);
        const after = text.substring(end);

        const newText = before + prefix + selection + suffix + after;
        onChange(newText);

        // Restore focus and selection
        setTimeout(() => {
            textarea.focus();
            textarea.setSelectionRange(
                start + prefix.length,
                end + prefix.length
            );
        }, 0);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
            e.preventDefault();
            insertFormat('**', '**');
        }
        if ((e.ctrlKey || e.metaKey) && e.key === 'i') {
            e.preventDefault();
            insertFormat('*', '*');
        }
    };

    const toggleFullscreen = () => {
        setIsFullscreen(prev => !prev);
    };

    // Shared editor content
    const editorContent = (
        <div
            className={cn(
                "flex flex-col bg-white",
                isFullscreen
                    ? "fixed inset-0 z-[9999]"
                    : "border rounded-xl overflow-hidden border-gray-200 shadow-sm",
                !isFullscreen && className
            )}
            style={isFullscreen ? { width: '100vw', height: '100vh' } : undefined}
        >
            {/* Toolbar */}
            <div className="flex items-center justify-between border-b border-gray-100 bg-white p-2 shrink-0">
                <div className="flex items-center gap-1 overflow-x-auto no-scrollbar pr-4">
                    <Button
                        type="button"
                        variant={!isPreview ? "default" : "ghost"}
                        size="sm"
                        onClick={() => setIsPreview(false)}
                        className={cn("text-xs gap-1.5 h-8 px-3 font-medium", !isPreview ? "bg-orange-500 hover:bg-orange-600 text-white border-b-2 border-orange-700 active:border-b-0 translate-y-0 active:translate-y-0.5" : "text-gray-600 hover:text-gray-900 hover:bg-gray-200")}
                    >
                        <Edit3 className="w-3.5 h-3.5" />
                        Write
                    </Button>
                    <Button
                        type="button"
                        variant={isPreview ? "default" : "ghost"}
                        size="sm"
                        onClick={() => setIsPreview(true)}
                        className={cn("text-xs gap-1.5 h-8 px-3 font-medium", isPreview ? "bg-orange-500 hover:bg-orange-600 text-white border-b-2 border-orange-700 active:border-b-0 translate-y-0 active:translate-y-0.5" : "text-gray-600 hover:text-gray-900 hover:bg-gray-200")}
                    >
                        <Eye className="w-3.5 h-3.5" />
                        Preview
                    </Button>

                    <div className="w-px h-5 bg-gray-300 mx-2 shrink-0" />

                    <div className={cn("flex items-center gap-1 transition-opacity", isPreview ? "opacity-30 pointer-events-none" : "opacity-100")}>
                        <ToolbarButton onClick={() => insertFormat('**', '**')} icon={Bold} tooltip="Bold" />
                        <ToolbarButton onClick={() => insertFormat('*', '*')} icon={Italic} tooltip="Italic" />
                        <div className="w-px h-4 bg-gray-300 mx-1 shrink-0 hidden sm:block" />
                        <ToolbarButton onClick={() => insertFormat('# ')} icon={Heading1} tooltip="Heading 1" />
                        <ToolbarButton onClick={() => insertFormat('## ')} icon={Heading2} tooltip="Heading 2" />
                        <div className="w-px h-4 bg-gray-300 mx-1 shrink-0 hidden sm:block" />
                        <ToolbarButton onClick={() => insertFormat('- ')} icon={List} tooltip="Bullet List" />
                        <ToolbarButton onClick={() => insertFormat('1. ')} icon={ListOrdered} tooltip="Numbered List" />
                        <ToolbarButton onClick={() => insertFormat('> ')} icon={Quote} tooltip="Quote" />
                        <ToolbarButton onClick={() => insertFormat('[', '](url)')} icon={LinkIcon} tooltip="Link" />
                    </div>
                </div>

                <div className="flex items-center pl-2 border-l border-gray-200 ml-2 shrink-0">
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={toggleFullscreen}
                        className="h-8 w-8 hover:bg-gray-200 text-gray-500 rounded-lg"
                        title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
                    >
                        {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                    </Button>
                </div>
            </div>

            {/* Editor Area */}
            <div className="grow min-h-0 bg-white overflow-y-auto flex flex-col">
                {isPreview ? (
                    <div className={cn("prose prose-orange max-w-none p-4 md:p-6", !isFullscreen && minHeight)}>
                        {value ? (
                            <ReactMarkdown remarkPlugins={[remarkBreaks]}>
                                {value}
                            </ReactMarkdown>
                        ) : (
                            <p className="text-gray-400 italic">Nothing to preview</p>
                        )}
                    </div>
                ) : (
                    <Textarea
                        name="editor-textarea"
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        placeholder={placeholder}
                        onKeyDown={handleKeyDown}
                        className={cn(
                            "w-full border-0 focus-visible:ring-0 rounded-none resize-none p-4 md:p-6 font-mono text-base leading-relaxed text-gray-800 placeholder:text-gray-400",
                            isFullscreen ? "grow" : minHeight
                        )}
                    />
                )}
            </div>

            {/* Footer / Helper Text */}
            {!isFullscreen && !isPreview && (
                <div className="bg-gray-50 px-4 py-2 border-t border-gray-100 flex justify-between items-center text-[10px] text-gray-500 font-medium shrink-0">
                    <span>Markdown supported</span>
                    <span>{value.length} chars</span>
                </div>
            )}
        </div>
    );

    // Use Portal for fullscreen to escape parent stacking contexts
    if (isFullscreen) {
        return createPortal(editorContent, document.body);
    }

    return editorContent;
}

function ToolbarButton({ onClick, icon: Icon, tooltip }: { onClick: () => void; icon: React.ElementType; tooltip: string }) {
    return (
        <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onClick}
            className="h-8 w-8 text-gray-500 hover:text-gray-900 hover:bg-gray-200 rounded-lg shrink-0"
            title={tooltip}
        >
            <Icon className="w-4 h-4" />
        </Button>
    );
}
