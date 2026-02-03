import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Download } from 'lucide-react';
import api from '../api/axios';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const Reports = () => {
    const [sales, setSales] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSales = async () => {
            try {
                const { data } = await api.get('/sales');
                setSales(data);
            } catch (error) {
                console.error("Error fetching sales for reports", error);
            } finally {
                setLoading(false);
            }
        };
        fetchSales();
    }, []);

    // --- Aggregation Logic ---

    // 1. Sales by Channel
    const salesByChannel = sales.reduce((acc, sale) => {
        const channel = sale.channel || 'Desconocido';
        acc[channel] = (acc[channel] || 0) + sale.totalAmount;
        return acc;
    }, {});

    const channelData = Object.keys(salesByChannel).map(key => ({
        name: key,
        value: salesByChannel[key]
    }));

    // 2. Monthly Sales (Simple aggregation by month)
    const salesByMonth = sales.reduce((acc, sale) => {
        const date = new Date(sale.date);
        const month = date.toLocaleString('default', { month: 'short' });
        acc[month] = (acc[month] || 0) + sale.totalAmount;
        return acc;
    }, {});

    const monthlyData = Object.keys(salesByMonth).map(key => ({
        name: key,
        ventas: salesByMonth[key]
    }));

    // 3. Payment Methods
    const salesByPayment = sales.reduce((acc, sale) => {
        const method = sale.paymentMethod || 'Otros';
        acc[method] = (acc[method] || 0) + 1; // Count transactions
        return acc;
    }, {});

    const paymentData = Object.keys(salesByPayment).map(key => ({
        name: key,
        count: salesByPayment[key]
    }));

    const formatCurrency = (val) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(val);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-foreground">Reportes Financieros</h1>
                <button className="flex items-center space-x-2 px-4 py-2 border border-border rounded-lg hover:bg-accent text-primary">
                    <Download size={20} />
                    <span>Exportar PDF</span>
                </button>
            </div>

            {loading ? (
                <div className="text-center p-12 text-muted-foreground">Cargando datos...</div>
            ) : sales.length === 0 ? (
                <div className="text-center p-12 text-muted-foreground bg-card rounded-xl border border-border">
                    No hay datos de ventas suficientes para generar reportes.
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Sales by Channel - Pie Chart */}
                    <div className="bg-card p-6 rounded-xl border border-border shadow-sm">
                        <h3 className="text-lg font-bold mb-4">Ventas por Canal</h3>
                        <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={channelData}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                        outerRadius={100}
                                        fill="#8884d8"
                                        dataKey="value"
                                    >
                                        {channelData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={(value) => formatCurrency(value)} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Monthly Sales - Bar Chart */}
                    <div className="bg-card p-6 rounded-xl border border-border shadow-sm">
                        <h3 className="text-lg font-bold mb-4">Tendencia Mensual</h3>
                        <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={monthlyData}>
                                    <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                                    <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
                                    <YAxis stroke="hsl(var(--muted-foreground))" tickFormatter={(val) => `$${val / 1000}k`} />
                                    <Tooltip
                                        cursor={{ fill: 'hsl(var(--accent))' }}
                                        contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                                        formatter={(value) => formatCurrency(value)}
                                    />
                                    <Legend />
                                    <Bar dataKey="ventas" name="Ventas Totales" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Payment Methods - Bar Chart */}
                    <div className="bg-card p-6 rounded-xl border border-border shadow-sm md:col-span-2">
                        <h3 className="text-lg font-bold mb-4">Transacciones por Medio de Pago</h3>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={paymentData} layout="vertical">
                                    <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                                    <XAxis type="number" stroke="hsl(var(--muted-foreground))" />
                                    <YAxis dataKey="name" type="category" stroke="hsl(var(--muted-foreground))" width={100} />
                                    <Tooltip
                                        cursor={{ fill: 'hsl(var(--accent))' }}
                                        contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                                    />
                                    <Bar dataKey="count" name="Transacciones" fill="#82ca9d" radius={[0, 4, 4, 0]} barSize={20} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Reports;
