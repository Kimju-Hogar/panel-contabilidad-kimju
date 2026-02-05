import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { Calendar, Filter, Download, ArrowUpRight, DollarSign } from 'lucide-react';
import { motion } from 'framer-motion';

const Reports = () => {
    const [sales, setSales] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ totalRevenue: 0, totalProfit: 0, count: 0 });

    // Filters
    const [dateRange, setDateRange] = useState({ start: '', end: '' });
    const [paymentMethod, setPaymentMethod] = useState('');
    const [channel, setChannel] = useState('');

    useEffect(() => {
        fetchSales();
    }, [dateRange, paymentMethod, channel]);

    const fetchSales = async () => {
        try {
            setLoading(true);
            // Build query
            const params = {};
            if (dateRange.start) params.startDate = dateRange.start;
            if (dateRange.end) params.endDate = dateRange.end;
            if (paymentMethod) params.paymentMethod = paymentMethod;
            if (channel) params.channel = channel;

            // Assuming GET /api/sales supports these filters (will verify controller)
            const res = await api.get('/sales', { params });
            setSales(res.data);
            calculateStats(res.data);
        } catch (error) {
            console.error("Error fetching reports", error);
        } finally {
            setLoading(false);
        }
    };

    const calculateStats = (data) => {
        const totalRevenue = data.reduce((acc, curr) => acc + (curr.totalAmount || 0), 0);
        const totalProfit = data.reduce((acc, curr) => acc + (curr.totalProfit || 0), 0);
        setStats({ totalRevenue, totalProfit, count: data.length });
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-400">
                        Reportes de Ventas
                    </h1>
                    <p className="text-muted-foreground">Analiza el rendimiento de tu negocio</p>
                </div>
                {/* <button className="flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors">
                    <Download size={18} />
                    Exportar CSV
                </button> */}
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="p-6 rounded-2xl bg-gradient-to-br from-blue-500/10 to-transparent border border-blue-500/20"
                >
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-500/20 text-blue-500 rounded-xl">
                            <DollarSign size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Ingresos Totales</p>
                            <h3 className="text-2xl font-bold text-foreground">${stats.totalRevenue.toLocaleString()}</h3>
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="p-6 rounded-2xl bg-gradient-to-br from-green-500/10 to-transparent border border-green-500/20"
                >
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-green-500/20 text-green-500 rounded-xl">
                            <ArrowUpRight size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Ganancia Neta</p>
                            <h3 className="text-2xl font-bold text-foreground">${stats.totalProfit.toLocaleString()}</h3>
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="p-6 rounded-2xl bg-card border border-border"
                >
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-purple-500/20 text-purple-500 rounded-xl">
                            <Filter size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Ventas Realizadas</p>
                            <h3 className="text-2xl font-bold text-foreground">{stats.count}</h3>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Filters */}
            <div className="p-4 bg-card rounded-xl border border-border flex flex-wrap gap-4 items-end">
                <div className="space-y-1">
                    <label className="text-xs font-medium text-muted-foreground">Desde</label>
                    <input
                        type="date"
                        value={dateRange.start}
                        onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                        className="block w-full p-2 rounded-lg bg-background border border-input text-sm"
                    />
                </div>
                <div className="space-y-1">
                    <label className="text-xs font-medium text-muted-foreground">Hasta</label>
                    <input
                        type="date"
                        value={dateRange.end}
                        onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                        className="block w-full p-2 rounded-lg bg-background border border-input text-sm"
                    />
                </div>
                <div className="space-y-1 min-w-[150px]">
                    <label className="text-xs font-medium text-muted-foreground">Método Pago</label>
                    <select
                        value={paymentMethod}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="block w-full p-2 rounded-lg bg-background border border-input text-sm"
                    >
                        <option value="">Todos</option>
                        <option value="Mercado Pago">Mercado Pago</option>
                        <option value="Transferencia">Transferencia</option>
                        <option value="Efectivo">Efectivo</option>
                        <option value="Nequi">Nequi</option>
                        <option value="Daviplata">Daviplata</option>
                    </select>
                </div>
                <div className="space-y-1 min-w-[150px]">
                    <label className="text-xs font-medium text-muted-foreground">Canal</label>
                    <select
                        value={channel}
                        onChange={(e) => setChannel(e.target.value)}
                        className="block w-full p-2 rounded-lg bg-background border border-input text-sm"
                    >
                        <option value="">Todos</option>
                        <option value="WhatsApp">WhatsApp</option>
                        <option value="Instagram">Instagram</option>
                        <option value="Website">Website</option>
                    </select>
                </div>
                <button
                    onClick={() => {
                        setDateRange({ start: '', end: '' });
                        setPaymentMethod('');
                        setChannel('');
                    }}
                    className="px-4 py-2 text-sm text-gray-500 hover:text-white transition-colors"
                >
                    Limpiar Filtros
                </button>
            </div>

            {/* Table */}
            <div className="bg-card rounded-xl border border-border overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-muted/30 text-xs uppercase text-muted-foreground font-semibold">
                            <tr>
                                <th className="p-4">Fecha</th>
                                <th className="p-4">Cliente</th>
                                <th className="p-4">Canal</th>
                                <th className="p-4">Método</th>
                                <th className="p-4 text-right">Total</th>
                                <th className="p-4 text-right">Ganancia</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/50 text-sm">
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="p-8 text-center text-muted-foreground">Cargando datos...</td>
                                </tr>
                            ) : sales.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="p-8 text-center text-muted-foreground">No hay ventas registradas en este periodo.</td>
                                </tr>
                            ) : (
                                sales.map((sale) => (
                                    <tr key={sale._id} className="hover:bg-muted/20 transition-colors">
                                        <td className="p-4 whitespace-nowrap">
                                            {new Date(sale.date).toLocaleDateString()}
                                            <span className="text-xs text-muted-foreground block">
                                                {new Date(sale.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </td>
                                        <td className="p-4 font-medium">{sale.customer?.name || 'Cliente Casual'}</td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium 
                                                ${sale.channel === 'WhatsApp' ? 'bg-green-500/10 text-green-500' :
                                                    sale.channel === 'Instagram' ? 'bg-pink-500/10 text-pink-500' :
                                                        'bg-blue-500/10 text-blue-500'}`}>
                                                {sale.channel}
                                            </span>
                                        </td>
                                        <td className="p-4">{sale.paymentMethod}</td>
                                        <td className="p-4 text-right font-bold">${sale.totalAmount.toLocaleString()}</td>
                                        <td className="p-4 text-right text-green-500 font-medium">+${(sale.totalProfit || 0).toLocaleString()}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Reports;
