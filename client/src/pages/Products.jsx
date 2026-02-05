import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, Edit, Trash2, AlertCircle, Check, Image as ImageIcon } from 'lucide-react';
import api from '../api/axios';
import ProductModal from '../components/products/ProductModal';
import { IMAGE_BASE_URL } from '../config/constants';
import { getImageUrl } from '../utils/imageUtils';

const Products = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);

    // Quick Edit State
    const [quickEdit, setQuickEdit] = useState({ id: null, field: null, value: '' });

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const { data } = await api.get('/products');
            setProducts(data);
        } catch (error) {
            console.error("Error fetching products", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const handleSaveProduct = async (productData) => {
        try {
            if (editingProduct) {
                await api.put(`/products/${editingProduct._id}`, productData);
            } else {
                await api.post('/products', productData);
            }
            fetchProducts();
            setIsModalOpen(false);
            setEditingProduct(null);
        } catch (error) {
            alert('Error al guardar producto: ' + (error.response?.data?.message || error.message));
        }
    };

    const handleDelete = async (id) => {
        if (confirm('¿Estás seguro de eliminar este producto?')) {
            try {
                await api.delete(`/products/${id}`);
                fetchProducts();
            } catch (error) {
                alert('Error al eliminar');
            }
        }
    };

    // Quick Update Logic
    const handleQuickUpdate = async (id, field, value) => {
        try {
            // Optimistic update
            setProducts(prev => prev.map(p => p._id === id ? { ...p, [field]: value } : p));

            await api.put(`/products/${id}`, { [field]: value });
            setQuickEdit({ id: null, field: null, value: '' });
        } catch (error) {
            console.error("Quick update failed", error);
            fetchProducts(); // Revert on failure
        }
    };

    const startQuickEdit = (product, field) => {
        setQuickEdit({ id: product._id, field, value: product[field] });
    };

    const handleKeyDown = (e, id, field) => {
        if (e.key === 'Enter') {
            handleQuickUpdate(id, field, quickEdit.value);
        } else if (e.key === 'Escape') {
            setQuickEdit({ id: null, field: null, value: '' });
        }
    };

    const openEdit = (product) => {
        setEditingProduct(product);
        setIsModalOpen(true);
    };

    const openCreate = () => {
        setEditingProduct(null);
        setIsModalOpen(true);
    };

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Inventario</h1>
                    <p className="text-muted-foreground">Gestiona tus productos, precios y existencias.</p>
                </div>
                <button
                    onClick={openCreate}
                    className="bg-primary text-primary-foreground px-6 py-3 rounded-xl flex items-center space-x-2 hover:bg-primary/90 transition-all shadow-lg hover:shadow-primary/25 active:scale-95"
                >
                    <Plus size={20} />
                    <span className="font-semibold">Nuevo Producto</span>
                </button>
            </div>

            {/* Simple Filters */}
            <div className="bg-card p-2 rounded-2xl border border-border shadow-sm flex items-center gap-2 max-w-md">
                <div className="pl-3 text-muted-foreground">
                    <Search size={20} />
                </div>
                <input
                    type="text"
                    placeholder="Buscar producto..."
                    className="flex-1 bg-transparent p-2 outline-none text-foreground placeholder:text-muted-foreground/70"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* Table */}
            <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-muted/30 text-muted-foreground font-semibold border-b border-border text-xs uppercase tracking-wider">
                            <tr>
                                <th className="p-5">Producto</th>
                                <th className="p-5 text-center">Stock (Rápido)</th>
                                <th className="p-5 text-right">Precio (Rápido)</th>
                                <th className="p-5 text-center">Estado</th>
                                <th className="p-5 text-center">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/50">
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="p-12 text-center text-muted-foreground">
                                        <div className="flex flex-col items-center gap-2">
                                            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                                            <span>Cargando inventario...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredProducts.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="p-12 text-center text-muted-foreground">
                                        <p>No se encontraron productos.</p>
                                    </td>
                                </tr>
                            ) : (
                                filteredProducts.map((product) => (
                                    <tr key={product._id} className="hover:bg-muted/30 transition-colors group">
                                        <td className="p-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-lg bg-muted border border-border overflow-hidden shrink-0">
                                                    {product.image ? (
                                                        <img
                                                            src={getImageUrl(product.image)}
                                                            alt={product.name}
                                                            className="w-full h-full object-cover"
                                                            loading="lazy"
                                                            onError={(e) => {
                                                                e.target.onerror = null;
                                                                e.target.style.display = 'none'; // Hide if broken
                                                                e.target.parentElement.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-image text-muted-foreground"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>';
                                                            }}
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                                                            <ImageIcon size={20} />
                                                        </div>
                                                    )}
                                                </div>
                                                <div>
                                                    <div className="font-semibold text-foreground text-base">{product.name}</div>
                                                    <div className="text-sm text-muted-foreground flex gap-2">
                                                        <span>{product.sku}</span>
                                                        <span className="text-border">•</span>
                                                        <span>{product.category}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Inline Stock Edit */}
                                        <td className="p-4 text-center">
                                            {quickEdit.id === product._id && quickEdit.field === 'stock' ? (
                                                <input
                                                    autoFocus
                                                    type="number"
                                                    className="w-20 p-1 text-center bg-background border-2 border-primary rounded-md outline-none font-bold"
                                                    value={quickEdit.value}
                                                    onChange={(e) => setQuickEdit({ ...quickEdit, value: e.target.value })}
                                                    onBlur={() => handleQuickUpdate(product._id, 'stock', quickEdit.value)}
                                                    onKeyDown={(e) => handleKeyDown(e, product._id, 'stock')}
                                                />
                                            ) : (
                                                <div
                                                    onClick={() => startQuickEdit(product, 'stock')}
                                                    className={`cursor-pointer inline-flex items-center px-3 py-1 rounded-full text-sm font-bold border transition-all ${product.stock <= product.minStock
                                                        ? 'bg-red-500/10 text-red-600 border-red-200'
                                                        : 'bg-green-500/10 text-green-600 border-green-200 hover:border-green-400'
                                                        }`}
                                                >
                                                    {product.stock}
                                                </div>
                                            )}
                                        </td>

                                        {/* Inline Price Edit */}
                                        <td className="p-4 text-right">
                                            {quickEdit.id === product._id && quickEdit.field === 'publicPrice' ? (
                                                <input
                                                    autoFocus
                                                    type="number"
                                                    className="w-24 p-1 text-right bg-background border-2 border-primary rounded-md outline-none font-bold"
                                                    value={quickEdit.value}
                                                    onChange={(e) => setQuickEdit({ ...quickEdit, value: e.target.value })}
                                                    onBlur={() => handleQuickUpdate(product._id, 'publicPrice', quickEdit.value)}
                                                    onKeyDown={(e) => handleKeyDown(e, product._id, 'publicPrice')}
                                                />
                                            ) : (
                                                <div
                                                    onClick={() => startQuickEdit(product, 'publicPrice')}
                                                    className="cursor-pointer font-bold text-foreground hover:text-primary transition-colors"
                                                >
                                                    ${product.publicPrice.toLocaleString()}
                                                </div>
                                            )}
                                        </td>

                                        <td className="p-4 text-center">
                                            <div className={`text-xs font-semibold px-2 py-0.5 rounded ${product.status === 'active' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'}`}>
                                                {product.status === 'active' ? 'Activo' : 'Inactivo'}
                                            </div>
                                        </td>

                                        <td className="p-4 text-center">
                                            <div className="flex items-center justify-center space-x-1">
                                                <button
                                                    onClick={() => openEdit(product)}
                                                    className="p-2 hover:bg-primary/10 text-primary rounded-lg transition-colors"
                                                    title="Editar Detalle"
                                                >
                                                    <Edit size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(product._id)}
                                                    className="p-2 hover:bg-destructive/10 text-destructive rounded-lg transition-colors"
                                                    title="Eliminar"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <ProductModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSaveProduct}
                initialData={editingProduct}
                totalProducts={products.length}
            />
        </div>
    );
};

export default Products;
