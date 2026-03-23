"use client";

import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import { api } from "@/services/api";
import { Restaurant, WebConfig } from "@/types/restaurant";
import { GlobeIcon, EyeIcon, MailIcon, SyncIcon } from "@/components/Tables/icons";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import DomainValidator from "./DomainValidator";
import { UploadIcon } from "@/assets/icons";
import { EmailPreviewModal } from "@/components/EmailPreviewModal";
import { MenuEditor } from "./MenuEditor";

const FONT_PAIRS = {
    "elegant": {
        name: "The Michelin Star",
        fonts: 'Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400&Lato:wght@300;400;700',
        heading: "'Playfair Display', serif",
        body: "'Lato', sans-serif"
    },
    "modern_clean": {
        name: "The Urban Grid",
        fonts: 'Montserrat:wght@400;500;600;700&Open+Sans:wght@300;400;600;700',
        heading: "'Montserrat', sans-serif",
        body: "'Open Sans', sans-serif"
    },
    "bold_industrial": {
        name: "The Gastro Pub",
        fonts: 'Oswald:wght@300;400;500;600;700&Roboto:wght@300;400;500;700',
        heading: "'Oswald', sans-serif",
        body: "'Roboto', sans-serif"
    },
    "traditional": {
        name: "Nonna’s Kitchen",
        fonts: 'Merriweather:wght@300;400;700;900&Merriweather+Sans:wght@300;400;500;600;700',
        heading: "'Merriweather', serif",
        body: "'Merriweather Sans', sans-serif"
    },
    "rustic": {
        name: "The Organic Flow",
        fonts: 'Lora:ital,wght@0,400;0,500;0,600;0,700;1,400&Work+Sans:wght@300;400;500;600',
        heading: "'Lora', serif",
        body: "'Work Sans', sans-serif"
    },
    "chic": {
        name: "Bistro Chic",
        fonts: 'Abril+Fatface&Poppins:wght@300;400;500;600;700',
        heading: "'Abril Fatface', cursive",
        body: "'Poppins', sans-serif"
    },
    "editorial": {
        name: "Editorial News",
        fonts: 'DM+Serif+Display&DM+Sans:wght@400;500;700',
        heading: "'DM Serif Display', serif",
        body: "'DM Sans', sans-serif"
    },
    "friendly": {
        name: "The Street Food",
        fonts: 'Nunito:wght@400;600;700;800&Quicksand:wght@300;400;500;600;700',
        heading: "'Nunito', sans-serif",
        body: "'Quicksand', sans-serif"
    },
    "minimal": {
        name: "Nordic Minimal",
        fonts: 'Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&Proza+Libre:wght@400;500;600;700',
        heading: "'Cormorant Garamond', serif",
        body: "'Proza Libre', sans-serif"
    },
    "impact": {
        name: "The Impact Bold",
        fonts: 'Bebas+Neue&Source+Sans+Pro:wght@300;400;600;700',
        heading: "'Bebas Neue', cursive",
        body: "'Source Sans Pro', sans-serif"
    }
} as const;

const COLOR_PALETTES = {
    // --- CLÁSICOS DE COCINA (CUISINE SPECIFIC) ---
    sushi_premium: {
        name: "Sushi / Japanese",
        primary: "#BC2828",       // Rojo Atún profundo
        secondary: "#1F1F1F",     // Nori (Casi negro)
        background: "#F4F4F4",    // Arroz (Blanco roto)
        text: "#2D2D2D",          // Gris carbón
        accent: "#E6B800"         // Dorado sutil
    },
    italian_rustic: {
        name: "Italian / Pizza",
        primary: "#A32E2E",       // Tomate seco
        secondary: "#4A5D23",     // Albahaca oscura
        background: "#FDFCF5",    // Masa de pizza/Crema
        text: "#2C1810",          // Café espresso
        accent: "#D4A017"         // Aceite de oliva
    },
    mexican_fiesta: {
        name: "Mexican Fiesta",
        primary: "#E91E63",       // Rosa Mexicano
        secondary: "#FF9800",     // Naranja Cempasúchil
        background: "#FFFFFF",    // Blanco
        text: "#212121",          // Negro
        accent: "#009688"         // Turquesa
    },
    seafood_ocean: {
        name: "Seafood / Ocean",
        primary: "#006994",       // Azul Océano profundo
        secondary: "#4DB6AC",     // Espuma de mar
        background: "#F0F8FF",    // Alice Blue (muy pálido)
        text: "#1A237E",          // Azul Navy muy oscuro
        accent: "#FF6F00"         // Naranja Coral (Contraste)
    },
    steakhouse_bold: {
        name: "Steakhouse Bold",
        primary: "#8D6E63",       // Cuero envejecido
        secondary: "#212121",     // Parrilla (Negro)
        background: "#121212",    // Fondo oscuro
        text: "#E0E0E0",          // Blanco hueso
        accent: "#D32F2F"         // Rojo sangre
    },
    bakery_sweet: {
        name: "Bakery / Sweet",
        primary: "#D84315",       // Caramelo tostado
        secondary: "#FFAB91",     // Salmón suave
        background: "#FFF8E1",    // Crema batida
        text: "#4E342E",          // Chocolate
        accent: "#F06292"         // Rosa pastel
    },
    cafe_brew: {
        name: "Coffee Shop",
        primary: "#6D4C41",       // Grano de café tostado
        secondary: "#A1887F",     // Latte
        background: "#FAFAFA",    // Leche
        text: "#3E2723",          // Espresso puro
        accent: "#FFB74D"         // Croissant
    },
    fast_food: {
        name: "Fast Food",
        primary: "#FFC107",       // Amarillo Mostaza
        secondary: "#D32F2F",     // Rojo Ketchup
        background: "#FFFFFF",    // Blanco
        text: "#212121",          // Negro
        accent: "#1976D2"         // Azul Pepsi
    },

    // --- ESTILOS DE DISEÑO (VIBE BASED) ---
    modern_minimal: {
        name: "Modern Minimal",
        primary: "#212121",       // Negro casi puro
        secondary: "#757575",     // Gris medio
        background: "#FFFFFF",    // Blanco puro
        text: "#000000",          // Negro
        accent: "#2979FF"         // Azul Eléctrico (Tech)
    },
    luxury_dark: {
        name: "Luxury Dark",
        primary: "#C5A059",       // Oro metálico
        secondary: "#263238",     // Azul pizarra oscuro
        background: "#101010",    // Negro mate
        text: "#ECEFF1",          // Gris perla
        accent: "#C5A059"         // Oro (repetido para énfasis)
    },
    nordic_clean: {
        name: "Nordic Clean",
        primary: "#546E7A",       // Gris Azulado
        secondary: "#B0BEC5",     // Gris piedra
        background: "#FFFFFF",    // Blanco
        text: "#263238",          // Gris oscuro
        accent: "#FF7043"         // Terracota (Pop de color)
    },
    organic_fresh: {
        name: "Organic Fresh",
        primary: "#388E3C",       // Verde Hoja
        secondary: "#8D6E63",     // Tierra
        background: "#F1F8E9",    // Verde muy pálido
        text: "#1B5E20",          // Verde bosque oscuro
        accent: "#AFB42B"         // Lima/Oliva
    },
    urban_industrial: {
        name: "Urban Industrial",
        primary: "#FF5722",       // Naranja industrial/Ladrillo
        secondary: "#424242",     // Acero
        background: "#212121",    // Asfalto
        text: "#FFFFFF",          // Blanco
        accent: "#FFC107"         // Amarillo precaución
    },
    pastel_dream: {
        name: "Pastel Dream",
        primary: "#9575CD",       // Lavanda suave
        secondary: "#F06292",     // Rosa chicle
        background: "#F3E5F5",    // Púrpura muy pálido
        text: "#4A148C",          // Púrpura oscuro
        accent: "#4DD0E1"         // Cian suave
    },
    midnight_neon: {
        name: "Midnight Neon",
        primary: "#6200EA",       // Púrpura Neón
        secondary: "#00BFA5",     // Turquesa Neón
        background: "#000000",    // Negro Absoluto
        text: "#FFFFFF",          // Blanco
        accent: "#FFEB3B"         // Amarillo Neón
    }
} as const;

export function RestaurantDetailView({ id }: { id: string }) {
    const router = useRouter();
    const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState<Partial<Restaurant>>({});

    // Website Tab State
    const [activeTab, setActiveTab] = useState<"general" | "website" | "menu">("general");
    const [webConfig, setWebConfig] = useState<any | null>(null);
    const [loadingWebConfig, setLoadingWebConfig] = useState(false);
    const [generating, setGenerating] = useState(false);
    const [generatingPreview, setGeneratingPreview] = useState(false);
    const [sending, setSending] = useState(false);
    const [previewModalOpen, setPreviewModalOpen] = useState(false);

    const [savingWebConfig, setSavingWebConfig] = useState(false);
    const [activeLang, setActiveLang] = useState("en");
    const [newDomain, setNewDomain] = useState("");
    const [uploading, setUploading] = useState<Record<string, boolean>>({});
    const [uploadingMenuImages, setUploadingMenuImages] = useState(false);
    const [syncingPhotos, setSyncingPhotos] = useState(false);

    const handleConfigChange = (path: string, value: any) => {
        setWebConfig((prev: any) => {
            if (!prev) return null;
            const newConfig = JSON.parse(JSON.stringify(prev)); // Deep clone for safety

            // Helper to set nested value
            const parts = path.split('.');
            let current = newConfig;
            for (let i = 0; i < parts.length - 1; i++) {
                if (!current[parts[i]]) current[parts[i]] = {};
                current = current[parts[i]];
            }
            current[parts[parts.length - 1]] = value;

            return newConfig;
        });
    };

    const handleAddDomain = () => {
        if (!newDomain.trim()) return;
        const currentDomains = webConfig.config?.suggested_domains || [];
        if (!currentDomains.includes(newDomain.trim())) {
            handleConfigChange("config.suggested_domains", [...currentDomains, newDomain.trim()]);
        }
        setNewDomain("");
    };

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>, section: "hero" | "gallery" | "logo_main" | "logo_secondary") => {
        const file = event.target.files?.[0];
        if (!file || !restaurant?.id) return;

        setUploading(prev => ({ ...prev, [section]: true }));
        try {
            // Upload to backend instead of direct Firebase
            const { url: downloadURL } = await api.uploadFile(restaurant.id, file, section);

            if (section === "hero") {
                const currentImages = webConfig.config?.backgroundImages || [];
                handleConfigChange("config.backgroundImages", [...currentImages, downloadURL]);
            } else if (section === "gallery") {
                const currentImages = webConfig.config?.galleryImages || [];
                handleConfigChange("config.galleryImages", [...currentImages, downloadURL]);
            } else if (section === "logo_main") {
                handleConfigChange("config.logos.main", downloadURL);
            } else if (section === "logo_secondary") {
                handleConfigChange("config.logos.secondary", downloadURL);
            }

            // Clear input
            event.target.value = "";
        } catch (error) {
            console.error("Upload failed:", error);
            alert("Upload failed. Please ensure the backend is running and supports the upload endpoint.");
        } finally {
            setUploading(prev => ({ ...prev, [section]: false }));
        }
    };

    const handleUploadMenuImages = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (!files || files.length === 0 || !restaurant?.id) return;

        setUploadingMenuImages(true);
        try {
            const result = await api.uploadMenuPhotos(restaurant.id, files);
            if (result.menu) {
                // Construct the new menu structure { title, subtitle, categories }
                const newMenuStructure = {
                    title: "Menu",
                    subtitle: "",
                    categories: Array.isArray(result.menu)
                        ? result.menu.map((cat: any) => ({
                            name: cat.category || cat.name || "Category",
                            items: cat.items || []
                        }))
                        : []
                };

                // Populate the menu editor for the current active language
                handleConfigChange(`config.content.${activeLang}.menu`, newMenuStructure);
                alert(`¡Menú (${activeLang.toUpperCase()}) escaneado y transcrito con éxito!`);
            }
        } catch (error: any) {
            console.error("AI Transcription failed:", error);
            alert(error.message || "Hubo un error analizando las imágenes del menú.");
        } finally {
            setUploadingMenuImages(false);
            event.target.value = ""; // reset input
        }
    };

    const handleSaveConfig = async () => {
        if (!restaurant?.id || !webConfig) return;
        setSavingWebConfig(true);
        try {
            // Send the configuration object wrapped in a 'config' key as expected by the backend
            const configData = webConfig.config || webConfig;
            await api.updateWebConfig(restaurant.id, { config: configData });
            alert("Website configuration saved!");
        } catch (error) {
            console.error("Failed to update web config:", error);
            alert("Failed to save configuration.");
        } finally {
            setSavingWebConfig(false);
        }
    };

    useEffect(() => {
        if (activeTab === "website" && restaurant?.id && !webConfig) {
            fetchWebConfig();
        }
    }, [activeTab, restaurant?.id]);

    const fetchWebConfig = async () => {
        if (!restaurant?.id) return;
        try {
            setLoadingWebConfig(true);
            const config = await api.getWebConfig(restaurant.id);
            setWebConfig(config);
        } catch (error) {
            console.error("Failed to fetch web config:", error);
            // Don't alert here to avoid spamming if it's just 404
        } finally {
            setLoadingWebConfig(false);
        }
    };

    useEffect(() => {
        const fetchRestaurant = async () => {
            try {
                const data = await api.getRestaurant(id);
                setRestaurant(data);
                setFormData(data);
            } catch (error) {
                console.error("Failed to fetch restaurant:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchRestaurant();
    }, [id]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleGenerateWeb = async () => {
        if (!restaurant?.id) return;
        setGenerating(true);
        try {
            await api.createWebConfig(restaurant.id);
            alert("Website configuration generated!");
            router.refresh();
            fetchWebConfig();
        } catch (error) {
            console.error("Error generating website:", error);
            alert("Failed to generate website configuration.");
        } finally {
            setGenerating(false);
        }
    };

    const handleGeneratePreview = async () => {
        if (!webConfig?.slug) return;
        setGeneratingPreview(true);
        try {
            await api.generateThumbnail(webConfig.slug);
            alert("Preview generated!");
        } catch (error) {
            console.error("Error generating preview:", error);
            alert("Failed to generate preview.");
        } finally {
            setGeneratingPreview(false);
        }
    };

    const handleSyncPhotos = async (force: boolean = false) => {
        if (!restaurant?.id) return;
        setSyncingPhotos(true);
        try {
            const result = await api.syncRestaurantPhotos(restaurant.id, force);
            if (result.status === "skipped") {
                alert("Este restaurante ya está sincronizado.");
            } else if (result.status === "success") {
                alert(`¡Éxito! Se migraron ${result.newLY_uploaded} fotos nuevas a Azure.`);
                // Refetch restaurant data to show new photos
                const data = await api.getRestaurant(id);
                setRestaurant(data);
                setFormData(data);
            }
        } catch (error: any) {
            console.error("Error en la sincronización:", error);
            alert(error.message || "Error al sincronizar fotos.");
        } finally {
            setSyncingPhotos(false);
        }
    };

    const handleSendCommunication = () => {
        if (!restaurant?.id) return;
        setPreviewModalOpen(true);
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await api.updateRestaurant(id, formData);
            alert("Restaurant updated successfully!");
            router.refresh();
        } catch (error) {
            console.error("Failed to update restaurant:", error);
            alert("Failed to update.");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm("Are you sure you want to delete this restaurant?")) return;
        try {
            await api.deleteRestaurant(id);
            router.push("/restaurants");
        } catch (error) {
            console.error("Failed to delete restaurant:", error);
            alert("Failed to delete.");
        }
    };

    if (loading) return <div>Loading...</div>;
    if (!restaurant) return <div>Restaurant not found</div>;

    return (
        <>
            <Breadcrumb pageName={restaurant.name} />

            {/* Tabs */}
            <div className="mb-6 flex gap-4 border-b border-stroke dark:border-strokedark">
                <button
                    onClick={() => setActiveTab("general")}
                    className={`pb-2 px-4 border-b-2 transition-colors ${activeTab === "general"
                        ? "border-primary text-primary"
                        : "border-transparent text-gray-500 hover:text-black dark:text-gray-400 dark:hover:text-white"
                        }`}
                >
                    General
                </button>
                <button
                    onClick={() => setActiveTab("website")}
                    className={`pb-2 px-4 border-b-2 transition-colors ${activeTab === "website"
                        ? "border-primary text-primary"
                        : "border-transparent text-gray-500 hover:text-black dark:text-gray-400 dark:hover:text-white"
                        }`}
                >
                    Website
                </button>
                <button
                    onClick={() => setActiveTab("menu")}
                    className={`pb-2 px-4 border-b-2 transition-colors ${activeTab === "menu"
                        ? "border-primary text-primary"
                        : "border-transparent text-gray-500 hover:text-black dark:text-gray-400 dark:hover:text-white"
                        }`}
                >
                    Menu
                </button>
            </div>

            <div className="rounded-[10px] bg-white p-4 shadow-1 dark:bg-gray-dark dark:shadow-card sm:p-7.5">
                {activeTab === "general" && (
                    <>
                        {/* General Form */}
                        <div className="mb-5.5 flex flex-col gap-5.5 sm:flex-row">
                            <div className="w-full sm:w-1/2">
                                <label
                                    className="mb-3 block text-sm font-medium text-black dark:text-white"
                                    htmlFor="name"
                                >
                                    Name
                                </label>
                                <input
                                    className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                                    type="text"
                                    name="name"
                                    id="name"
                                    value={formData.name || ""}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="w-full sm:w-1/2">
                                <label
                                    className="mb-3 block text-sm font-medium text-black dark:text-white"
                                    htmlFor="address"
                                >
                                    Address
                                </label>
                                <input
                                    className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                                    type="text"
                                    name="address"
                                    id="address"
                                    value={formData.address || ""}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div className="mb-5.5 flex flex-col gap-5.5 sm:flex-row">
                            <div className="w-full sm:w-1/2">
                                <label
                                    className="mb-3 block text-sm font-medium text-black dark:text-white"
                                    htmlFor="phone"
                                >
                                    Phone
                                </label>
                                <input
                                    className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                                    type="text"
                                    name="phone"
                                    id="phone"
                                    value={formData.phone || ""}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="w-full sm:w-1/2">
                                <label
                                    className="mb-3 block text-sm font-medium text-black dark:text-white"
                                    htmlFor="website"
                                >
                                    Website
                                </label>
                                <input
                                    className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                                    type="text"
                                    name="website"
                                    id="website"
                                    value={formData.website || ""}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div className="mb-5.5 flex flex-col gap-5.5 sm:flex-row">
                            <div className="w-full sm:w-1/2">
                                <label
                                    className="mb-3 block text-sm font-medium text-black dark:text-white"
                                    htmlFor="cuisine"
                                >
                                    Cuisine
                                </label>
                                <input
                                    className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                                    type="text"
                                    name="cuisine"
                                    id="cuisine"
                                    value={formData.cuisine || ""}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="w-full sm:w-1/2">
                                <label
                                    className="mb-3 block text-sm font-medium text-black dark:text-white"
                                    htmlFor="price_range"
                                >
                                    Price Range
                                </label>
                                <input
                                    className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                                    type="text"
                                    name="price_range"
                                    id="price_range"
                                    value={formData.price_range || ""}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div className="mb-5.5 flex flex-col gap-5.5 sm:flex-row">
                            <div className="w-full sm:w-1/2">
                                <label
                                    className="mb-3 block text-sm font-medium text-black dark:text-white"
                                    htmlFor="latitude"
                                >
                                    Latitude
                                </label>
                                <input
                                    className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                                    type="number"
                                    step="any"
                                    name="latitude"
                                    id="latitude"
                                    value={formData.latitude || ""}
                                    onChange={(e) => setFormData(prev => ({ ...prev, latitude: parseFloat(e.target.value) }))}
                                />
                            </div>

                            <div className="w-full sm:w-1/2">
                                <label
                                    className="mb-3 block text-sm font-medium text-black dark:text-white"
                                    htmlFor="longitude"
                                >
                                    Longitude
                                </label>
                                <input
                                    className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                                    type="number"
                                    step="any"
                                    name="longitude"
                                    id="longitude"
                                    value={formData.longitude || ""}
                                    onChange={(e) => setFormData(prev => ({ ...prev, longitude: parseFloat(e.target.value) }))}
                                />
                            </div>
                        </div>

                        <div className="mb-5.5">
                            <label
                                className="mb-3 block text-sm font-medium text-black dark:text-white"
                                htmlFor="opening_hours"
                            >
                                Opening Hours (One per line)
                            </label>
                            <textarea
                                className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                                name="opening_hours"
                                id="opening_hours"
                                rows={6}
                                value={formData.opening_hours?.join('\n') || ""}
                                onChange={(e) => setFormData(prev => ({ ...prev, opening_hours: e.target.value.split('\n') }))}
                            />
                        </div>

                        {/* Read only info */}
                        <div className="mb-6">
                            <h3 className="mb-2 font-semibold text-black dark:text-white">
                                Details
                            </h3>
                            <p className="text-sm">Google Place ID: {restaurant.id}</p>
                            <p className="text-sm">Rating: {restaurant.rating} ({restaurant.user_ratings_total} reviews)</p>
                        </div>

                        <div className="flex justify-end gap-4.5">
                            <button
                                onClick={handleDelete}
                                className="flex justify-center rounded bg-red px-6 py-2.5 font-medium text-white hover:bg-opacity-90"
                            >
                                Delete
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="flex justify-center rounded bg-primary px-6 py-2.5 font-medium text-gray hover:bg-opacity-90 disabled:opacity-50"
                            >
                                {saving ? "Saving..." : "Save Changes"}
                            </button>
                        </div>
                    </>
                )}

                {activeTab === "website" && (
                    <div className="space-y-6">
                        {/* Top Actions */}
                        <div className="flex flex-wrap items-center justify-between gap-4">
                            <div className="flex gap-4">
                                <button
                                    onClick={handleGenerateWeb}
                                    disabled={generating}
                                    className="flex items-center justify-center p-2.5 rounded bg-primary text-white hover:bg-opacity-90 disabled:opacity-70"
                                >
                                    <GlobeIcon className="w-5 h-5 mr-2" />
                                    {generating ? "Generating..." : "Generate Website"}
                                </button>

                                {webConfig?.slug && (
                                    <>
                                        <button
                                            onClick={handleGeneratePreview}
                                            disabled={generatingPreview}
                                            className="flex items-center justify-center p-2.5 rounded border border-primary text-primary hover:bg-primary hover:text-white transition-colors disabled:opacity-70"
                                            title="Generate Preview"
                                        >
                                            <EyeIcon className="w-5 h-5 mr-2" />
                                            Update Preview
                                        </button>

                                        <button
                                            onClick={handleSendCommunication}
                                            disabled={sending}
                                            className="flex items-center justify-center p-2.5 rounded border border-meta-5 text-meta-5 hover:bg-meta-5 hover:text-white transition-colors disabled:opacity-70"
                                            title="Send Communication"
                                        >
                                            <MailIcon className="w-5 h-5 mr-2" />
                                            Send Email
                                        </button>

                                        <button
                                            onClick={() => handleSyncPhotos(false)}
                                            onContextMenu={(e) => {
                                                e.preventDefault();
                                                if (confirm("¿Forzar sincronización completa?")) {
                                                    handleSyncPhotos(true);
                                                }
                                            }}
                                            disabled={syncingPhotos}
                                            className="flex items-center justify-center p-2.5 rounded border border-meta-3 text-meta-3 hover:bg-meta-3 hover:text-white transition-colors disabled:opacity-70"
                                            title="Sync Photos from Google (Right click to force)"
                                        >
                                            <SyncIcon className={`w-5 h-5 mr-2 ${syncingPhotos ? 'animate-spin' : ''}`} />
                                            {syncingPhotos ? "Syncing..." : "Sync Photos"}
                                        </button>

                                        <a
                                            href={`${process.env.NEXT_PUBLIC_GENERATED_WEB_URL}/${webConfig.slug}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center justify-center p-2.5 rounded bg-black text-white hover:bg-opacity-90 transition-colors"
                                        >
                                            <GlobeIcon className="w-5 h-5 mr-2" />
                                            View Website
                                        </a>
                                    </>
                                )}
                            </div>
                        </div>

                        {webConfig ? (
                            <div className="space-y-8">
                                {/* Design Section */}
                                <div className="rounded border border-stroke p-4 dark:border-strokedark">
                                    <div className="flex flex-col lg:flex-row gap-8">
                                        <div className="flex-1 space-y-4">
                                            <h3 className="font-semibold text-black dark:text-white">Design</h3>
                                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                                <div>
                                                    <label className="mb-2 block text-sm font-medium">Layout</label>
                                                    <select
                                                        className="w-full rounded border border-stroke bg-transparent px-4 py-2 outline-none focus:border-primary dark:border-form-strokedark"
                                                        value={webConfig.config?.design?.layout || "visual_hero"}
                                                        onChange={(e) => handleConfigChange("config.design.layout", e.target.value)}
                                                    >
                                                        <option value="visual_hero">Visual Hero (Default)</option>
                                                        <option value="fresh">Fresh</option>
                                                        <option value="clean_modern">Clean Modern</option>
                                                        <option value="moderna">Moderna</option>
                                                        <option value="delici">Delici</option>
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="mb-2 block text-sm font-medium">Typography</label>
                                                    <select
                                                        className="w-full rounded border border-stroke bg-transparent px-4 py-2 outline-none focus:border-primary dark:border-form-strokedark"
                                                        value={webConfig.config?.design?.typography || "modern_clean"}
                                                        onChange={(e) => handleConfigChange("config.design.typography", e.target.value)}
                                                    >
                                                        {Object.entries(FONT_PAIRS).map(([key, style]) => (
                                                            <option key={key} value={key}>{style.name}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="mb-2 block text-sm font-medium">Gallery Layout</label>
                                                    <select
                                                        className="w-full rounded border border-stroke bg-transparent px-4 py-2 outline-none focus:border-primary dark:border-form-strokedark"
                                                        value={webConfig.config?.design?.galleryLayout || "grid"}
                                                        onChange={(e) => handleConfigChange("config.design.galleryLayout", e.target.value)}
                                                    >
                                                        <option value="grid">Grid (Masonry)</option>
                                                        <option value="carousel">Carousel</option>
                                                    </select>
                                                </div>
                                            </div>

                                            <div>
                                                <h4 className="mb-2 text-sm font-semibold">Theme Palette</h4>
                                                <select
                                                    className="w-full rounded border border-stroke bg-transparent px-4 py-2 outline-none focus:border-primary dark:border-form-strokedark mb-4"
                                                    onChange={(e) => {
                                                        const paletteKey = e.target.value;
                                                        if (paletteKey && COLOR_PALETTES[paletteKey as keyof typeof COLOR_PALETTES]) {
                                                            const palette = COLOR_PALETTES[paletteKey as keyof typeof COLOR_PALETTES];
                                                            handleConfigChange("config.design.colors", {
                                                                primary: palette.primary,
                                                                secondary: palette.secondary,
                                                                accent: palette.accent,
                                                                background: palette.background,
                                                                surface: "#FFFFFF", // Default surface usually white/card-bg, could be derived or added to palette if needed
                                                                text: palette.text
                                                            });
                                                        }
                                                    }}
                                                    defaultValue=""
                                                >
                                                    <option value="" disabled>Select a Preset...</option>
                                                    <optgroup label="Cuisine Specific">
                                                        {Object.entries(COLOR_PALETTES).slice(0, 8).map(([key, palette]) => (
                                                            <option key={key} value={key}>{palette.name}</option>
                                                        ))}
                                                    </optgroup>
                                                    <optgroup label="Vibe & Style">
                                                        {Object.entries(COLOR_PALETTES).slice(8).map(([key, palette]) => (
                                                            <option key={key} value={key}>{palette.name}</option>
                                                        ))}
                                                    </optgroup>
                                                </select>

                                                <h4 className="mb-2 text-sm font-semibold">Colors</h4>
                                                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-6">
                                                    {[
                                                        { key: 'primary', label: 'Primary' },
                                                        { key: 'secondary', label: 'Secondary' },
                                                        { key: 'accent', label: 'Accent' },
                                                        { key: 'background', label: 'Background' },
                                                        { key: 'surface', label: 'Surface' },
                                                        { key: 'text', label: 'Text' }
                                                    ].map((color) => (
                                                        <div key={color.key}>
                                                            <label className="mb-1 block text-xs font-medium">{color.label}</label>
                                                            <div className="flex items-center gap-2">
                                                                <input
                                                                    type="color"
                                                                    value={webConfig.config?.design?.colors?.[color.key] || "#000000"}
                                                                    onChange={(e) => handleConfigChange(`config.design.colors.${color.key}`, e.target.value)}
                                                                    className="h-8 w-8 rounded cursor-pointer border-0 p-0"
                                                                />
                                                                <input
                                                                    type="text"
                                                                    value={webConfig.config?.design?.colors?.[color.key] || ""}
                                                                    onChange={(e) => handleConfigChange(`config.design.colors.${color.key}`, e.target.value)}
                                                                    className="w-full text-xs rounded border border-stroke bg-transparent px-2 py-1 outline-none focus:border-primary dark:border-form-strokedark"
                                                                />
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                        {webConfig.thumbnail && (
                                            <div className="lg:w-1/3 flex flex-col">
                                                <h3 className="mb-4 font-semibold text-black dark:text-white">Preview</h3>
                                                <div className="relative aspect-video w-full rounded-lg border border-stroke overflow-hidden shadow-md bg-gray-100 dark:bg-meta-4">
                                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                                    <img
                                                        src={webConfig.thumbnail}
                                                        alt="Website Preview"
                                                        className="object-cover w-full h-full"
                                                    />
                                                </div>
                                                <div className="mt-2 text-center">
                                                    <a
                                                        href={`${process.env.NEXT_PUBLIC_PREVIEW_URL || "http://localhost:5173"}/${webConfig.slug}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-primary text-sm hover:underline"
                                                    >
                                                        View Live Site
                                                    </a>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Domain Management */}
                                <div className="rounded border border-stroke p-4 dark:border-strokedark">
                                    <h3 className="mb-4 font-semibold text-black dark:text-white">Domain Management</h3>
                                    <p className="mb-4 text-sm text-gray-500">Check availability for suggested domains.</p>

                                    {webConfig.config?.suggested_domains && webConfig.config.suggested_domains.length > 0 ? (
                                        <div className="space-y-3 mb-4">
                                            {webConfig.config.suggested_domains.map((domain: string) => (
                                                <DomainValidator key={domain} domain={domain} />
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-sm text-gray-500 italic mb-4">No suggested domains available.</div>
                                    )}

                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            placeholder="Add custom domain..."
                                            className="flex-1 rounded border border-stroke bg-transparent px-4 py-2 outline-none focus:border-primary dark:border-form-strokedark"
                                            value={newDomain}
                                            onChange={(e) => setNewDomain(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && handleAddDomain()}
                                        />
                                        <button
                                            onClick={handleAddDomain}
                                            disabled={!newDomain.trim()}
                                            className="px-4 py-2 bg-primary text-white rounded hover:bg-opacity-90 disabled:opacity-50"
                                        >
                                            Add
                                        </button>
                                    </div>
                                </div>

                                {/* Hero Background Images */}
                                <div className="rounded border border-stroke p-4 dark:border-strokedark">
                                    <h3 className="mb-4 font-semibold text-black dark:text-white">Hero Background Images</h3>

                                    <div className="mb-6">
                                        <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                                            Upload Custom Image
                                        </label>
                                        <div className="flex items-center gap-4">
                                            <input
                                                type="file"
                                                id="hero-upload"
                                                className="hidden"
                                                accept="image/*"
                                                onChange={(e) => handleFileUpload(e, "hero")}
                                                disabled={uploading["hero"]}
                                            />
                                            <label
                                                htmlFor="hero-upload"
                                                className="flex cursor-pointer items-center justify-center gap-2 rounded bg-primary px-4 py-2 font-medium text-white hover:bg-opacity-90 disabled:opacity-50"
                                            >
                                                {uploading["hero"] ? (
                                                    "Uploading..."
                                                ) : (
                                                    <>
                                                        <UploadIcon className="w-5 h-5" />
                                                        Upload Hero Image
                                                    </>
                                                )}
                                            </label>
                                            <p className="text-xs text-gray-500">Recommended: High resolution landscape</p>
                                        </div>
                                    </div>

                                    {/* Selected Images Sortable List */}
                                    {webConfig.config?.backgroundImages && webConfig.config.backgroundImages.length > 0 && (
                                        <div className="mb-6">
                                            <h4 className="mb-2 text-sm font-medium">Selected Images (Ordered)</h4>
                                            <p className="mb-3 text-xs text-gray-500">Reorder images to control the slideshow sequence.</p>
                                            <div className="flex gap-4 overflow-x-auto pb-4 snap-x">
                                                {webConfig.config.backgroundImages.map((img: string, idx: number) => (
                                                    <div key={`${img}-${idx}`} className="relative flex-none w-32 h-32 rounded-lg overflow-hidden border border-stroke snap-center group">
                                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                                        <img src={img} alt={`Slide ${idx + 1}`} className="w-full h-full object-cover" />

                                                        {/* Controls Overlay */}
                                                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                                                            <div className="flex gap-2">
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        if (idx > 0) {
                                                                            const newImages = [...webConfig.config.backgroundImages];
                                                                            [newImages[idx - 1], newImages[idx]] = [newImages[idx], newImages[idx - 1]];
                                                                            handleConfigChange("config.backgroundImages", newImages);
                                                                        }
                                                                    }}
                                                                    disabled={idx === 0}
                                                                    className="p-1 bg-white text-black rounded hover:bg-gray-200 disabled:opacity-50"
                                                                    title="Move Left"
                                                                >
                                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
                                                                </button>
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        if (idx < webConfig.config.backgroundImages.length - 1) {
                                                                            const newImages = [...webConfig.config.backgroundImages];
                                                                            [newImages[idx + 1], newImages[idx]] = [newImages[idx], newImages[idx + 1]];
                                                                            handleConfigChange("config.backgroundImages", newImages);
                                                                        }
                                                                    }}
                                                                    disabled={idx === webConfig.config.backgroundImages.length - 1}
                                                                    className="p-1 bg-white text-black rounded hover:bg-gray-200 disabled:opacity-50"
                                                                    title="Move Right"
                                                                >
                                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                                                                </button>
                                                            </div>
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    const newImages = webConfig.config.backgroundImages.filter((_: string, i: number) => i !== idx);
                                                                    handleConfigChange("config.backgroundImages", newImages);
                                                                }}
                                                                className="px-2 py-1 bg-red text-white text-xs rounded hover:bg-opacity-90"
                                                            >
                                                                Remove
                                                            </button>
                                                        </div>

                                                        {/* Order Badge */}
                                                        <div className="absolute top-1 left-1 bg-black/70 text-white text-xs px-1.5 py-0.5 rounded">
                                                            {idx + 1}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    <h4 className="mb-2 text-sm font-medium">Available Photos</h4>
                                    <p className="mb-4 text-sm text-gray-500">Select images from Google Maps photos to use in the hero background.</p>

                                    {restaurant.photos && restaurant.photos.length > 0 ? (
                                        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4">
                                            {restaurant.photos.slice(0, 20).map((photo, index) => {
                                                const isSelected = webConfig.config?.backgroundImages?.includes(photo);
                                                return (
                                                    <div
                                                        key={index}
                                                        onClick={() => {
                                                            const currentImages = webConfig.config?.backgroundImages || [];
                                                            let newImages;
                                                            if (isSelected) {
                                                                newImages = currentImages.filter((img: string) => img !== photo);
                                                            } else {
                                                                newImages = [...currentImages, photo];
                                                            }
                                                            handleConfigChange("config.backgroundImages", newImages);
                                                        }}
                                                        className={`relative aspect-square cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${isSelected
                                                            ? "border-primary ring-2 ring-primary ring-opacity-50"
                                                            : "border-transparent hover:border-gray-300 dark:hover:border-gray-600"
                                                            }`}
                                                    >
                                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                                        <img
                                                            src={photo}
                                                            alt={`Restaurant photo ${index + 1}`}
                                                            className={`w-full h-full object-cover transition-opacity ${isSelected ? "opacity-100" : "opacity-70 hover:opacity-100"}`}
                                                        />
                                                        {isSelected && (
                                                            <div className="absolute top-2 right-2 bg-primary text-white rounded-full p-1 shadow-md">
                                                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        <p className="text-sm text-gray-500 italic">No photos available for this restaurant.</p>
                                    )}
                                </div>

                                {/* Gallery Images */}
                                <div className="rounded border border-stroke p-4 dark:border-strokedark">
                                    <h3 className="mb-4 font-semibold text-black dark:text-white">Gallery Images</h3>

                                    <div className="mb-6">
                                        <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                                            Upload to Gallery
                                        </label>
                                        <div className="flex items-center gap-4">
                                            <input
                                                type="file"
                                                id="gallery-upload"
                                                className="hidden"
                                                accept="image/*"
                                                onChange={(e) => handleFileUpload(e, "gallery")}
                                                disabled={uploading["gallery"]}
                                            />
                                            <label
                                                htmlFor="gallery-upload"
                                                className="flex cursor-pointer items-center justify-center gap-2 rounded bg-primary px-4 py-2 font-medium text-white hover:bg-opacity-90 disabled:opacity-50"
                                            >
                                                {uploading["gallery"] ? (
                                                    "Uploading..."
                                                ) : (
                                                    <>
                                                        <UploadIcon className="w-5 h-5" />
                                                        Upload Gallery Image
                                                    </>
                                                )}
                                            </label>
                                        </div>
                                    </div>

                                    {/* Selected Gallery Images Sortable List */}
                                    {webConfig.config?.galleryImages && webConfig.config.galleryImages.length > 0 && (
                                        <div className="mb-6">
                                            <h4 className="mb-2 text-sm font-medium">Selected Images (Ordered)</h4>
                                            <p className="mb-3 text-xs text-gray-500">Reorder images to control the gallery display sequence.</p>
                                            <div className="flex gap-4 overflow-x-auto pb-4 snap-x">
                                                {webConfig.config.galleryImages.map((img: string, idx: number) => (
                                                    <div key={`gallery-${img}-${idx}`} className="relative flex-none w-32 h-32 rounded-lg overflow-hidden border border-stroke snap-center group">
                                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                                        <img src={img} alt={`Gallery ${idx + 1}`} className="w-full h-full object-cover" />

                                                        {/* Controls Overlay */}
                                                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                                                            <div className="flex gap-2">
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        if (idx > 0) {
                                                                            const newImages = [...webConfig.config.galleryImages];
                                                                            [newImages[idx - 1], newImages[idx]] = [newImages[idx], newImages[idx - 1]];
                                                                            handleConfigChange("config.galleryImages", newImages);
                                                                        }
                                                                    }}
                                                                    disabled={idx === 0}
                                                                    className="p-1 bg-white text-black rounded hover:bg-gray-200 disabled:opacity-50"
                                                                    title="Move Left"
                                                                >
                                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
                                                                </button>
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        if (idx < webConfig.config.galleryImages.length - 1) {
                                                                            const newImages = [...webConfig.config.galleryImages];
                                                                            [newImages[idx + 1], newImages[idx]] = [newImages[idx], newImages[idx + 1]];
                                                                            handleConfigChange("config.galleryImages", newImages);
                                                                        }
                                                                    }}
                                                                    disabled={idx === webConfig.config.galleryImages.length - 1}
                                                                    className="p-1 bg-white text-black rounded hover:bg-gray-200 disabled:opacity-50"
                                                                    title="Move Right"
                                                                >
                                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                                                                </button>
                                                            </div>
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    const newImages = webConfig.config.galleryImages.filter((_: string, i: number) => i !== idx);
                                                                    handleConfigChange("config.galleryImages", newImages);
                                                                }}
                                                                className="px-2 py-1 bg-red text-white text-xs rounded hover:bg-opacity-90"
                                                            >
                                                                Remove
                                                            </button>
                                                        </div>

                                                        {/* Order Badge */}
                                                        <div className="absolute top-1 left-1 bg-black/70 text-white text-xs px-1.5 py-0.5 rounded">
                                                            {idx + 1}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    <h4 className="mb-2 text-sm font-medium">Available Photos</h4>
                                    <p className="mb-4 text-sm text-gray-500">Select images from Google Maps photos to use in the gallery.</p>

                                    {restaurant.photos && restaurant.photos.length > 0 ? (
                                        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4">
                                            {restaurant.photos.slice(0, 20).map((photo, index) => {
                                                const isSelected = webConfig.config?.galleryImages?.includes(photo);
                                                return (
                                                    <div
                                                        key={`gallery-pick-${index}`}
                                                        onClick={() => {
                                                            const currentImages = webConfig.config?.galleryImages || [];
                                                            let newImages;
                                                            if (isSelected) {
                                                                newImages = currentImages.filter((img: string) => img !== photo);
                                                            } else {
                                                                newImages = [...currentImages, photo];
                                                            }
                                                            handleConfigChange("config.galleryImages", newImages);
                                                        }}
                                                        className={`relative aspect-square cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${isSelected
                                                            ? "border-primary ring-2 ring-primary ring-opacity-50"
                                                            : "border-transparent hover:border-gray-300 dark:hover:border-gray-600"
                                                            }`}
                                                    >
                                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                                        <img
                                                            src={photo}
                                                            alt={`Restaurant photo ${index + 1}`}
                                                            className={`w-full h-full object-cover transition-opacity ${isSelected ? "opacity-100" : "opacity-70 hover:opacity-100"}`}
                                                        />
                                                        {isSelected && (
                                                            <div className="absolute top-2 right-2 bg-primary text-white rounded-full p-1 shadow-md">
                                                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        <p className="text-sm text-gray-500 italic">No photos available for this restaurant.</p>
                                    )}
                                </div>
                                {/* Logo Management */}
                                <div className="rounded border border-stroke p-4 dark:border-strokedark">
                                    <h3 className="mb-4 font-semibold text-black dark:text-white">Logos</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        {/* Main Logo */}
                                        <div className="space-y-4">
                                            <h4 className="font-medium text-sm">Main Logo (Dark Background)</h4>
                                            <div className="mt-2 flex items-center gap-4">
                                                <div className="relative h-20 w-20 rounded border border-stroke bg-gray-100 dark:bg-meta-4 flex items-center justify-center overflow-hidden">
                                                    {webConfig.config?.logos?.main ? (
                                                        <img src={webConfig.config.logos.main} alt="Main Logo" className="object-contain w-full h-full" />
                                                    ) : (
                                                        <span className="text-xs text-center p-2 text-gray-500 italic">No logo uploaded</span>
                                                    )}
                                                </div>
                                                <div className="flex-1">
                                                    <input
                                                        type="file"
                                                        id="logo-main-upload"
                                                        className="hidden"
                                                        accept="image/*"
                                                        onChange={(e) => handleFileUpload(e, "logo_main")}
                                                        disabled={uploading["logo_main"]}
                                                    />
                                                    <label
                                                        htmlFor="logo-main-upload"
                                                        className="inline-flex cursor-pointer items-center justify-center gap-2 rounded bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-opacity-90 disabled:opacity-50"
                                                    >
                                                        {uploading["logo_main"] ? "Uploading..." : "Upload Logo"}
                                                    </label>
                                                    {webConfig.config?.logos?.main && (
                                                        <button
                                                            onClick={() => handleConfigChange("config.logos.main", null)}
                                                            className="block mt-2 text-xs text-red hover:underline"
                                                        >
                                                            Remove
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Secondary Logo */}
                                        <div className="space-y-4">
                                            <h4 className="font-medium text-sm">Secondary Logo (Light Background)</h4>
                                            <div className="mt-2 flex items-center gap-4">
                                                <div className="relative h-20 w-20 rounded border border-stroke bg-gray-100 dark:bg-meta-4 flex items-center justify-center overflow-hidden">
                                                    {webConfig.config?.logos?.secondary ? (
                                                        <img src={webConfig.config.logos.secondary} alt="Secondary Logo" className="object-contain w-full h-full" />
                                                    ) : (
                                                        <span className="text-xs text-center p-2 text-gray-500 italic">No logo uploaded</span>
                                                    )}
                                                </div>
                                                <div className="flex-1">
                                                    <input
                                                        type="file"
                                                        id="logo-sec-upload"
                                                        className="hidden"
                                                        accept="image/*"
                                                        onChange={(e) => handleFileUpload(e, "logo_secondary")}
                                                        disabled={uploading["logo_secondary"]}
                                                    />
                                                    <label
                                                        htmlFor="logo-sec-upload"
                                                        className="inline-flex cursor-pointer items-center justify-center gap-2 rounded bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-opacity-90 disabled:opacity-50"
                                                    >
                                                        {uploading["logo_secondary"] ? "Uploading..." : "Upload Logo"}
                                                    </label>
                                                    {webConfig.config?.logos?.secondary && (
                                                        <button
                                                            onClick={() => handleConfigChange("config.logos.secondary", null)}
                                                            className="block mt-2 text-xs text-red hover:underline"
                                                        >
                                                            Remove
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Localization Section */}
                                <div className="rounded border border-stroke p-4 dark:border-strokedark">
                                    <h3 className="mb-4 font-semibold text-black dark:text-white">Localization</h3>
                                    <div className="flex flex-col gap-4 sm:flex-row sm:justify-between">
                                        <div>
                                            <label className="mb-2 block text-sm font-medium">Supported Languages</label>
                                            <div className="flex flex-wrap gap-4">
                                                {["en", "es", "pt", "fr", "de", "it"].map((lang) => (
                                                    <label key={lang} className="flex items-center space-x-2">
                                                        <input
                                                            type="checkbox"
                                                            checked={webConfig.config?.languages?.includes(lang) || false}
                                                            onChange={(e) => {
                                                                const currentLangs = webConfig.config?.languages || [];
                                                                let newLangs;
                                                                if (e.target.checked) {
                                                                    newLangs = [...currentLangs, lang];
                                                                } else {
                                                                    newLangs = currentLangs.filter((l: string) => l !== lang);
                                                                }
                                                                handleConfigChange("config.languages", newLangs);
                                                            }}
                                                            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                                        />
                                                        <span className="text-sm uppercase">{lang}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="sm:min-w-[200px]">
                                            <label className="mb-2 block text-sm font-medium">Default Language</label>
                                            <select
                                                className="w-full rounded border border-stroke bg-transparent px-4 py-2 outline-none focus:border-primary dark:border-form-strokedark"
                                                value={webConfig.config?.defaultLanguage || webConfig.config?.languages?.[0] || "en"}
                                                onChange={(e) => handleConfigChange("config.defaultLanguage", e.target.value)}
                                            >
                                                {webConfig.config?.languages?.map((lang: string) => (
                                                    <option key={lang} value={lang}>{lang.toUpperCase()}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                {/* Content Section */}
                                <div className="rounded border border-stroke p-4 dark:border-strokedark">
                                    <div className="mb-4 flex items-center justify-between">
                                        <h3 className="font-semibold text-black dark:text-white">Content</h3>
                                        {/* Language Tabs */}
                                        <div className="flex gap-2 bg-gray-2 dark:bg-meta-4 rounded p-1">
                                            {webConfig.config?.languages?.map((lang: string) => (
                                                <button
                                                    key={lang}
                                                    onClick={() => setActiveLang(lang)}
                                                    className={`px-3 py-1 text-sm rounded transition-colors ${activeLang === lang
                                                        ? "bg-white dark:bg-gray-dark shadow text-black dark:text-white"
                                                        : "text-gray-500 hover:text-black dark:hover:text-white"
                                                        }`}
                                                >
                                                    {lang.toUpperCase()}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Active Language Fields */}
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-1 gap-4">
                                            <div>
                                                <label className="mb-2 block text-sm font-medium">Company Name ({activeLang})</label>
                                                <input
                                                    className="w-full rounded border border-stroke bg-transparent px-4 py-2 outline-none focus:border-primary dark:border-form-strokedark"
                                                    value={webConfig.config?.content?.[activeLang]?.meta?.company_name || ""}
                                                    onChange={(e) => handleConfigChange(`config.content.${activeLang}.meta.company_name`, e.target.value)}
                                                />
                                            </div>
                                            <div>
                                                <label className="mb-2 block text-sm font-medium">Page Title ({activeLang})</label>
                                                <input
                                                    className="w-full rounded border border-stroke bg-transparent px-4 py-2 outline-none focus:border-primary dark:border-form-strokedark"
                                                    value={webConfig.config?.content?.[activeLang]?.meta?.title || ""}
                                                    onChange={(e) => handleConfigChange(`config.content.${activeLang}.meta.title`, e.target.value)}
                                                />
                                            </div>
                                            <div>
                                                <label className="mb-2 block text-sm font-medium">Page Description ({activeLang})</label>
                                                <textarea
                                                    className="w-full rounded border border-stroke bg-transparent px-4 py-2 outline-none focus:border-primary dark:border-form-strokedark"
                                                    rows={2}
                                                    value={webConfig.config?.content?.[activeLang]?.meta?.description || ""}
                                                    onChange={(e) => handleConfigChange(`config.content.${activeLang}.meta.description`, e.target.value)}
                                                />
                                            </div>
                                            <div className="pt-4 border-t border-stroke dark:border-strokedark">
                                                <h4 className="mb-4 font-semibold text-sm">Hero Section</h4>
                                                <div className="grid grid-cols-1 gap-4">
                                                    <div>
                                                        <label className="mb-2 block text-sm font-medium">Hero Headline ({activeLang})</label>
                                                        <input
                                                            className="w-full rounded border border-stroke bg-transparent px-4 py-2 outline-none focus:border-primary dark:border-form-strokedark"
                                                            value={webConfig.config?.content?.[activeLang]?.hero?.headline || ""}
                                                            onChange={(e) => handleConfigChange(`config.content.${activeLang}.hero.headline`, e.target.value)}
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="mb-2 block text-sm font-medium">Hero Subheadline ({activeLang})</label>
                                                        <textarea
                                                            className="w-full rounded border border-stroke bg-transparent px-4 py-2 outline-none focus:border-primary dark:border-form-strokedark"
                                                            rows={2}
                                                            value={webConfig.config?.content?.[activeLang]?.hero?.subheadline || ""}
                                                            onChange={(e) => handleConfigChange(`config.content.${activeLang}.hero.subheadline`, e.target.value)}
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="mb-2 block text-sm font-medium">Logo Subtitle ({activeLang})</label>
                                                        <input
                                                            className="w-full rounded border border-stroke bg-transparent px-4 py-2 outline-none focus:border-primary dark:border-form-strokedark"
                                                            value={webConfig.config?.content?.[activeLang]?.hero?.logo_subtitle || ""}
                                                            onChange={(e) => handleConfigChange(`config.content.${activeLang}.hero.logo_subtitle`, e.target.value)}
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="mb-2 block text-sm font-medium">CTA Button Text ({activeLang})</label>
                                                        <input
                                                            className="w-full rounded border border-stroke bg-transparent px-4 py-2 outline-none focus:border-primary dark:border-form-strokedark"
                                                            value={webConfig.config?.content?.[activeLang]?.hero?.cta || ""}
                                                            onChange={(e) => handleConfigChange(`config.content.${activeLang}.hero.cta`, e.target.value)}
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="pt-4 border-t border-stroke dark:border-strokedark">
                                                <h4 className="mb-4 font-semibold text-sm">About Section</h4>
                                                <div className="grid grid-cols-1 gap-4">
                                                    <div>
                                                        <label className="mb-2 block text-sm font-medium">Subtitle ({activeLang})</label>
                                                        <input
                                                            className="w-full rounded border border-stroke bg-transparent px-4 py-2 outline-none focus:border-primary dark:border-form-strokedark"
                                                            value={webConfig.config?.content?.[activeLang]?.about?.subtitle || ""}
                                                            onChange={(e) => handleConfigChange(`config.content.${activeLang}.about.subtitle`, e.target.value)}
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="mb-2 block text-sm font-medium">Title ({activeLang})</label>
                                                        <input
                                                            className="w-full rounded border border-stroke bg-transparent px-4 py-2 outline-none focus:border-primary dark:border-form-strokedark"
                                                            value={webConfig.config?.content?.[activeLang]?.about?.title || ""}
                                                            onChange={(e) => handleConfigChange(`config.content.${activeLang}.about.title`, e.target.value)}
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="mb-2 block text-sm font-medium">Description ({activeLang})</label>
                                                        <textarea
                                                            className="w-full rounded border border-stroke bg-transparent px-4 py-2 outline-none focus:border-primary dark:border-form-strokedark"
                                                            rows={3}
                                                            value={webConfig.config?.content?.[activeLang]?.about?.description || ""}
                                                            onChange={(e) => handleConfigChange(`config.content.${activeLang}.about.description`, e.target.value)}
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="mb-2 block text-sm font-medium">CTA Button ({activeLang})</label>
                                                        <input
                                                            className="w-full rounded border border-stroke bg-transparent px-4 py-2 outline-none focus:border-primary dark:border-form-strokedark"
                                                            value={webConfig.config?.content?.[activeLang]?.about?.cta || ""}
                                                            onChange={(e) => handleConfigChange(`config.content.${activeLang}.about.cta`, e.target.value)}
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="mb-2 block text-sm font-medium">Years of Experience ({activeLang})</label>
                                                        <input
                                                            className="w-full rounded border border-stroke bg-transparent px-4 py-2 outline-none focus:border-primary dark:border-form-strokedark"
                                                            value={webConfig.config?.content?.[activeLang]?.about?.yearsOfExperience || ""}
                                                            onChange={(e) => handleConfigChange(`config.content.${activeLang}.about.yearsOfExperience`, e.target.value)}
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="mb-2 block text-sm font-medium">Image URL</label>
                                                        <input
                                                            className="w-full rounded border border-stroke bg-transparent px-4 py-2 outline-none focus:border-primary dark:border-form-strokedark"
                                                            value={webConfig.config?.content?.[activeLang]?.about?.image || ""}
                                                            onChange={(e) => handleConfigChange(`config.content.${activeLang}.about.image`, e.target.value)}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Contact & Socials */}
                                <div className="rounded border border-stroke p-4 dark:border-strokedark">
                                    <h3 className="mb-4 font-semibold text-black dark:text-white">Contact & Socials</h3>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* Contact Info */}
                                        <div className="space-y-4">
                                            <h4 className="font-medium text-sm text-gray-500">Contact Information</h4>
                                            <div>
                                                <label className="mb-2 block text-sm font-medium">Public Email</label>
                                                <input
                                                    className="w-full rounded border border-stroke bg-transparent px-4 py-2 outline-none focus:border-primary dark:border-form-strokedark"
                                                    value={webConfig.config?.contact?.email || ""}
                                                    onChange={(e) => handleConfigChange("config.contact.email", e.target.value)}
                                                    placeholder="contact@restaurant.com"
                                                />
                                            </div>
                                            <div>
                                                <label className="mb-2 block text-sm font-medium">Phone Number</label>
                                                <input
                                                    className="w-full rounded border border-stroke bg-transparent px-4 py-2 outline-none focus:border-primary dark:border-form-strokedark"
                                                    value={webConfig.config?.contact?.phone || ""}
                                                    onChange={(e) => handleConfigChange("config.contact.phone", e.target.value)}
                                                    placeholder="+1 234 567 890"
                                                />
                                            </div>
                                            <div>
                                                <label className="mb-2 block text-sm font-medium">WhatsApp</label>
                                                <input
                                                    className="w-full rounded border border-stroke bg-transparent px-4 py-2 outline-none focus:border-primary dark:border-form-strokedark"
                                                    value={webConfig.config?.contact?.whatsapp || ""}
                                                    onChange={(e) => handleConfigChange("config.contact.whatsapp", e.target.value)}
                                                    placeholder="+1 234 567 890"
                                                />
                                            </div>
                                        </div>

                                        {/* Social Media */}
                                        <div className="space-y-4">
                                            <h4 className="font-medium text-sm text-gray-500">Social Networks</h4>
                                            <div>
                                                <label className="mb-2 block text-sm font-medium">Instagram</label>
                                                <input
                                                    className="w-full rounded border border-stroke bg-transparent px-4 py-2 outline-none focus:border-primary dark:border-form-strokedark"
                                                    value={webConfig.config?.socials?.instagram || ""}
                                                    onChange={(e) => handleConfigChange("config.socials.instagram", e.target.value)}
                                                    placeholder="https://instagram.com/..."
                                                />
                                            </div>
                                            <div>
                                                <label className="mb-2 block text-sm font-medium">Facebook</label>
                                                <input
                                                    className="w-full rounded border border-stroke bg-transparent px-4 py-2 outline-none focus:border-primary dark:border-form-strokedark"
                                                    value={webConfig.config?.socials?.facebook || ""}
                                                    onChange={(e) => handleConfigChange("config.socials.facebook", e.target.value)}
                                                    placeholder="https://facebook.com/..."
                                                />
                                            </div>
                                            <div>
                                                <label className="mb-2 block text-sm font-medium">Twitter (X)</label>
                                                <input
                                                    className="w-full rounded border border-stroke bg-transparent px-4 py-2 outline-none focus:border-primary dark:border-form-strokedark"
                                                    value={webConfig.config?.socials?.twitter || ""}
                                                    onChange={(e) => handleConfigChange("config.socials.twitter", e.target.value)}
                                                    placeholder="https://twitter.com/..."
                                                />
                                            </div>
                                            <div>
                                                <label className="mb-2 block text-sm font-medium">TikTok</label>
                                                <input
                                                    className="w-full rounded border border-stroke bg-transparent px-4 py-2 outline-none focus:border-primary dark:border-form-strokedark"
                                                    value={webConfig.config?.socials?.tiktok || ""}
                                                    onChange={(e) => handleConfigChange("config.socials.tiktok", e.target.value)}
                                                    placeholder="https://tiktok.com/@..."
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between mt-6">
                                    <div className="text-xs text-gray-500">
                                        Slug: {webConfig.slug}
                                    </div>
                                    <button
                                        onClick={handleSaveConfig}
                                        disabled={savingWebConfig}
                                        className="flex justify-center rounded bg-primary px-6 py-2.5 font-medium text-white hover:bg-opacity-90 disabled:opacity-50"
                                    >
                                        {savingWebConfig ? "Saving..." : "Save Configuration"}
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-12 text-gray-500">
                                {loadingWebConfig ? "Loading configuration..." : "No website configuration found. Click 'Generate Website' to create one."}
                            </div>
                        )}
                    </div>
                )}

                {activeTab === "menu" && (
                    <div className="space-y-6">
                        <div className="rounded border border-stroke p-4 dark:border-strokedark bg-gray-50 dark:bg-meta-4 mb-6">
                            <h4 className="mb-2 font-semibold text-black dark:text-white flex items-center gap-2">
                                <UploadIcon className="w-5 h-5 text-primary" />
                                Transcripción de Menú con IA
                            </h4>
                            <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
                                Sube fotos de tu menú físico. Nuestra Inteligencia Artificial las analizará y las convertirá en formato digital estructurado automáticamente. (Toma de 5 a 15 segundos)
                            </p>

                            <div className="flex items-center gap-4">
                                <label className="relative cursor-pointer w-full sm:w-auto">
                                    <input
                                        type="file"
                                        multiple
                                        accept="image/*"
                                        className="hidden"
                                        onChange={handleUploadMenuImages}
                                        disabled={uploadingMenuImages}
                                    />
                                    <div className={`flex w-full sm:w-auto items-center justify-center rounded px-6 py-2.5 font-medium text-white transition-colors ${uploadingMenuImages ? 'bg-gray-400 cursor-not-allowed' : 'bg-primary hover:bg-opacity-90'}`}>
                                        {uploadingMenuImages ? 'Analizando imágenes con Inteligencia Artificial... 🤖' : 'Subir fotos del menú'}
                                    </div>
                                </label>
                            </div>
                        </div>

                        <div className="rounded border border-stroke p-4 dark:border-strokedark">
                            {webConfig ? (
                                <>
                                    <div className="mb-6 flex items-center justify-between">
                                        <h3 className="font-semibold text-black dark:text-white">Menu Editor</h3>
                                        {/* Language Tabs for Menu */}
                                        <div className="flex gap-2 bg-gray-2 dark:bg-meta-4 rounded p-1">
                                            {webConfig.config?.languages?.map((lang: string) => (
                                                <button
                                                    key={lang}
                                                    onClick={() => setActiveLang(lang)}
                                                    className={`px-3 py-1 text-sm rounded transition-colors ${activeLang === lang
                                                        ? "bg-white dark:bg-gray-dark shadow text-black dark:text-white"
                                                        : "text-gray-500 hover:text-black dark:hover:text-white"
                                                        }`}
                                                >
                                                    {lang.toUpperCase()}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <p className="mb-6 text-sm text-gray-500">Add categories and specific items to build your interactive menu layout for the <strong>{activeLang.toUpperCase()}</strong> version.</p>

                                    <MenuEditor
                                        key={`${activeLang}-${webConfig?.id}`} // Force re-render on language change
                                        menuData={webConfig?.config?.content?.[activeLang]?.menu || {}}
                                        onChange={(newMenu) => handleConfigChange(`config.content.${activeLang}.menu`, newMenu)}
                                    />
                                </>
                            ) : (
                                <div className="text-center py-6 text-gray-400">
                                    No website configuration found. Generate a website first to use the Menu Editor.
                                </div>
                            )}

                            <div className="mt-4 flex justify-end">
                                <button
                                    onClick={handleSaveConfig}
                                    disabled={savingWebConfig}
                                    className="flex justify-center rounded bg-primary px-6 py-2.5 font-medium text-white hover:bg-opacity-90 disabled:opacity-50"
                                >
                                    {savingWebConfig ? "Saving..." : "Save Menu"}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div >

            {/* Email Preview Modal */}
            {
                previewModalOpen && restaurant?.id && (
                    <EmailPreviewModal
                        propertyId={restaurant.id}
                        onClose={(sent) => {
                            setPreviewModalOpen(false);
                            if (sent) {
                                alert("Email sent successfully!");
                            }
                        }}
                    />
                )
            }
        </>
    );
}
