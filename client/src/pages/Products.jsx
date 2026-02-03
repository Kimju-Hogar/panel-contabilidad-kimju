import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, Edit, Trash2, AlertCircle } from 'lucide-react';
import api from '../api/axios';
import ProductModal from '../components/products/ProductModal';

const Products = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);

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
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <h1 className="text-3xl font-bold text-foreground">Inventario</h1>
                <button
                    onClick={openCreate}
                    className="bg-primary text-primary-foreground px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-primary/90 transition-all shadow-md hover:shadow-lg"
                >
                    <Plus size={20} />
                    <span>Nuevo Producto</span>
                </button>
            </div>

            {/* Filters */}
            <div className="bg-card p-4 rounded-xl border border-border shadow-sm flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
                    <input
                        type="text"
                        placeholder="Buscar por nombre o SKU..."
                        className="w-full pl-10 pr-4 py-2 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary/20 outline-none"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <button className="flex items-center space-x-2 px-4 py-2 border border-border rounded-lg hover:bg-accent text-muted-foreground">
                    <Filter size={20} />
                    <span>Filtros</span>
                </button>
            </div>

            {/* Table */}
            <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-muted/50 text-muted-foreground font-medium border-b border-border">
                            <tr>
                                <th className="p-4">Producto</th>
                                <th className="p-4">SKU</th>
                                <th className="p-4">Categoría</th>
                                <th className="p-4 text-right">Precio Venta</th>
                                <th className="p-4 text-center">Stock</th>
                                <th className="p-4 text-center">Margen</th>
                                <th className="p-4 text-center">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {loading ? (
                                <tr>
                                    <td colSpan="7" className="p-8 text-center text-muted-foreground">Cargando inventario...</td>
                                </tr>
                            ) : filteredProducts.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="p-8 text-center text-muted-foreground">No se encontraron productos.</td>
                                </tr>
                            ) : (
                                filteredProducts.map((product) => (
                                    <tr key={product._id} className="hover:bg-accent/50 transition-colors group">
                                        <td className="p-4 font-medium text-foreground flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-md bg-muted border border-border overflow-hidden">
                                                {product.image ? (
                                                    <img
                                                        src={`http://localhost:5000${product.image.startsWith('/') ? '' : '/'}${product.image}`}
                                                        alt={product.name}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground uppercase">IMG</div>
                                                )}
                                            </div>
                                            {product.name}
                                        </td>
                                        <td className="p-4 text-muted-foreground">{product.sku}</td>
                                        <td className="p-4">
                                            <span className="px-2 py-1 rounded-full text-xs bg-secondary text-secondary-foreground font-medium">
                                                {product.category}
                                            </span>
                                        </td>
                                        <td className="p-4 text-right font-medium text-foreground">
                                            ${product.publicPrice.toLocaleString()}
                                        </td>
                                        <td className="p-4 text-center">
                                            <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-bold ${product.stock <= product.minStock ? 'bg-red-500/10 text-red-500' : 'bg-green-500/10 text-green-600'
                                                }`}>
                                                {product.stock <= product.minStock && <AlertCircle size={12} className="mr-1" />}
                                                {product.stock}
                                            </div>
                                        </td>
                                        <td className="p-4 text-center text-muted-foreground">
                                            {product.margin?.percentage?.toFixed(1)}%
                                        </td>
                                        <td className="p-4 text-center">
                                            <div className="flex items-center justify-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => openEdit(product)}
                                                    className="p-1.5 hover:bg-primary/10 text-primary rounded-md transition-colors"
                                                    title="Editar"
                                                >
                                                    <Edit size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(product._id)}
                                                    className="p-1.5 hover:bg-destructive/10 text-destructive rounded-md transition-colors"
                                                    title="Eliminar"
                                                >
                                                    <Trash2 size={16} />
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
            />
        </div>
    );
};

export default Products;
