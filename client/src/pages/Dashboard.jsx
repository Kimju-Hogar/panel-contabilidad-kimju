import React, { useEffect, useState } from 'react';
import { DollarSign, Package, TrendingUp, AlertCircle, ShoppingCart, AlertTriangle } from 'lucide-react';
import api from '../api/axios';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, Legend } from 'recharts';

import { useNavigate } from 'react-router-dom';
import StatCard from '../components/dashboard/StatCard';

const Dashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const { data } = await api.get('/dashboard');
                setStats(data);
            } catch (error) {
                console.error("Error fetching stats", error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading) {
        return <div className="p-8 text-center text-muted-foreground animate-pulse">Cargando dashboard...</div>;
    }

    if (!stats) return null;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-400">
                    Dashboard
                </h1>
                <p className="text-muted-foreground text-sm">
                    {new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div onClick={() => navigate('/reports')} className="cursor-pointer transition-transform hover:scale-[1.02]">
                    <StatCard
                        title="Ventas Totales"
                        value={`$ ${stats.totalSales.toLocaleString()}`}
                        icon={DollarSign}
                        color="bg-primary"
                    />
                </div>
                <div onClick={() => navigate('/reports')} className="cursor-pointer transition-transform hover:scale-[1.02]">
                    <StatCard
                        title="Utilidad Neta"
                        value={`$ ${stats.totalProfit.toLocaleString()}`}
                        icon={TrendingUp}
                        color="bg-green-500"
                    />
                </div>
                <div onClick={() => navigate('/products')} className="cursor-pointer transition-transform hover:scale-[1.02]">
                    <StatCard
                        title="Valor Stock"
                        value={`$ ${stats.stockValue.toLocaleString()}`}
                        icon={Package}
                        color="bg-blue-500"
                    />
                </div>
                <div onClick={() => navigate('/products')} className="cursor-pointer transition-transform hover:scale-[1.02]">
                    <StatCard
                        title="Alerta Stock"
                        value={stats.lowStockCount}
                        icon={AlertTriangle}
                        color="bg-destructive"
                        trend={stats.lowStockCount > 0 ? "Revisar Inventario" : "Todo en orden"}
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Sales Chart */}
                <div className="lg:col-span-2 bg-card p-6 rounded-2xl border border-border shadow-sm">
                    <h3 className="text-lg font-semibold mb-6">Tendencia de Ventas (Últimos 7 días)</h3>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={stats.salesTrend}>
                                <defs>
                                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                                <XAxis
                                    dataKey="name"
                                    stroke="hsl(var(--muted-foreground))"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <YAxis
                                    stroke="hsl(var(--muted-foreground))"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                    tickFormatter={(value) => `$${value / 1000}k`}
                                />
                                <Tooltip
                                    contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                                    itemStyle={{ color: 'hsl(var(--foreground))' }}
                                    formatter={(value) => [`$${value.toLocaleString()}`, 'Ventas']}
                                    labelFormatter={(label) => label}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="sales"
                                    stroke="hsl(var(--primary))"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorSales)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-card p-6 rounded-2xl border border-border shadow-sm flex flex-col h-[400px]">
                    <h3 className="text-lg font-semibold mb-6">Actividad Reciente</h3>
                    <div className="flex-1 overflow-y-auto space-y-6 pr-2 custom-scrollbar">
                        {stats.recentActivity.map((sale) => (
                            <div key={sale._id} className="flex items-center justify-between group cursor-pointer hover:bg-muted/30 p-2 rounded-lg transition-colors" onClick={() => navigate('/reports')}>
                                <div className="flex items-center gap-4">
                                    <div className="p-2 bg-secondary rounded-full text-secondary-foreground group-hover:scale-110 transition-transform">
                                        <ShoppingCart size={18} />
                                    </div>
                                    <div>
                                        <p className="font-medium text-sm">{sale.customer?.name || 'Cliente Casual'}</p>
                                        <p className="text-xs text-muted-foreground">{new Date(sale.date).toLocaleDateString()}</p>
                                    </div>
                                </div>
                                <span className="font-bold text-green-500 text-sm">
                                    + $ {sale.totalAmount.toLocaleString()}
                                </span>
                            </div>
                        ))}
                        {stats.recentActivity.length === 0 && (
                            <p className="text-muted-foreground text-center text-sm py-8">No hay actividad reciente</p>
                        )}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-8">
                {/* Payment Methods Chart */}
                <div className="bg-card p-6 rounded-2xl border border-border shadow-sm flex flex-col">
                    <h3 className="text-lg font-semibold mb-6">Métodos de Pago</h3>
                    <div className="h-[300px] w-full flex justify-center items-center">
                        {stats.salesByPaymentMethod && stats.salesByPaymentMethod.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={stats.salesByPaymentMethod}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={80} // Increased inner radius
                                        outerRadius={100} // Increased outer radius
                                        paddingAngle={5}
                                        dataKey="value"
                                        nameKey="_id"
                                        stroke="hsl(var(--card))" // Add stroke to match background
                                        strokeWidth={2}
                                    >
                                        {stats.salesByPaymentMethod.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'][index % 5]} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px', color: 'hsl(var(--foreground))' }}
                                        itemStyle={{ color: 'hsl(var(--foreground))' }}
                                        formatter={(value) => `$${value.toLocaleString()}`}
                                    />
                                    <Legend iconType="circle" />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-2">
                                <AlertTriangle size={32} strokeWidth={1.5} />
                                <span className="text-sm">No hay datos de métodos de pago</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Categories Chart */}
                <div className="bg-card p-6 rounded-2xl border border-border shadow-sm flex flex-col">
                    <h3 className="text-lg font-semibold mb-6">Ventas por Categoría</h3>
                    <div className="h-[300px] w-full">
                        {stats.salesByCategory && stats.salesByCategory.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={stats.salesByCategory} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                                    <XAxis
                                        dataKey="_id"
                                        stroke="hsl(var(--muted-foreground))"
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                        interval={0} // Show all labels if possible, or rotate
                                        tick={{ dy: 10 }}
                                    />
                                    <YAxis
                                        stroke="hsl(var(--muted-foreground))"
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                        tickFormatter={(value) => `$${value / 1000}k`}
                                    />
                                    <Tooltip
                                        cursor={{ fill: 'hsl(var(--muted)/0.2)' }}
                                        contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px', color: 'hsl(var(--foreground))' }}
                                        itemStyle={{ color: 'hsl(var(--foreground))' }}
                                        formatter={(value) => [`$${value.toLocaleString()}`, 'Ventas']}
                                        labelStyle={{ color: 'hsl(var(--foreground))', marginBottom: '0.5rem', fontWeight: 'bold' }}
                                    />
                                    <Bar dataKey="value" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]}>
                                        {stats.salesByCategory.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#0088fe'][index % 5]} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-2">
                                <Package size={32} strokeWidth={1.5} />
                                <span className="text-sm">No hay datos de categorías</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
