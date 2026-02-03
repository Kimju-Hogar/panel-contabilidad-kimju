import React, { useState, useEffect } from 'react';
import { Search, ShoppingCart, Trash2, CreditCard, User, Tag, Plus, Minus, Save } from 'lucide-react';
import api from '../api/axios';

const Sales = () => {
    const [products, setProducts] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [cart, setCart] = useState([]);
    const [customer, setCustomer] = useState({ name: '', contact: '' });
    const [paymentMethod, setPaymentMethod] = useState('');
    const [channel, setChannel] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const { data } = await api.get('/products');
                // Only active products with stock
                setProducts(data.filter(p => p.status === 'active' && p.stock > 0));
            } catch (error) {
                console.error("Error fetching products", error);
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, []);

    const addToCart = (product) => {
        setCart(prev => {
            const existing = prev.find(item => item.product._id === product._id);
            if (existing) {
                return prev.map(item =>
                    item.product._id === product._id
                        ? { ...item, quantity: item.quantity + 1, subtotal: (item.quantity + 1) * item.unitPrice }
                        : item
                );
            } else {
                return [...prev, {
                    product,
                    quantity: 1,
                    unitPrice: product.publicPrice,
                    subtotal: product.publicPrice
                }];
            }
        });
    };

    const updateQuantity = (productId, delta) => {
        setCart(prev => prev.map(item => {
            if (item.product._id === productId) {
                const newQty = Math.max(1, item.quantity + delta);
                // Check stock limit
                if (newQty > item.product.stock) return item;
                return { ...item, quantity: newQty, subtotal: newQty * item.unitPrice };
            }
            return item;
        }));
    };

    const updatePrice = (productId, newPrice) => {
        setCart(prev => prev.map(item => {
            if (item.product._id === productId) {
                const price = parseFloat(newPrice) || 0;
                return { ...item, unitPrice: price, subtotal: item.quantity * price };
            }
            return item;
        }));
    };

    const removeFromCart = (productId) => {
        setCart(prev => prev.filter(item => item.product._id !== productId));
    };

    const calculateTotal = () => {
        return cart.reduce((acc, item) => acc + item.subtotal, 0);
    };

    const handleSale = async () => {
        if (cart.length === 0) return alert('El carrito está vacío');
        if (!paymentMethod) return alert('Selecciona un medio de pago');
        if (!channel) return alert('Selecciona un canal de venta');

        try {
            const saleData = {
                products: cart.map(item => ({
                    product: item.product._id,
                    quantity: item.quantity,
                    unitPrice: item.unitPrice
                })),
                paymentMethod,
                channel,
                customer
            };

            await api.post('/sales', saleData);
            alert('Venta registrada con éxito');
            // Reset
            setCart([]);
            setCustomer({ name: '', contact: '' });
            setPaymentMethod('');
            setChannel('');
            // Refresh products to update stock logic ideally, strictly re-fetching here
            const { data } = await api.get('/products');
            setProducts(data.filter(p => p.status === 'active' && p.stock > 0));
        } catch (error) {
            alert('Error al registrar venta: ' + (error.response?.data?.message || error.message));
        }
    };

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="flex flex-col lg:flex-row h-[calc(100vh-8rem)] gap-6">
            {/* Left: Product Selection */}
            <div className="flex-1 flex flex-col bg-card rounded-xl border border-border shadow-sm overflow-hidden">
                <div className="p-4 border-b border-border bg-muted/30">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
                        <input
                            type="text"
                            placeholder="Buscar producto..."
                            className="w-full pl-10 pr-4 py-3 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary/20 outline-none"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            autoFocus
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 content-start">
                    {loading ? (
                        <p className="col-span-full text-center text-muted-foreground">Cargando productos...</p>
                    ) : (
                        filteredProducts.map(product => (
                            <button
                                key={product._id}
                                onClick={() => addToCart(product)}
                                className="flex flex-col items-start p-4 rounded-xl border border-border hover:border-primary/50 hover:bg-accent/50 transition-all text-left group"
                            >
                                <div className="w-full aspect-square bg-muted rounded-lg mb-3 flex items-center justify-center text-muted-foreground">
                                    <Tag size={32} />
                                </div>
                                <h3 className="font-semibold text-sm line-clamp-2 mb-1">{product.name}</h3>
                                <div className="flex justify-between w-full items-end mt-auto">
                                    <span className="text-primary font-bold">${product.publicPrice.toLocaleString()}</span>
                                    <span className="text-xs text-muted-foreground">Stock: {product.stock}</span>
                                </div>
                            </button>
                        ))
                    )}
                </div>
            </div>

            {/* Right: Cart & Checkout */}
            <div className="w-full lg:w-[400px] flex flex-col bg-card rounded-xl border border-border shadow-sm h-full">
                <div className="p-4 border-b border-border bg-muted/30 flex justify-between items-center">
                    <h2 className="font-bold flex items-center gap-2">
                        <ShoppingCart size={20} />
                        Carrito Actual
                    </h2>
                    <span className="text-sm font-medium bg-primary/10 text-primary px-2 py-1 rounded-full">{cart.length} items</span>
                </div>

                {/* Cart Items */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {cart.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-muted-foreground opacity-50">
                            <ShoppingCart size={48} className="mb-2" />
                            <p>Carrito vacío</p>
                        </div>
                    ) : (
                        cart.map(item => (
                            <div key={item.product._id} className="flex gap-3 p-3 rounded-lg border border-border bg-background/50">
                                <div className="flex-1 min-w-0">
                                    <p className="font-medium text-sm truncate">{item.product.name}</p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <input
                                            type="number"
                                            className="w-20 p-1 text-xs border border-border rounded bg-transparent"
                                            value={item.unitPrice}
                                            onChange={(e) => updatePrice(item.product._id, e.target.value)}
                                        />
                                        <span className="text-xs text-muted-foreground">x {item.quantity}</span>
                                    </div>
                                </div>
                                <div className="flex flex-col items-end gap-2">
                                    <p className="font-bold text-sm">${item.subtotal.toLocaleString()}</p>
                                    <div className="flex items-center gap-1">
                                        <button
                                            onClick={() => updateQuantity(item.product._id, -1)}
                                            className="p-1 hover:bg-muted rounded"
                                        >
                                            <Minus size={14} />
                                        </button>
                                        <button
                                            onClick={() => removeFromCart(item.product._id)}
                                            className="p-1 text-destructive hover:bg-destructive/10 rounded"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                        <button
                                            onClick={() => updateQuantity(item.product._id, 1)}
                                            className="p-1 hover:bg-muted rounded"
                                        >
                                            <Plus size={14} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Checkout Form */}
                <div className="p-4 bg-muted/10 border-t border-border space-y-4">
                    <div className="space-y-2">
                        <div className="grid grid-cols-2 gap-2">
                            <select
                                className="w-full p-2 text-sm rounded-lg border border-input bg-background"
                                value={paymentMethod}
                                onChange={(e) => setPaymentMethod(e.target.value)}
                            >
                                <option value="">Método Pago</option>
                                <option value="Mercado Pago">Mercado Pago</option>
                                <option value="Nequi">Nequi</option>
                                <option value="Daviplata">Daviplata</option>
                                <option value="Efectivo">Efectivo</option>
                                <option value="Transferencia">Transferencia</option>
                            </select>
                            <select
                                className="w-full p-2 text-sm rounded-lg border border-input bg-background"
                                value={channel}
                                onChange={(e) => setChannel(e.target.value)}
                            >
                                <option value="">Canal Venta</option>
                                <option value="Instagram">Instagram</option>
                                <option value="WhatsApp">WhatsApp</option>
                                <option value="Website">Página Web</option>
                                <option value="Other">Otro</option>
                            </select>
                        </div>
                        <input
                            type="text"
                            placeholder="Cliente (Opcional)"
                            className="w-full p-2 text-sm rounded-lg border border-input bg-background"
                            value={customer.name}
                            onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
                        />
                    </div>

                    <div className="pt-2 border-t border-border flex items-center justify-between">
                        <div>
                            <p className="text-xs text-muted-foreground uppercase">Total a Pagar</p>
                            <p className="text-2xl font-bold text-primary">${calculateTotal().toLocaleString()}</p>
                        </div>
                        <button
                            onClick={handleSale}
                            disabled={cart.length === 0}
                            className="bg-primary text-primary-foreground px-6 py-3 rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            <CreditCard size={20} />
                            Cobrar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Sales;
