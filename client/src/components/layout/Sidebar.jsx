import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Package, ShoppingCart, BarChart3, LogOut } from 'lucide-react';

const Sidebar = () => {
    const location = useLocation();

    const menuItems = [
        { title: 'Dashboard', path: '/', icon: <LayoutDashboard size={20} /> },
        { title: 'Productos', path: '/products', icon: <Package size={20} /> },
        { title: 'Ventas', path: '/sales', icon: <ShoppingCart size={20} /> },
        { title: 'Reportes', path: '/reports', icon: <BarChart3 size={20} /> },
    ];

    return (
        <div className="h-screen w-64 bg-card border-r border-border flex flex-col hidden md:flex">
            <div className="p-6 border-b border-border">
                <h1 className="text-2xl font-bold text-primary">Kimju Panel</h1>
            </div>

            <nav className="flex-1 p-4 space-y-2">
                {menuItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${isActive
                                ? 'bg-primary text-primary-foreground'
                                : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                                }`}
                        >
                            {item.icon}
                            <span className="font-medium">{item.title}</span>
                        </Link>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-border">
                <button className="flex items-center space-x-3 px-4 py-3 w-full rounded-lg text-destructive hover:bg-destructive/10 transition-colors">
                    <LogOut size={20} />
                    <span className="font-medium">Cerrar Sesión</span>
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
