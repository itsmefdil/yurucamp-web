import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2, ArrowLeft, Copy, Check, Globe, Lock, Package, ChevronDown, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import api from '../../lib/api';
import { Navbar } from '../../components/layout/Navbar';
import { Footer } from '../../components/layout/Footer';
import type { GearList, GearItem, ItemFormData } from '../../types/gear';
import { GearListStats } from '../../components/gear/GearListStats';
import { SortableItem } from '../../components/gear/SortableItem';
import { DEFAULT_GEAR_CATEGORIES } from '../../lib/gearConstants';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../../components/ui/dialog';

export default function GearListDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    // States for various forms
    const [isAddingCategory, setIsAddingCategory] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);

    const [editingItemId, setEditingItemId] = useState<string | null>(null);
    const [addingItemToCatId, setAddingItemToCatId] = useState<string | null>(null);
    const [itemForm, setItemForm] = useState<ItemFormData>({ name: '', description: '', weight: '', quantity: 1 });

    const [showSharePopover, setShowSharePopover] = useState(false);
    const [copied, setCopied] = useState(false);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const { data: list, isLoading, error } = useQuery({
        queryKey: ['gearList', id],
        queryFn: async () => {
            const response = await api.get(`/gear/${id}`);
            return response.data as GearList;
        },
        enabled: !!id
    });

    // Mutations
    const addCategoryMutation = useMutation({
        mutationFn: async (name: string) => {
            await api.post('/gear/categories', { gearListId: id, name, sortOrder: list?.categories?.length || 0 });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['gearList', id] });
            setIsAddingCategory(false);
            setNewCategoryName('');
            toast.success('Kategori ditambahkan');
        }
    });

    const deleteCategoryMutation = useMutation({
        mutationFn: async (catId: string) => {
            await api.delete(`/gear/categories/${catId}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['gearList', id] });
            toast.success('Kategori dihapus');
        }
    });

    const addItemMutation = useMutation({
        mutationFn: async (data: { categoryId: string } & ItemFormData) => {
            await api.post('/gear/items', data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['gearList', id] });
            setAddingItemToCatId(null);
            resetItemForm();
            toast.success('Item ditambahkan');
        }
    });

    const updateItemMutation = useMutation({
        mutationFn: async (data: { id: string } & ItemFormData) => {
            await api.put(`/gear/items/${data.id}`, data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['gearList', id] });
            setEditingItemId(null);
            resetItemForm();
            toast.success('Item diperbarui');
        }
    });

    const deleteItemMutation = useMutation({
        mutationFn: async (itemId: string) => {
            await api.delete(`/gear/items/${itemId}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['gearList', id] });
            toast.success('Item dihapus');
        }
    });

    const reorderItemsMutation = useMutation({
        mutationFn: async (data: { categoryId: string, itemIds: string[] }) => {
            await api.put(`/gear/categories/${data.categoryId}/items/reorder`, { itemIds: data.itemIds });
        },
        onError: () => {
            toast.error('Gagal menyimpan urutan');
            queryClient.invalidateQueries({ queryKey: ['gearList', id] });
        }
    });

    const updateListMutation = useMutation({
        mutationFn: async (data: { isPublic?: boolean }) => {
            await api.put(`/gear/${id}`, data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['gearList', id] });
            toast.success('Daftar diperbarui');
        },
        onError: () => {
            toast.error('Gagal memperbarui daftar');
        }
    });

    const applyTemplateMutation = useMutation({
        mutationFn: async () => {
            await api.post(`/gear/${id}/apply-template`, { categories: DEFAULT_GEAR_CATEGORIES });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['gearList', id] });
            toast.success('Template berhasil diterapkan');
            setIsTemplateModalOpen(false);
        },
        onError: () => {
            toast.error('Gagal menerapkan template');
        }
    });

    const resetItemForm = () => setItemForm({ name: '', description: '', weight: '', quantity: 1 });

    // Handlers
    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (active.id !== over?.id && list?.categories) {
            // Find which category we are in
            // CAUTION: This assumes we drag within the SAME category for now
            // We need to look up component data or structure to know category
            // A clearer way: The 'active' item belongs to a category. 

            // In our props/data we can find it:
            let foundCategory = null;
            let oldIndex = -1;
            let newIndex = -1;

            for (const cat of list.categories) {
                const activeIndex = cat.items.findIndex(i => i.id === active.id);
                if (activeIndex !== -1) {
                    const overIndex = cat.items.findIndex(i => i.id === over?.id);
                    if (overIndex !== -1) {
                        foundCategory = cat;
                        oldIndex = activeIndex;
                        newIndex = overIndex;
                        break;
                    }
                }
            }

            if (foundCategory && oldIndex !== -1 && newIndex !== -1) {
                // Optimistic Update
                const newItems = arrayMove(foundCategory.items, oldIndex, newIndex);

                // We need to update the query cache optimistically or wait for invalidation
                // Updating cache is tricky with nested objects, for MVP we can just trigger mutation and refetch
                // But to prevent "jump back", we should ideally update local state.
                // However, DndKit works best if we feed it the updated list.
                // For simplicity: We trigger API and refetch. The UI might flicker slightly. 
                // To avoid flicker, we'd need local state management mirroring the query data.

                // Let's rely on fast mutation for now as simpler MVP approach.
                const itemIds = newItems.map(i => i.id);
                reorderItemsMutation.mutate({ categoryId: foundCategory.id, itemIds });

                // Ideally we update the cache manualy here:
                queryClient.setQueryData(['gearList', id], (old: GearList | undefined) => {
                    if (!old || !old.categories) return old;
                    return {
                        ...old,
                        categories: old.categories.map(cat => {
                            if (cat.id === foundCategory!.id) {
                                return { ...cat, items: newItems };
                            }
                            return cat;
                        })
                    };
                });
            }
        }
    };

    const handleAddCategory = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newCategoryName.trim()) return;
        addCategoryMutation.mutate(newCategoryName);
    };

    const handleAddItem = (e: React.FormEvent, categoryId: string) => {
        e.preventDefault();
        if (!itemForm.name.trim()) return;
        addItemMutation.mutate({ ...itemForm, categoryId });
    };

    const handleUpdateItem = (e: React.FormEvent, itemId: string) => {
        e.preventDefault();
        updateItemMutation.mutate({ ...itemForm, id: itemId });
    };

    const startEditingItem = (item: GearItem) => {
        setEditingItemId(item.id);
        setAddingItemToCatId(null);
        setItemForm({
            name: item.name,
            description: item.description || '',
            weight: item.weight,
            quantity: item.quantity
        });
    };

    const startAddingItem = (categoryId: string) => {
        setAddingItemToCatId(categoryId);
        setEditingItemId(null);
        resetItemForm();
    };

    const calculateTotalWeight = () => {
        if (!list?.categories) return 0;
        return list.categories.reduce((total, cat) => {
            return total + cat.items.reduce((catTotal, item) => catTotal + (parseFloat(item.weight) * item.quantity), 0);
        }, 0);
    };

    const totalWeight = calculateTotalWeight();

    if (isLoading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>;
    if (error) return <div className="min-h-screen flex items-center justify-center">Error loading list</div>;
    if (!list) return null;

    const isOwner = list.isOwner !== false; // Default to true if not specified (for backwards compat)
    const shareUrl = `${window.location.origin}/g/${id}`;

    const handleCopyLink = () => {
        navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleTogglePublic = () => {
        updateListMutation.mutate({ isPublic: !list.isPublic });
    };

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <Navbar />
            <main className="flex-1 container mx-auto px-3 sm:px-4 pt-20 md:pt-28 pb-24">
                {/* Header Card */}
                <div className="bg-white rounded-2xl border border-border shadow-sm mb-4 sm:mb-6">
                    {/* Back Button */}
                    <div className="px-4 py-3 border-b border-border/50">
                        <button
                            onClick={() => navigate('/gear-lists')}
                            className="text-text-secondary hover:text-primary flex items-center gap-1.5 text-sm font-medium"
                        >
                            <ArrowLeft className="w-4 h-4" /> Kembali ke Daftar
                        </button>
                    </div>

                    {/* Title & Meta */}
                    <div className="p-4 sm:p-6">
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                            <div className="flex-1 min-w-0">
                                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold font-display text-text-primary leading-tight">
                                    {list.name}
                                </h1>
                                {list.description && (
                                    <p className="text-text-secondary mt-2 text-sm sm:text-base">{list.description}</p>
                                )}
                                {/* Owner info for public lists */}
                                {!isOwner && list.ownerInfo && (
                                    <div className="flex items-center gap-2 mt-3">
                                        {list.ownerInfo.avatarUrl ? (
                                            <img src={list.ownerInfo.avatarUrl} alt="" className="w-7 h-7 rounded-full border-2 border-white shadow" />
                                        ) : (
                                            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-xs font-bold text-white">
                                                {list.ownerInfo.fullName?.charAt(0).toUpperCase() || '?'}
                                            </div>
                                        )}
                                        <span className="text-sm text-text-secondary">
                                            oleh <span className="font-semibold text-text-primary">{list.ownerInfo.fullName || 'Anonim'}</span>
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Share Button - Owner only */}
                            {isOwner && (
                                <div className="relative shrink-0">
                                    <button
                                        onClick={() => setShowSharePopover(!showSharePopover)}
                                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 transition-all text-sm font-semibold shadow-sm ${list.isPublic
                                            ? 'bg-green-50 border-green-300 text-green-700 hover:bg-green-100'
                                            : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300'
                                            }`}
                                    >
                                        {list.isPublic ? <Globe className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                                        {list.isPublic ? 'Publik' : 'Bagikan'}
                                        <ChevronDown className="w-4 h-4" />
                                    </button>

                                    {showSharePopover && (
                                        <>
                                            <div className="fixed inset-0 bg-black/30 z-40 sm:hidden" onClick={() => setShowSharePopover(false)} />
                                            <div className="fixed left-4 right-4 bottom-20 sm:absolute sm:left-auto sm:right-0 sm:bottom-auto sm:top-full sm:mt-2 sm:w-80 bg-white rounded-2xl border border-border shadow-xl p-4 z-50">
                                                <div className="flex items-center justify-between mb-3">
                                                    <span className="font-semibold text-text-primary">Bagikan daftar ini</span>
                                                    <button onClick={() => setShowSharePopover(false)} className="text-gray-400 hover:text-gray-600 text-xl leading-none">&times;</button>
                                                </div>

                                                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl mb-3">
                                                    <div className="flex items-center gap-2">
                                                        {list.isPublic ? <Globe className="w-4 h-4 text-green-600" /> : <Lock className="w-4 h-4 text-gray-500" />}
                                                        <span className="text-sm">{list.isPublic ? 'Siapa saja dengan link' : 'Hanya Anda'}</span>
                                                    </div>
                                                    <button
                                                        onClick={handleTogglePublic}
                                                        disabled={updateListMutation.isPending}
                                                        className={`relative w-12 h-7 rounded-full transition-colors ${list.isPublic ? 'bg-green-500' : 'bg-gray-300'}`}
                                                    >
                                                        <div className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow transition-transform ${list.isPublic ? 'left-6' : 'left-1'}`} />
                                                    </button>
                                                </div>

                                                {list.isPublic && (
                                                    <div className="flex gap-2">
                                                        <input
                                                            type="text"
                                                            readOnly
                                                            value={shareUrl}
                                                            className="flex-1 min-w-0 px-3 py-2.5 text-sm bg-gray-50 border border-border rounded-xl truncate"
                                                        />
                                                        <button
                                                            onClick={handleCopyLink}
                                                            className="shrink-0 px-4 py-2.5 bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors font-medium"
                                                        >
                                                            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Quick Stats Row */}
                        <div className="flex items-center gap-3 mt-4 pt-4 border-t border-border/50">
                            <div className="flex items-center gap-2 px-3 py-2 bg-primary/10 rounded-xl">
                                <Package className="w-4 h-4 text-primary" />
                                <span className="text-sm font-bold text-primary">
                                    {totalWeight >= 1000 ? `${(totalWeight / 1000).toFixed(2)} kg` : `${totalWeight.toFixed(0)} g`}
                                </span>
                            </div>
                            <div className="text-sm text-text-tertiary">
                                {list.categories?.reduce((sum, c) => sum + c.items.length, 0) || 0} item dalam {list.categories?.length || 0} kategori
                            </div>
                        </div>
                    </div>
                </div>

                {/* 2-Column Layout: Stats (Left) | Categories (Right) */}
                <div className="flex flex-col lg:flex-row gap-6 lg:items-start">
                    {/* Left Sidebar - Stats */}
                    <div className="w-full lg:w-72 xl:w-80 lg:shrink-0">
                        {list.categories && <GearListStats categories={list.categories} />}
                    </div>

                    {/* Right Content - Categories */}
                    <div className="flex-1 min-w-0">
                        <DndContext
                            sensors={sensors}
                            collisionDetection={closestCenter}
                            onDragEnd={handleDragEnd}
                        >
                            <div className="space-y-4">
                                {list.categories?.map((category) => (
                                    <div key={category.id} className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
                                        {/* Category Header */}
                                        <div className="bg-gradient-to-r from-gray-50 to-white px-4 py-3 border-b border-border flex items-center justify-between group">
                                            <div className="flex items-center gap-3">
                                                <h3 className="font-bold text-base sm:text-lg text-text-primary">{category.name}</h3>
                                                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full font-medium">
                                                    {category.items.length} item
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-mono font-semibold text-primary bg-primary/10 px-2 py-1 rounded-lg">
                                                    {(() => {
                                                        const w = category.items.reduce((sum, i) => sum + (parseFloat(i.weight) * i.quantity), 0);
                                                        return w >= 1000 ? `${(w / 1000).toFixed(2)}kg` : `${w}g`;
                                                    })()}
                                                </span>
                                                {isOwner && (
                                                    <button
                                                        onClick={() => confirm('Hapus kategori ini?') && deleteCategoryMutation.mutate(category.id)}
                                                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100 sm:opacity-100"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>
                                        </div>

                                        <div className="divide-y divide-border">
                                            <SortableContext
                                                items={category.items.map(i => i.id)}
                                                strategy={verticalListSortingStrategy}
                                            >
                                                {category.items.map((item) => (
                                                    <SortableItem
                                                        key={item.id}
                                                        item={item}
                                                        editingItemId={editingItemId}
                                                        startEditingItem={startEditingItem}
                                                        deleteItem={(id) => deleteItemMutation.mutate(id)}
                                                        onUpdateSubmit={handleUpdateItem}
                                                        itemForm={itemForm}
                                                        setItemForm={setItemForm}
                                                        setEditingItemId={setEditingItemId}
                                                        isOwner={isOwner}
                                                    />
                                                ))}
                                            </SortableContext>

                                            {/* Add Item Row - Only for owner */}
                                            {isOwner && (addingItemToCatId === category.id ? (
                                                <form onSubmit={(e) => handleAddItem(e, category.id)} className="p-4 bg-gray-50 flex flex-wrap gap-3 items-end animate-in fade-in slide-in-from-top-1">
                                                    <div className="w-full sm:flex-1 sm:min-w-[150px]">
                                                        <input
                                                            placeholder="Nama Item" autoFocus
                                                            className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                                                            value={itemForm.name} onChange={e => setItemForm({ ...itemForm, name: e.target.value })}
                                                        />
                                                    </div>
                                                    <div className="w-full sm:flex-[2] sm:min-w-[200px]">
                                                        <input
                                                            placeholder="Deskripsi"
                                                            className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                                                            value={itemForm.description} onChange={e => setItemForm({ ...itemForm, description: e.target.value })}
                                                        />
                                                    </div>
                                                    <div className="w-[calc(50%-0.5rem)] sm:w-24">
                                                        <input
                                                            placeholder="0g" type="number"
                                                            className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                                                            value={itemForm.weight} onChange={e => setItemForm({ ...itemForm, weight: e.target.value })}
                                                        />
                                                    </div>
                                                    <div className="w-[calc(50%-0.5rem)] sm:w-16">
                                                        <input
                                                            placeholder="Jml" type="number" min="1"
                                                            className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                                                            value={itemForm.quantity} onChange={e => setItemForm({ ...itemForm, quantity: parseInt(e.target.value) || 1 })}
                                                        />
                                                    </div>
                                                    <div className="w-full sm:w-auto flex gap-2 pt-2 sm:pt-0">
                                                        <button type="button" onClick={() => setAddingItemToCatId(null)} className="flex-1 sm:flex-none px-3 py-2 text-sm rounded-lg hover:bg-gray-200 border border-gray-200 sm:border-transparent font-medium">Batal</button>
                                                        <button type="submit" className="flex-1 sm:flex-none px-3 py-2 bg-primary text-white text-sm rounded-lg font-medium shadow-sm active:scale-95 transition-transform">Tambah</button>
                                                    </div>
                                                </form>
                                            ) : (
                                                <button
                                                    onClick={() => startAddingItem(category.id)}
                                                    className="w-full py-2 text-sm text-text-tertiary hover:text-primary hover:bg-gray-50 transition-colors flex items-center justify-center gap-1"
                                                >
                                                    <Plus className="w-3 h-3" /> Tambah Item
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                ))}

                                {/* Add Category Button - Only for owner */}
                                {isOwner && (isAddingCategory ? (
                                    <form onSubmit={handleAddCategory} className="bg-white p-4 sm:p-6 rounded-2xl border border-border shadow-sm">
                                        <h3 className="font-semibold text-base mb-3">Kategori Baru</h3>
                                        <div className="flex flex-col sm:flex-row gap-3">
                                            <input
                                                className="flex-1 px-4 py-3 rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm"
                                                placeholder="contoh: Shelter, Dapur, Elektronik"
                                                value={newCategoryName}
                                                onChange={(e) => setNewCategoryName(e.target.value)}
                                                autoFocus
                                            />
                                            <div className="flex gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => setIsAddingCategory(false)}
                                                    className="flex-1 sm:flex-none px-4 py-3 text-text-secondary hover:bg-gray-100 rounded-xl border border-gray-200 font-medium text-sm"
                                                >
                                                    Batal
                                                </button>
                                                <button
                                                    type="submit"
                                                    className="flex-1 sm:flex-none px-6 py-3 bg-primary text-white rounded-xl font-medium text-sm hover:bg-primary/90 transition-colors"
                                                >
                                                    Tambah
                                                </button>
                                            </div>
                                        </div>
                                    </form>
                                ) : (
                                    <div className="flex flex-col sm:flex-row gap-3">
                                        <button
                                            onClick={() => setIsAddingCategory(true)}
                                            className="flex-1 py-5 rounded-2xl border-2 border-dashed border-gray-200 text-gray-400 hover:border-primary hover:text-primary hover:bg-primary/5 transition-all flex items-center justify-center gap-2"
                                        >
                                            <Plus className="w-5 h-5" />
                                            <span className="font-medium">Tambah Kategori</span>
                                        </button>

                                        {/* Template Button - Show if list is empty or user wants to add more */}
                                        <button
                                            onClick={() => setIsTemplateModalOpen(true)}
                                            className="flex-1 py-5 rounded-2xl border-2 border-dashed border-gray-200 text-gray-400 hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50 transition-all flex items-center justify-center gap-2"
                                        >
                                            <Package className="w-5 h-5" />
                                            <span className="font-medium">Gunakan Template</span>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </DndContext>
                    </div>
                </div>

                <Dialog open={isTemplateModalOpen} onOpenChange={setIsTemplateModalOpen}>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>Gunakan Template Default</DialogTitle>
                            <DialogDescription>
                                Ini akan menambahkan kategori umum pendakian ke daftar ini (Shelter, Masak, Pakaian, dll) beserta item dasar. Anda bisa mengeditnya nanti.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="py-4">
                            <ul className="list-disc pl-5 space-y-1 text-sm text-gray-600">
                                {DEFAULT_GEAR_CATEGORIES.slice(0, 5).map((cat, i) => (
                                    <li key={i}>{cat.name}</li>
                                ))}
                                {DEFAULT_GEAR_CATEGORIES.length > 5 && (
                                    <li>...dan {DEFAULT_GEAR_CATEGORIES.length - 5} lainnya</li>
                                )}
                            </ul>
                        </div>
                        <DialogFooter>
                            <button
                                onClick={() => setIsTemplateModalOpen(false)}
                                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                                disabled={applyTemplateMutation.isPending}
                            >
                                Batal
                            </button>
                            <button
                                onClick={() => applyTemplateMutation.mutate()}
                                disabled={applyTemplateMutation.isPending}
                                className="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary/90 rounded-lg transition-colors flex items-center gap-2"
                            >
                                {applyTemplateMutation.isPending ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        <span>Menerapkan...</span>
                                    </>
                                ) : (
                                    'Terapkan Template'
                                )}
                            </button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </main>
            <Footer />
        </div>
    );
}
