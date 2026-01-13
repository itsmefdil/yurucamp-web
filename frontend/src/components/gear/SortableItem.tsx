import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Pencil, Trash2, X, Check } from 'lucide-react';
import type { GearItem, ItemFormData } from '../../types/gear';

interface SortableItemProps {
    item: GearItem;
    editingItemId: string | null;
    startEditingItem: (item: GearItem) => void;
    deleteItem: (id: string) => void;
    onUpdateSubmit: (e: React.FormEvent, id: string) => void;
    itemForm: ItemFormData;
    setItemForm: (val: ItemFormData) => void;
    setEditingItemId: (id: string | null) => void;
    isOwner?: boolean;
}

export function SortableItem({
    item,
    editingItemId,
    startEditingItem,
    deleteItem,
    onUpdateSubmit,
    itemForm,
    setItemForm,
    setEditingItemId,
    isOwner = true
}: SortableItemProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: item.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        zIndex: isDragging ? 10 : 1
    };

    const itemWeight = parseFloat(item.weight) * item.quantity;

    // Mode Edit
    if (editingItemId === item.id) {
        return (
            <div ref={setNodeRef} style={style} className="group relative">
                <form onSubmit={(e) => onUpdateSubmit(e, item.id)} className="p-3 sm:p-4 bg-primary/5 border-l-4 border-primary">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                        <div>
                            <label className="text-xs font-medium text-text-tertiary block mb-1">Nama Item</label>
                            <input
                                className="w-full px-3 py-2.5 rounded-lg border border-border text-sm focus:ring-2 focus:ring-primary/20 outline-none bg-white"
                                value={itemForm.name}
                                onChange={e => setItemForm({ ...itemForm, name: e.target.value })}
                                autoFocus
                            />
                        </div>
                        <div>
                            <label className="text-xs font-medium text-text-tertiary block mb-1">Deskripsi</label>
                            <input
                                className="w-full px-3 py-2.5 rounded-lg border border-border text-sm focus:ring-2 focus:ring-primary/20 outline-none bg-white"
                                value={itemForm.description}
                                onChange={e => setItemForm({ ...itemForm, description: e.target.value })}
                                placeholder="Opsional"
                            />
                        </div>
                    </div>
                    <div className="flex flex-wrap items-end gap-3">
                        <div className="flex-1 min-w-[100px]">
                            <label className="text-xs font-medium text-text-tertiary block mb-1">Berat (g)</label>
                            <input
                                type="number"
                                className="w-full px-3 py-2.5 rounded-lg border border-border text-sm focus:ring-2 focus:ring-primary/20 outline-none bg-white"
                                value={itemForm.weight}
                                onChange={e => setItemForm({ ...itemForm, weight: e.target.value })}
                            />
                        </div>
                        <div className="w-20">
                            <label className="text-xs font-medium text-text-tertiary block mb-1">Jml</label>
                            <input
                                type="number"
                                min="1"
                                className="w-full px-3 py-2.5 rounded-lg border border-border text-sm focus:ring-2 focus:ring-primary/20 outline-none bg-white"
                                value={itemForm.quantity}
                                onChange={e => setItemForm({ ...itemForm, quantity: parseInt(e.target.value) || 1 })}
                            />
                        </div>
                        <div className="flex gap-2">
                            <button
                                type="button"
                                onClick={() => setEditingItemId(null)}
                                className="p-2.5 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                            <button
                                type="submit"
                                className="p-2.5 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                            >
                                <Check className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        );
    }

    // Mode Tampilan
    return (
        <div ref={setNodeRef} style={style} className="group relative bg-white">
            <div className="flex items-center gap-2 sm:gap-3 p-3 sm:p-4 hover:bg-gray-50/50 transition-colors">
                {/* Handle Drag - Hanya untuk pemilik */}
                {isOwner && (
                    <div
                        {...attributes}
                        {...listeners}
                        className="cursor-grab text-gray-300 hover:text-gray-400 active:cursor-grabbing touch-none p-1"
                    >
                        <GripVertical className="w-4 h-4" />
                    </div>
                )}

                {/* Info Item */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                        <span className="font-medium text-text-primary text-sm sm:text-base truncate">
                            {item.name}
                        </span>
                        {item.quantity > 1 && (
                            <span className="shrink-0 text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded font-medium">
                                ×{item.quantity}
                            </span>
                        )}
                    </div>
                    {item.description && (
                        <p className="text-xs sm:text-sm text-text-tertiary truncate mt-0.5">{item.description}</p>
                    )}
                </div>

                {/* Berat */}
                <div className="shrink-0 text-right">
                    <div className="font-mono text-sm sm:text-base font-semibold text-text-primary">
                        {itemWeight >= 1000 ? `${(itemWeight / 1000).toFixed(2)}kg` : `${itemWeight}g`}
                    </div>
                    {item.quantity > 1 && (
                        <div className="text-xs text-text-tertiary font-mono">
                            {parseFloat(item.weight)}g/pcs
                        </div>
                    )}
                </div>

                {/* Aksi - Hanya pemilik */}
                {isOwner && (
                    <div className="shrink-0 flex gap-1 ml-1">
                        <button
                            onClick={() => startEditingItem(item)}
                            className="p-2 text-gray-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-colors"
                        >
                            <Pencil className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => deleteItem(item.id)}
                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
