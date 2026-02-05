import { Bell, Menu, User, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthProvider';
import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { useNavigate } from 'react-router-dom';

const Navbar = ({ toggleSidebar }) => {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [showNotifications, setShowNotifications] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchLowStock = async () => {
            try {
                // Fetch dashboard stats to get low stock count/items
                // Optimized: Assuming we might have a specific endpoint or grabbing from products filtering
                // For now, let's hit the dashboard endpoint which has the count, 
                // but we ideally want the list. 
                // Let's create a quick check by fetching products with low stock.
                const { data } = await api.get('/products?lowStock=true');
                // Assuming Filter logic exists or we might need to filter client side if not.
                // Actually the Dashboard controller returns `lowStockCount`, let's just use that for the badge
                // And if clicked, we show them.
                // Let's try to get specific items:
                const res = await api.get('/products'); // We might want a lightweight endpoint later
                const lowStockItems = res.data.filter(p => p.stock <= p.minStock);
                setNotifications(lowStockItems);
            } catch (error) {
                console.error("Error checking notifications", error);
            }
        };
        fetchLowStock();
        // Poll every minute
        const interval = setInterval(fetchLowStock, 60000);
        return () => clearInterval(interval);
    }, []);

    return (
        <header className="bg-card border-b border-border shadow-sm h-16 flex items-center justify-between px-6 z-40 relative">
            <div className="flex items-center md:hidden">
                <button
                    onClick={toggleSidebar}
                    className="p-2 text-muted-foreground hover:bg-accent rounded-md"
                >
                    <Menu size={24} />
                </button>
            </div>

            <div className="flex-1 flex justify-end items-center space-x-4">
                <div className="relative">
                    <button
                        onClick={() => setShowNotifications(!showNotifications)}
                        className="p-2 relative text-muted-foreground hover:bg-accent rounded-full transition-colors"
                    >
                        <Bell size={20} />
                        {notifications.length > 0 && (
                            <span className="absolute top-2 right-2 w-2 h-2 bg-destructive rounded-full animate-pulse"></span>
                        )}
                    </button>

                    {/* Notification Dropdown */}
                    {showNotifications && (
                        <div className="absolute right-0 mt-2 w-80 bg-card border border-border rounded-xl shadow-lg py-2 animate-in fade-in slide-in-from-top-2">
                            <div className="px-4 py-2 border-b border-border">
                                <h3 className="font-semibold text-sm">Notificaciones</h3>
                            </div>
                            <div className="max-h-64 overflow-y-auto">
                                {notifications.length === 0 ? (
                                    <p className="p-4 text-sm text-muted-foreground text-center">No hay notificaciones</p>
                                ) : (
                                    notifications.map(product => (
                                        <div
                                            key={product._id}
                                            className="px-4 py-3 hover:bg-muted/50 cursor-pointer flex items-start gap-3 transition-colors"
                                            onClick={() => {
                                                navigate('/products');
                                                setShowNotifications(false);
                                            }}
                                        >
                                            <div className="mt-0.5 text-destructive">
                                                <AlertCircle size={16} />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-foreground">{product.name}</p>
                                                <p className="text-xs text-destructive">Stock bajo: {product.stock} unidades (Min: {product.minStock})</p>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex items-center space-x-3 pl-4 border-l border-border">
                    <div className="text-right hidden sm:block">
                        <p className="text-sm font-medium text-foreground">{user?.name || 'Usuario'}</p>
                        <p className="text-xs text-muted-foreground capitalize">{user?.role || 'Vendedor'}</p>
                    </div>
                    <div className="h-9 w-9 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                        <User size={20} />
                    </div>
                </div>
            </div>

            {/* Overlay to close notifications when clicking outside */}
            {showNotifications && (
                <div
                    className="fixed inset-0 z-[-1]"
                    onClick={() => setShowNotifications(false)}
                />
            )}
        </header>
    );
};

export default Navbar;
