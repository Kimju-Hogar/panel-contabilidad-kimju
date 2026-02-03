import React, { useEffect, useState } from 'react';
import { DollarSign, Package, TrendingUp, AlertCircle } from 'lucide-react';
import api from '../api/axios';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const StatCard = ({ title, value, icon: Icon, color, trend }) => (
    <div className="bg-card p-6 rounded-xl border border-border shadow-sm flex items-start justify-between">
        <div>
            <p className="text-muted-foreground text-sm font-medium mb-1">{title}</p>
            <h3 className="text-2xl font-bold text-foreground">{value}</h3>
            {trend && (
                <p className={`text-xs mt-2 font-medium ${trend >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {trend >= 0 ? '+' : ''}{trend}% vs mes anterior
                </p>
            )}
        </div>
        <div className={`p-3 rounded-lg ${color}`}>
            <Icon size={24} className="text-white" />
        </div>
    </div>
);

const Dashboard = () => {
    const [stats, setStats] = useState({
        totalSales: 0,
        totalProfit: 0,
        stockValue: 0,
        lowStockCount: 0
    });

    // Mock data for chart - Replace with real API data later
    const chartData = [
        { name: 'Lun', sales: 4000 },
        { name: 'Mar', sales: 3000 },
        { name: 'Mie', sales: 2000 },
        { name: 'Jue', sales: 2780 },
        { name: 'Vie', sales: 1890 },
        { name: 'Sab', sales: 2390 },
        { name: 'Dom', sales: 3490 },
    ];

    useEffect(() => {
        const fetchStats = async () => {
            try {
                // In a real app, you would fetch these from a dedicated dashboard endpoint
                // For now, we simulate or fetch simple lists
                // const salesRes = await api.get('/sales');
                // const productsRes = await api.get('/products');

                // Placeholder logic until backend endpoints return aggregated data
                setStats({
                    totalSales: 12500000,
                    totalProfit: 4200000,
                    stockValue: 8500000,
                    lowStockCount: 3
                });
            } catch (error) {
                console.error("Error fetching stats", error);
            }
        };
        fetchStats();
    }, []);

    const formatCurrency = (val) => {
        return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(val);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
                <div className="text-sm text-muted-foreground">
                    {new Date().toLocaleDateString('es-CO', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Ventas Totales"
                    value={formatCurrency(stats.totalSales)}
                    icon={DollarSign}
                    color="bg-primary"
                    trend={12.5}
                />
                <StatCard
                    title="Utilidad Neta"
                    value={formatCurrency(stats.totalProfit)}
                    icon={TrendingUp}
                    color="bg-green-500"
                    trend={8.2}
                />
                <StatCard
                    title="Valor Stock"
                    value={formatCurrency(stats.stockValue)}
                    icon={Package}
                    color="bg-blue-500"
                />
                <StatCard
                    title="Alerta Stock"
                    value={stats.lowStockCount}
                    icon={AlertCircle}
                    color="bg-red-500"
                    trend={-2} // Negative trend here is actually good (fewer alerts) but logic displayed is simple
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Sales Chart */}
                <div className="lg:col-span-2 bg-card p-6 rounded-xl border border-border shadow-sm">
                    <h3 className="text-lg font-bold mb-4">Tendencia de Ventas (Semanal)</h3>
                    <div className="h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value / 1000}k`} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                                    itemStyle={{ color: 'hsl(var(--primary))' }}
                                    formatter={(value) => [formatCurrency(value), 'Ventas']}
                                />
                                <Area type="monotone" dataKey="sales" stroke="hsl(var(--primary))" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-card p-6 rounded-xl border border-border shadow-sm">
                    <h3 className="text-lg font-bold mb-4">Actividad Reciente</h3>
                    <div className="space-y-4">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <div key={i} className="flex items-center justify-between pb-4 border-b border-border last:border-0 last:pb-0">
                                <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center text-primary font-bold">
                                        VT
                                    </div>
                                    <div>
                                        <p className="font-medium text-sm">Venta #102{i}</p>
                                        <p className="text-xs text-muted-foreground">Hace {i * 10} min</p>
                                    </div>
                                </div>
                                <span className="font-bold text-sm text-green-600">+$120.000</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
