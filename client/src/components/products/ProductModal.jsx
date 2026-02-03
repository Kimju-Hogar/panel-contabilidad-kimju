import React, { useState, useEffect } from 'react';
import { X, Save, Upload } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../api/axios';

const ProductModal = ({ isOpen, onClose, onSave, initialData = null }) => {
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

    const [imageFile, setImageFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState('');
    const [uploading, setUploading] = useState(false);
    const [margin, setMargin] = useState({ amount: 0, percentage: 0 });

    useEffect(() => {
        if (initialData) {
            setFormData(initialData);
            setPreviewUrl(initialData.image || '');
            setImageFile(null);
        } else {
            setFormData({
                name: '',
                sku: '',
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
    }, [initialData, isOpen]);

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
            return res.data; // URL path from server
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

            onSave({ ...formData, image: imageUrl });
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
                                {/* Image Upload */}
                                <div>
                                    <label className="block text-sm font-medium mb-2">Imagen del Producto</label>
                                    <div className="flex items-center gap-4">
                                        <div className="w-24 h-24 rounded-lg bg-muted border-2 border-dashed border-border flex items-center justify-center overflow-hidden relative">
                                            {previewUrl ? (
                                                <img src={`http://localhost:5000${previewUrl.startsWith('/') ? '' : '/'}${previewUrl}`} onError={(e) => e.target.src = previewUrl} alt="Preview" className="w-full h-full object-cover" />
                                            ) : (
                                                <Upload className="text-muted-foreground" size={24} />
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleFileChange}
                                                className="block w-full text-sm text-muted-foreground
                                                    file:mr-4 file:py-2 file:px-4
                                                    file:rounded-full file:border-0
                                                    file:text-sm file:font-semibold
                                                    file:bg-primary/10 file:text-primary
                                                    hover:file:bg-primary/20
                                                "
                                            />
                                            <p className="text-xs text-muted-foreground mt-1">JPG, PNG o WebP. Máx 5MB.</p>
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
                                        <input
                                            type="text"
                                            name="sku"
                                            value={formData.sku}
                                            onChange={handleChange}
                                            className="w-full p-2 rounded-md border border-input bg-background"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Categoría</label>
                                        <select
                                            name="category"
                                            value={formData.category}
                                            onChange={handleChange}
                                            className="w-full p-2 rounded-md border border-input bg-background"
                                            required
                                        >
                                            <option value="">Seleccionar...</option>
                                            <option value="Hogar">Hogar</option>
                                            <option value="Tecnología">Tecnología</option>
                                            <option value="Juguetes">Juguetes</option>
                                            <option value="Belleza">Belleza</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Right Col: Financials */}
                            <div className="space-y-4">
                                <h3 className="text-sm font-semibold text-primary uppercase tracking-wider">Precios y Stock</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Costo ($)</label>
                                        <input
                                            type="number"
                                            name="costPrice"
                                            value={formData.costPrice}
                                            onChange={handleChange}
                                            className="w-full p-2 rounded-md border border-input bg-background"
                                            min="0"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Precio Venta ($)</label>
                                        <input
                                            type="number"
                                            name="publicPrice"
                                            value={formData.publicPrice}
                                            onChange={handleChange}
                                            className="w-full p-2 rounded-md border border-input bg-background"
                                            min="0"
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Margin Info */}
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
