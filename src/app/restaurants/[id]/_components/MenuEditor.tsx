import React, { useState, useEffect } from "react";
import { TrashIcon, PlusIcon } from "@/components/Tables/icons";

interface MenuItem {
    name: string;
    description: string;
    price: string;
}

interface MenuCategory {
    name: string;
    items: MenuItem[];
}

interface MenuData {
    title: string;
    subtitle: string;
    categories: MenuCategory[];
}

interface MenuEditorProps {
    menuData: any; // Can be the new structure, old array, or old object
    onChange: (newMenu: MenuData) => void;
}

export function MenuEditor({ menuData, onChange }: MenuEditorProps) {
    // Standardize the input data into the new structure
    const getInitialData = (data: any): MenuData => {
        if (!data) return { title: "", subtitle: "", categories: [] };

        // If it's already the new structure
        if (data.categories && Array.isArray(data.categories)) {
            return {
                title: data.title || "",
                subtitle: data.subtitle || "",
                categories: data.categories
            };
        }

        // If it's an array of categories (old structured array)
        if (Array.isArray(data)) {
            return {
                title: "",
                subtitle: "",
                categories: data.map((cat: any) => ({
                    name: cat.name || cat.category || "New Category",
                    items: Array.isArray(cat.items) ? cat.items : []
                }))
            };
        }

        // If it's an object of categories (old object-based structure)
        if (typeof data === 'object' && data !== null) {
            return {
                title: "",
                subtitle: "",
                categories: Object.entries(data).map(([name, items]) => ({
                    name,
                    items: Array.isArray(items) ? items : []
                }))
            };
        }

        return { title: "", subtitle: "", categories: [] };
    };

    const [localData, setLocalData] = useState<MenuData>(getInitialData(menuData));

    // Sync from parent
    useEffect(() => {
        setLocalData(getInitialData(menuData));
    }, [menuData]);

    const updateParent = (newData: MenuData) => {
        setLocalData(newData);
        onChange(newData);
    };

    // -- Global Fields --
    const updateGlobalField = (field: "title" | "subtitle", value: string) => {
        const newData = { ...localData, [field]: value };
        updateParent(newData);
    };

    // -- Categories --
    const addCategory = () => {
        const newData = {
            ...localData,
            categories: [...localData.categories, { name: "New Category", items: [] }]
        };
        updateParent(newData);
    };

    const updateCategoryName = (cIndex: number, newName: string) => {
        const newCategories = [...localData.categories];
        newCategories[cIndex] = { ...newCategories[cIndex], name: newName };
        updateParent({ ...localData, categories: newCategories });
    };

    const removeCategory = (cIndex: number) => {
        if (!confirm("Are you sure you want to delete this entire category and all its items?")) return;
        const newCategories = localData.categories.filter((_, i) => i !== cIndex);
        updateParent({ ...localData, categories: newCategories });
    };

    // -- Items --
    const addItem = (cIndex: number) => {
        const newCategories = [...localData.categories];
        newCategories[cIndex].items = [...newCategories[cIndex].items, { name: "", description: "", price: "" }];
        updateParent({ ...localData, categories: newCategories });
    };

    const updateItem = (cIndex: number, iIndex: number, field: keyof MenuItem, value: string) => {
        const newCategories = [...localData.categories];
        newCategories[cIndex].items[iIndex] = { ...newCategories[cIndex].items[iIndex], [field]: value };
        updateParent({ ...localData, categories: newCategories });
    };

    const removeItem = (cIndex: number, iIndex: number) => {
        const newCategories = [...localData.categories];
        newCategories[cIndex].items = newCategories[cIndex].items.filter((_, i) => i !== iIndex);
        updateParent({ ...localData, categories: newCategories });
    };

    return (
        <div className="space-y-6">
            {/* Menu Header Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 dark:bg-meta-4 p-4 rounded-lg border border-stroke dark:border-strokedark">
                <div>
                    <label className="mb-2 block text-sm font-medium text-black dark:text-white">Menu Title</label>
                    <input
                        type="text"
                        value={localData.title}
                        onChange={(e) => updateGlobalField("title", e.target.value)}
                        placeholder="e.g., Our Specialties"
                        className="w-full rounded border border-stroke bg-white px-4 py-2 outline-none focus:border-primary dark:border-form-strokedark dark:bg-form-input"
                    />
                </div>
                <div>
                    <label className="mb-2 block text-sm font-medium text-black dark:text-white">Menu Subtitle</label>
                    <input
                        type="text"
                        value={localData.subtitle}
                        onChange={(e) => updateGlobalField("subtitle", e.target.value)}
                        placeholder="e.g., Handcrafted Dishes"
                        className="w-full rounded border border-stroke bg-white px-4 py-2 outline-none focus:border-primary dark:border-form-strokedark dark:bg-form-input"
                    />
                </div>
            </div>

            {/* Categories */}
            {localData.categories.map((category, cIndex) => (
                <div key={`cat-${cIndex}`} className="rounded-lg border border-stroke bg-white dark:border-strokedark dark:bg-boxdark p-5 shadow-sm">
                    {/* Category Header */}
                    <div className="flex items-center justify-between mb-4 border-b border-stroke pb-3 dark:border-strokedark">
                        <div className="flex-1 mr-4">
                            <input
                                type="text"
                                value={category.name}
                                onChange={(e) => updateCategoryName(cIndex, e.target.value)}
                                className="w-full bg-transparent text-xl font-bold text-black dark:text-white outline-none focus:border-b-2 focus:border-primary transition-all p-1"
                                placeholder="Category Name (e.g., Starters)"
                            />
                        </div>
                        <button
                            onClick={() => removeCategory(cIndex)}
                            className="p-2 text-danger hover:bg-danger/10 rounded transition-colors"
                            title="Delete Category"
                        >
                            <TrashIcon className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Items List */}
                    <div className="space-y-3">
                        {category.items.map((item, iIndex) => (
                            <div key={`item-${cIndex}-${iIndex}`} className="flex gap-4 items-start p-3 bg-gray-2 dark:bg-meta-4 rounded-md">
                                <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-3">
                                    <div className="md:col-span-4">
                                        <label className="text-xs text-gray-500 mb-1 block">Item Name</label>
                                        <input
                                            type="text"
                                            value={item.name}
                                            onChange={(e) => updateItem(cIndex, iIndex, "name", e.target.value)}
                                            placeholder="Item Name"
                                            className="w-full rounded border border-stroke bg-white px-3 py-2 text-sm outline-none focus:border-primary dark:border-form-strokedark dark:bg-form-input"
                                        />
                                    </div>
                                    <div className="md:col-span-6">
                                        <label className="text-xs text-gray-500 mb-1 block">Description</label>
                                        <input
                                            type="text"
                                            value={item.description}
                                            onChange={(e) => updateItem(cIndex, iIndex, "description", e.target.value)}
                                            placeholder="Description (optional)"
                                            className="w-full rounded border border-stroke bg-white px-3 py-2 text-sm outline-none focus:border-primary dark:border-form-strokedark dark:bg-form-input"
                                        />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="text-xs text-gray-500 mb-1 block">Price</label>
                                        <input
                                            type="text"
                                            value={item.price}
                                            onChange={(e) => updateItem(cIndex, iIndex, "price", e.target.value)}
                                            placeholder="0.00"
                                            className="w-full rounded border border-stroke bg-white px-3 py-2 text-sm outline-none focus:border-primary dark:border-form-strokedark dark:bg-form-input"
                                        />
                                    </div>
                                </div>
                                <button
                                    onClick={() => removeItem(cIndex, iIndex)}
                                    className="p-2 mt-5 text-gray-400 hover:text-danger hover:bg-danger/10 rounded transition-colors"
                                    title="Remove Item"
                                >
                                    <TrashIcon className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                    </div>

                    {/* Add Item Button */}
                    <button
                        onClick={() => addItem(cIndex)}
                        className="mt-4 flex items-center text-sm font-medium text-primary hover:text-meta-5 transition-colors"
                    >
                        <PlusIcon className="w-4 h-4 mr-1" />
                        Add Item to {category.name}
                    </button>
                </div>
            ))}

            {/* General Empty State / Add Category */}
            <div className="flex justify-center border-2 border-dashed border-stroke dark:border-strokedark rounded-lg p-6">
                <button
                    onClick={addCategory}
                    className="flex flex-col items-center justify-center text-gray-500 hover:text-primary transition-colors"
                >
                    <div className="h-10 w-10 rounded-full bg-gray-2 dark:bg-meta-4 flex items-center justify-center mb-2">
                        <PlusIcon className="w-6 h-6" />
                    </div>
                    <span className="font-medium">Add New Category</span>
                </button>
            </div>
        </div>
    );
}
