import React, { useState, useEffect } from 'react';
import { X, Save, Upload, Check, Plus, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../api/axios';
import { IMAGE_BASE_URL } from '../../config/constants';
import { getImageUrl } from '../../utils/imageUtils';
import CurrencyInput from '../common/CurrencyInput';

const ProductModal = ({ isOpen, onClose, onSave, initialData = null, totalProducts = 0 }) => {
    const [formData, setFormData] = useState({
        name: '',
        sku: '',
        category: '',
        distributor: '',
        costPrice: '',
        publicPrice: '',
        stock: '',
        minStock: '',
        image: ''
    });

    const [categories, setCategories] = useState([]);
    const [newCategory, setNewCategory] = useState('');
    const [isAddingCategory, setIsAddingCategory] = useState(false);

    const [imageFile, setImageFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState('');
    const [uploading, setUploading] = useState(false);
    const [margin, setMargin] = useState({ amount: 0, percentage: 0 });

    // Fetch Categories
    useEffect(() => {
        if (isOpen) {
            fetchCategories();
        }
    }, [isOpen]);

    const fetchCategories = async () => {
        try {
            const res = await api.get('/categories');
            setCategories(res.data);
        } catch (error) {
            console.error("Failed to fetch categories", error);
        }
    };

    const handleCreateCategory = async (e) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }

        // DEBUG: Verify function is called
        // alert('DEBUG: Function called with: ' + newCategory);

        if (!newCategory.trim()) return;

        try {
            const res = await api.post('/categories', { name: newCategory });
            setCategories([...categories, res.data]);
            setFormData(prev => ({ ...prev, category: res.data.name }));
            setNewCategory('');
            setIsAddingCategory(false);
        } catch (error) {
            console.error("Failed to create category", error);
            alert('Error al crear categoría: ' + (error.response?.data?.message || error.message));
        }
    };

    useEffect(() => {
        if (initialData) {
            setFormData(initialData);
            setPreviewUrl(initialData.image || '');
            setImageFile(null);
        } else {
            // Auto-generate SKU for new products
            const nextSku = `PROD-${String(totalProducts + 1).padStart(3, '0')}`;

            setFormData({
                name: '',
                sku: nextSku,
                category: '',
                distributor: '',
                costPrice: 0,
                publicPrice: 0,
                stock: 0,
                minStock: 5,
                image: ''
            });
            setPreviewUrl('');
            setImageFile(null);
        }
    }, [initialData, isOpen, totalProducts]);

    useEffect(() => {
        const cost = parseFloat(formData.costPrice) || 0;
        const price = parseFloat(formData.publicPrice) || 0;

        if (price > 0) {
            const amount = price - cost;
            const percentage = (amount / price) * 100;
            setMargin({ amount, percentage });
        } else {
            setMargin({ amount: 0, percentage: 0 });
        }
    }, [formData.costPrice, formData.publicPrice]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const uploadImage = async () => {
        if (!imageFile) return formData.image;

        const data = new FormData();
        data.append('image', imageFile);

        try {
            const res = await api.post('/upload', data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            return res.data.imagePath;
        } catch (error) {
            console.error('Upload failed', error);
            throw new Error('Error al subir la imagen');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setUploading(true);
        try {
            let imageUrl = formData.image;
            if (imageFile) {
                imageUrl = await uploadImage();
            }

            onSave({
                ...formData,
                image: imageUrl,
                costPrice: Number(formData.costPrice) || 0,
                publicPrice: Number(formData.publicPrice) || 0,
                stock: Number(formData.stock) || 0,
                minStock: Number(formData.minStock) || 0
            });
        } catch (error) {
            alert('Error al guardar el producto');
        } finally {
            setUploading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-card w-full max-w-2xl rounded-xl shadow-lg border border-border overflow-hidden max-h-[90vh] overflow-y-auto"
                >
                    <div className="flex justify-between items-center p-6 border-b border-border bg-muted/30 sticky top-0 bg-card z-10">
                        <h2 className="text-xl font-bold">{initialData ? 'Editar Producto' : 'Nuevo Producto'}</h2>
                        <button onClick={onClose} className="text-muted-foreground hover:text-destructive transition-colors">
                            <X size={24} />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="p-6 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Left Col: Image & General */}
                            <div className="space-y-4">
                                <div className="col-span-1 md:col-span-2">
                                    <label className="block text-sm font-medium mb-2">Imagen del Producto</label>
                                    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center p-4 border border-dashed border-border rounded-xl bg-muted/20 hover:bg-muted/40 transition-colors">
                                        <div className="relative group w-32 h-32 rounded-lg bg-background border border-border flex items-center justify-center overflow-hidden shadow-sm">
                                            {previewUrl ? (
                                                <img
                                                    src={getImageUrl(previewUrl)}
                                                    onError={(e) => {
                                                        e.target.onerror = null;
                                                        e.target.src = "https://placehold.co/150x150?text=No+Image";
                                                    }}
                                                    alt="Preview"
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="text-center p-2">
                                                    <Upload className="mx-auto text-muted-foreground mb-1" size={24} />
                                                    <span className="text-xs text-muted-foreground">Sin imagen</span>
                                                </div>
                                            )}
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer">
                                                <p className="text-white text-xs font-bold">Cambiar</p>
                                            </div>
                                        </div>

                                        <div className="flex-1 space-y-2">
                                            <p className="text-sm font-medium">Selecciona una imagen</p>
                                            <p className="text-xs text-muted-foreground">Recomendado: 500x500px. Soporta JPG, PNG, WEBP.</p>
                                            <input type="file" accept="image/*" onChange={handleFileChange} id="image-upload" className="hidden" />
                                            <label htmlFor="image-upload" className="inline-flex items-center px-4 py-2 bg-secondary text-secondary-foreground rounded-lg text-sm font-medium hover:bg-secondary/90 cursor-pointer transition-colors">
                                                <Upload size={16} className="mr-2" />
                                                Elegir Archivo
                                            </label>
                                            {imageFile && (
                                                <span className="ml-3 text-xs text-green-600 font-bold flex items-center inline-block">
                                                    <Check size={14} className="mr-1" />
                                                    Listo
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <h3 className="text-sm font-semibold text-primary uppercase tracking-wider pt-2">Información General</h3>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Nombre</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        className="w-full p-2 rounded-md border border-input bg-background focus:ring-2 focus:ring-primary/20 outline-none"
                                        required
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-1">SKU</label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                name="sku"
                                                value={formData.sku}
                                                onChange={handleChange}
                                                className="w-full p-2 rounded-md border border-input bg-background font-mono text-sm"
                                                required
                                            />
                                            {!initialData && (
                                                <div className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">
                                                    Auto
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1 flex justify-between">
                                            Categoría
                                            {!isAddingCategory && (
                                                <button
                                                    type="button"
                                                    onClick={() => setIsAddingCategory(true)}
                                                    className="text-primary text-xs hover:underline flex items-center"
                                                >
                                                    <Plus size={12} className="mr-1" /> Nueva
                                                </button>
                                            )}
                                        </label>

                                        {isAddingCategory ? (
                                            <div className="flex gap-2 items-center mt-1 relative z-20">
                                                <input
                                                    type="text"
                                                    value={newCategory}
                                                    onChange={(e) => setNewCategory(e.target.value)}
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter') {
                                                            e.preventDefault();
                                                            handleCreateCategory(e);
                                                        }
                                                    }}
                                                    placeholder="Nueva categoría..."
                                                    className="flex-1 p-2 rounded-md border border-input bg-background"
                                                    autoFocus
                                                />
                                                <button
                                                    type="button"
                                                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleCreateCategory(e); }}
                                                    disabled={!newCategory.trim()}
                                                    className="px-3 py-2 bg-primary text-primary-foreground rounded-md disabled:opacity-50"
                                                >
                                                    <Check size={16} />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIsAddingCategory(false); }}
                                                    className="px-3 py-2 bg-muted text-muted-foreground rounded-md"
                                                >
                                                    <X size={16} />
                                                </button>
                                            </div>
                                        ) : (
                                            <select
                                                name="category"
                                                value={formData.category}
                                                onChange={handleChange}
                                                className="w-full p-2 rounded-md border border-input bg-background"
                                                required
                                            >
                                                <option value="">Seleccionar...</option>
                                                {categories.map((cat) => (
                                                    <option key={cat._id} value={cat.name}>{cat.name}</option>
                                                ))}
                                            </select>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Right Col: Financials */}
                            <div className="space-y-4">
                                <h3 className="text-sm font-semibold text-primary uppercase tracking-wider">Precios y Stock</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Costo ($)</label>
                                        <CurrencyInput
                                            name="costPrice"
                                            value={formData.costPrice}
                                            onChange={handleChange}
                                            className="w-full p-2 rounded-md border border-input bg-background"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Precio Venta ($)</label>
                                        <CurrencyInput
                                            name="publicPrice"
                                            value={formData.publicPrice}
                                            onChange={handleChange}
                                            className="w-full p-2 rounded-md border border-input bg-background"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="p-3 bg-accent/50 rounded-lg flex justify-between items-center text-sm">
                                    <div>
                                        <span className="block text-muted-foreground text-xs">Margen</span>
                                        <span className={`font-bold ${margin.amount >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                                            ${margin.amount.toLocaleString()}
                                        </span>
                                    </div>
                                    <div className="text-right">
                                        <span className="block text-muted-foreground text-xs">Rentabilidad</span>
                                        <span className={`font-bold ${margin.percentage >= 30 ? 'text-green-600' : 'text-yellow-600'}`}>
                                            {margin.percentage.toFixed(1)}%
                                        </span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Stock Actual</label>
                                        <input
                                            type="number"
                                            name="stock"
                                            value={formData.stock}
                                            onChange={handleChange}
                                            className="w-full p-2 rounded-md border border-input bg-background"
                                            min="0"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Distribuidor</label>
                                        <input
                                            type="text"
                                            name="distributor"
                                            value={formData.distributor}
                                            onChange={handleChange}
                                            className="w-full p-2 rounded-md border border-input bg-background"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Stock Mínimo</label>
                                        <input
                                            type="number"
                                            name="minStock"
                                            value={formData.minStock}
                                            onChange={handleChange}
                                            className="w-full p-2 rounded-md border border-input bg-background"
                                            min="0"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end space-x-3 pt-6 border-t border-border">
                            <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg text-muted-foreground hover:bg-accent transition-colors">
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                disabled={uploading}
                                className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 flex items-center space-x-2 transition-colors disabled:opacity-70"
                            >
                                {uploading ? (
                                    <span>Subiendo...</span>
                                ) : (
                                    <>
                                        <Save size={18} />
                                        <span>Guardar Producto</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default ProductModal;
