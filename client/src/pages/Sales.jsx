import React, { useState, useEffect } from 'react';
import { Search, ShoppingCart, Trash2, CreditCard, User, Tag, Plus, Minus, Save, Image as ImageIcon } from 'lucide-react';
import api from '../api/axios';
import { IMAGE_BASE_URL } from '../config/constants';
import { getImageUrl } from '../utils/imageUtils';

const Sales = () => {
    const [products, setProducts] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [cart, setCart] = useState([]);
    const [customer, setCustomer] = useState({ name: '', contact: '' });
    const [paymentMethod, setPaymentMethod] = useState('');
    const [isPaymentDropdownOpen, setIsPaymentDropdownOpen] = useState(false);
    const [channel, setChannel] = useState('');
    const [loading, setLoading] = useState(true);

    const paymentOptions = [
        { id: 'Nequi', label: 'Nequi', value: 'Nequi 3146757580', icon: '📱', detail: '3146757580', color: 'text-pink-600' },
        { id: 'Bancolombia', label: 'Bancolombia', value: 'Bancolombia 52378931541', icon: '💳', detail: '52378931541 Ahorro', color: 'text-yellow-600' },
        { id: 'Efectivo', label: 'Efectivo', value: 'Efectivo', icon: '💵', detail: 'Caja General', color: 'text-green-600' }
    ];

    const selectedPaymentOption = paymentOptions.find(opt => opt.value === paymentMethod);

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
                // Check stock
                if (existing.quantity >= product.stock) return prev;

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
        <div className="flex flex-col lg:flex-row h-[calc(100vh-8rem)] gap-6 animate-fade-in">
            {/* Left: Product Selection */}
            <div className="flex-1 flex flex-col bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
                <div className="p-4 border-b border-border bg-muted/30">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={22} />
                        <input
                            type="text"
                            placeholder="Buscar producto por nombre o código..."
                            className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-input bg-background focus:ring-2 focus:ring-primary/20 outline-none text-base shadow-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            autoFocus
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-5 bg-muted/10">
                    {loading ? (
                        <div className="h-full flex flex-col items-center justify-center text-muted-foreground gap-2">
                            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                            <p>Cargando catálogo...</p>
                        </div>
                    ) : filteredProducts.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-muted-foreground opacity-60">
                            <Search size={48} className="mb-2" />
                            <p>No hay productos que coincidan.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 pb-20">
                            {filteredProducts.map(product => (
                                <button
                                    key={product._id}
                                    onClick={() => addToCart(product)}
                                    className="flex flex-col h-full bg-background rounded-xl border border-border hover:border-primary/50 hover:shadow-lg transition-all text-left overflow-hidden group active:scale-[0.98]"
                                >
                                    <div className="w-full aspect-square bg-muted relative overflow-hidden">
                                        {product.image ? (
                                            <img
                                                src={getImageUrl(product.image)}
                                                alt={product.name}
                                                className="w-full h-full object-cover transition-transform group-hover:scale-105"
                                                loading="lazy"
                                                onError={(e) => e.target.style.display = 'none'}
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-muted-foreground/30">
                                                <ImageIcon size={40} />
                                            </div>
                                        )}

                                        <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md text-white text-xs px-2 py-1 rounded-full font-bold">
                                            {product.stock} un.
                                        </div>
                                    </div>

                                    <div className="p-3 flex flex-col flex-1">
                                        <h3 className="font-bold text-sm leading-tight line-clamp-2 mb-2 text-foreground">{product.name}</h3>
                                        <div className="mt-auto pt-2 border-t border-border/50 w-full flex justify-between items-center">
                                            <span className="text-muted-foreground text-xs">{product.sku}</span>
                                            <span className="text-primary font-bold text-lg">${product.publicPrice.toLocaleString()}</span>
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Right: Cart & Checkout */}
            <div className="w-full lg:w-[420px] flex flex-col bg-card rounded-2xl border border-border shadow-xl h-full z-10">
                <div className="p-5 border-b border-border bg-primary/5 flex justify-between items-center">
                    <h2 className="font-bold text-lg flex items-center gap-2 text-foreground">
                        <ShoppingCart size={22} className="text-primary" />
                        Carrito de Venta
                    </h2>
                    <span className="text-sm font-bold bg-primary text-primary-foreground px-3 py-1 rounded-full shadow-sm">{cart.length}</span>
                </div>

                {/* Cart Items */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-muted/5">
                    {cart.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-muted-foreground opacity-50">
                            <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-4">
                                <ShoppingCart size={40} />
                            </div>
                            <p className="font-medium">El carrito está vacío</p>
                            <p className="text-sm">Agrega productos para comenzar</p>
                        </div>
                    ) : (
                        cart.map((item, index) => (
                            <div key={item.product._id} className="flex gap-3 p-3 rounded-xl border border-border bg-background shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-300" style={{ animationDelay: `${index * 50}ms` }}>
                                <div className="w-16 h-16 rounded-lg bg-muted border border-border overflow-hidden shrink-0">
                                    {item.product.image ? (
                                        <img
                                            src={`${IMAGE_BASE_URL}${item.product.image}`}
                                            alt={item.product.name}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                                            <Tag size={16} />
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0 flex flex-col justify-between">
                                    <div className="flex justify-between items-start gap-2">
                                        <p className="font-semibold text-sm leading-tight truncate-2-lines text-foreground">{item.product.name}</p>
                                        <button
                                            onClick={() => removeFromCart(item.product._id)}
                                            className="text-muted-foreground hover:text-destructive transition-colors p-1 -mr-1"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>

                                    <div className="flex items-end justify-between mt-2">
                                        <div className="flex items-center gap-1 bg-muted rounded-lg p-0.5 border border-border">
                                            <button
                                                onClick={() => updateQuantity(item.product._id, -1)}
                                                className="w-7 h-7 flex items-center justify-center hover:bg-background rounded-md transition-colors text-foreground"
                                            >
                                                <Minus size={12} />
                                            </button>
                                            <span className="w-8 text-center text-sm font-bold">{item.quantity}</span>
                                            <button
                                                onClick={() => updateQuantity(item.product._id, 1)}
                                                className="w-7 h-7 flex items-center justify-center hover:bg-background rounded-md transition-colors text-foreground"
                                            >
                                                <Plus size={12} />
                                            </button>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-base text-primary">${item.subtotal.toLocaleString()}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Checkout Form */}
                <div className="p-5 bg-card border-t border-border shadow-[0_-5px_20px_-10px_rgba(0,0,0,0.1)] z-10 space-y-4">
                    <div className="space-y-3">
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                            <input
                                type="text"
                                placeholder="Cliente (Opcional)"
                                className="w-full pl-10 pr-3 py-2.5 text-sm rounded-lg border border-input bg-muted/30 focus:bg-background transition-colors outline-none"
                                value={customer.name}
                                onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
                            />
                        </div>
                        {/* Payment Methods Dropdown */}
                        <div className="relative">
                            <label className="text-xs text-muted-foreground uppercase tracking-wider mb-1.5 block font-semibold">Método de Pago</label>

                            {/* Backdrop for closing */}
                            {isPaymentDropdownOpen && (
                                <div className="fixed inset-0 z-40" onClick={() => setIsPaymentDropdownOpen(false)}></div>
                            )}

                            <div className="relative z-50">
                                <button
                                    onClick={() => setIsPaymentDropdownOpen(!isPaymentDropdownOpen)}
                                    className={`w-full p-3 rounded-xl border text-left flex items-center justify-between transition-all bg-muted/30 hover:bg-muted/50 focus:ring-2 focus:ring-primary/20 outline-none
                                        ${isPaymentDropdownOpen ? 'border-primary ring-2 ring-primary/20' : 'border-input'}
                                    `}
                                >
                                    {selectedPaymentOption ? (
                                        <div className="flex items-center gap-3">
                                            <span className={`text-2xl ${selectedPaymentOption.color}`}>{selectedPaymentOption.icon}</span>
                                            <div className="flex flex-col leading-none">
                                                <span className="font-bold text-sm text-foreground">{selectedPaymentOption.label}</span>
                                                <span className="text-[10px] text-muted-foreground font-mono">{selectedPaymentOption.detail}</span>
                                            </div>
                                        </div>
                                    ) : (
                                        <span className="text-muted-foreground text-sm">Seleccionar Medio de Pago...</span>
                                    )}
                                    <div className="text-muted-foreground">▼</div>
                                </button>

                                {isPaymentDropdownOpen && (
                                    <div className="absolute top-full left-0 right-0 mt-2 bg-popover border border-border rounded-xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-100 p-1.5 grid grid-cols-1 gap-1 max-h-[300px] overflow-y-auto">
                                        {paymentOptions.map((method) => (
                                            <button
                                                key={method.id}
                                                onClick={() => {
                                                    setPaymentMethod(method.value);
                                                    setIsPaymentDropdownOpen(false);
                                                }}
                                                className={`
                                                    w-full flex items-center gap-3 p-2.5 rounded-lg transition-colors text-left
                                                    ${paymentMethod === method.value
                                                        ? 'bg-primary/10 text-primary'
                                                        : 'hover:bg-muted text-foreground'
                                                    }
                                                `}
                                            >
                                                <span className={`text-xl ${method.color}`}>{method.icon}</span>
                                                <div className="flex flex-col leading-none">
                                                    <span className="font-bold text-sm">{method.label}</span>
                                                    <span className="text-[10px] opacity-70 font-mono mt-0.5">{method.detail}</span>
                                                </div>
                                                {paymentMethod === method.value && (
                                                    <div className="ml-auto w-2 h-2 rounded-full bg-primary"></div>
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        <select
                            className="w-full p-2.5 text-sm rounded-lg border border-input bg-muted/30 focus:bg-background transition-colors outline-none cursor-pointer hover:bg-muted/50"
                            value={channel}
                            onChange={(e) => setChannel(e.target.value)}
                        >
                            <option value="">Seleccionar Canal de Venta...</option>
                            <option value="Instagram">Instagram</option>
                            <option value="WhatsApp">WhatsApp</option>
                            <option value="Website">Página Web</option>
                            <option value="Tienda">Tienda Física</option>
                        </select>
                    </div>

                    <div className="pt-4 border-t border-border flex items-center justify-between gap-4">
                        <div>
                            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-0.5">Total a Pagar</p>
                            <p className="text-3xl font-black text-foreground">${calculateTotal().toLocaleString()}</p>
                        </div>
                        <button
                            onClick={handleSale}
                            disabled={cart.length === 0}
                            className="flex-1 bg-primary text-primary-foreground px-4 py-3.5 rounded-xl font-bold text-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-primary/20 active:scale-[0.98] transition-all"
                        >
                            <CreditCard size={24} />
                            Cobrar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Sales;
