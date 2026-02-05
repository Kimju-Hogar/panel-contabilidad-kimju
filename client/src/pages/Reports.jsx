import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { Calendar, Filter, Download, ArrowUpRight, DollarSign, Package } from 'lucide-react';
import { motion } from 'framer-motion';

const Reports = () => {
    const [reportType, setReportType] = useState('transactions'); // 'transactions' | 'products'
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ totalRevenue: 0, totalProfit: 0, count: 0 });

    // Filters
    const [dateRange, setDateRange] = useState({ start: '', end: '' });
    const [paymentMethod, setPaymentMethod] = useState('');
    const [channel, setChannel] = useState('');

    useEffect(() => {
        fetchData();
    }, [dateRange, paymentMethod, channel, reportType]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const params = {};
            if (dateRange.start) params.startDate = dateRange.start;
            if (dateRange.end) params.endDate = dateRange.end;

            if (reportType === 'transactions') {
                if (paymentMethod) params.paymentMethod = paymentMethod;
                if (channel) params.channel = channel;
                const res = await api.get('/sales', { params });
                setData(res.data);
                calculateStats(res.data);
            } else {
                const res = await api.get('/sales/by-product', { params });
                setData(res.data);
                // For products view, stats calculation might be different or just sum up what we have
                calculateProductStats(res.data);
            }

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

    const calculateProductStats = (data) => {
        const totalRevenue = data.reduce((acc, curr) => acc + (curr.totalRevenue || 0), 0);
        const totalProfit = data.reduce((acc, curr) => acc + (curr.totalProfit || 0), 0);
        const totalQuantity = data.reduce((acc, curr) => acc + (curr.totalQuantity || 0), 0);
        setStats({ totalRevenue, totalProfit, count: totalQuantity });
    };

    const [selectedProduct, setSelectedProduct] = useState(null);
    const [productSales, setProductSales] = useState([]);
    const [loadingDetails, setLoadingDetails] = useState(false);

    const openProductDetailModal = async (product) => {
        setSelectedProduct(product);
        setLoadingDetails(true);
        try {
            const res = await api.get('/sales', { params: { productId: product._id } });
            setProductSales(res.data);
        } catch (error) {
            console.error("Error fetching product sales", error);
        } finally {
            setLoadingDetails(false);
        }
    };

    const closeProductDetailModal = () => {
        setSelectedProduct(null);
    };

    const [selectedTransaction, setSelectedTransaction] = useState(null);

    const handleTransactionClick = (sale) => {
        setSelectedTransaction(sale);
    };

    const closeTransactionModal = () => {
        setSelectedTransaction(null);
    };

    return (
        <div className="space-y-6 relative">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-400">
                        Reportes
                    </h1>
                    <p className="text-muted-foreground">Analiza el rendimiento de tu negocio</p>
                </div>

                {/* Report Type Toggle */}
                <div className="flex bg-muted p-1 rounded-xl">
                    <button
                        onClick={() => setReportType('transactions')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${reportType === 'transactions'
                            ? 'bg-background shadow-sm text-foreground'
                            : 'text-muted-foreground hover:text-foreground'
                            }`}
                    >
                        Transacciones
                    </button>
                    <button
                        onClick={() => setReportType('products')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${reportType === 'products'
                            ? 'bg-background shadow-sm text-foreground'
                            : 'text-muted-foreground hover:text-foreground'
                            }`}
                    >
                        Productos Vendidos
                    </button>
                </div>
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
                            <h3 className="text-2xl font-bold text-foreground">${(stats.totalRevenue || 0).toLocaleString()}</h3>
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
                            <h3 className="text-2xl font-bold text-foreground">${(stats.totalProfit || 0).toLocaleString()}</h3>
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
                            {reportType === 'transactions' ? <Filter size={24} /> : <Package size={24} />}
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">
                                {reportType === 'transactions' ? 'Transacciones' : 'Unidades Vendidas'}
                            </p>
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

                {reportType === 'transactions' && (
                    <>
                        <div className="space-y-1 min-w-[150px]">
                            <label className="text-xs font-medium text-muted-foreground">Método Pago</label>
                            <select
                                value={paymentMethod}
                                onChange={(e) => setPaymentMethod(e.target.value)}
                                className="block w-full p-2 rounded-lg bg-background border border-input text-sm"
                            >
                                <option value="">Todos</option>
                                <option value="Nequi 3146757580">Nequi 3146757580</option>
                                <option value="Bancolombia 52378931541">Bancolombia 52378931541</option>
                                <option value="Efectivo">Efectivo</option>
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
                    </>
                )}

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
                                {reportType === 'transactions' ? (
                                    <>
                                        <th className="p-4">Fecha</th>
                                        <th className="p-4">Cliente</th>
                                        <th className="p-4">Canal</th>
                                        <th className="p-4">Método</th>
                                        <th className="p-4 text-right">Total</th>
                                        <th className="p-4 text-right">Ganancia</th>
                                    </>
                                ) : (
                                    <>
                                        <th className="p-4">Producto</th>
                                        <th className="p-4">SKU</th>
                                        <th className="p-4 text-center">Cantidad Vendida</th>
                                        <th className="p-4 text-right">Ingresos Totales</th>
                                        <th className="p-4 text-right">Ganancia Total</th>
                                        <th className="p-4 text-center">Acciones</th>
                                    </>
                                )}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/50 text-sm">
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="p-8 text-center text-muted-foreground">Cargando datos...</td>
                                </tr>
                            ) : data.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="p-8 text-center text-muted-foreground">No hay datos en este periodo.</td>
                                </tr>
                            ) : (
                                reportType === 'transactions' ? (
                                    data.map((sale) => (
                                        <tr
                                            key={sale._id}
                                            onClick={() => handleTransactionClick(sale)}
                                            className="hover:bg-muted/20 transition-colors cursor-pointer"
                                        >
                                            <td className="p-4 whitespace-nowrap">
                                                {new Date(sale.date).toLocaleDateString()}
                                                <span className="text-xs text-muted-foreground block">
                                                    {new Date(sale.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </td>
                                            <td className="p-4 font-medium">{sale.customer?.name || 'Cliente Casual'}</td>
                                            <td className="p-4">
                                                <span className={`px-2.5 py-1 rounded-full text-xs font-bold
                                                    ${sale.channel === 'WhatsApp' ? 'bg-green-200 text-green-950 dark:bg-green-900/40 dark:text-green-200' :
                                                        sale.channel === 'Instagram' ? 'bg-pink-200 text-pink-950 dark:bg-pink-900/40 dark:text-pink-200' :
                                                            'bg-blue-200 text-blue-950 dark:bg-blue-900/40 dark:text-blue-200'}`}>
                                                    {sale.channel}
                                                </span>
                                            </td>
                                            <td className="p-4">{sale.paymentMethod}</td>
                                            <td className="p-4 text-right font-bold">${(sale.totalAmount || 0).toLocaleString()}</td>
                                            <td className="p-4 text-right text-green-600 font-bold">+${(sale.totalProfit || 0).toLocaleString()}</td>
                                        </tr>
                                    ))
                                ) : (
                                    data.map((product) => (
                                        <tr key={product._id} className="hover:bg-muted/20 transition-colors">
                                            <td className="p-4 font-medium">{product.productName}</td>
                                            <td className="p-4 text-muted-foreground">{product.sku}</td>
                                            <td className="p-4 text-center font-bold text-lg text-primary">{product.totalQuantity || 0}</td>
                                            <td className="p-4 text-right font-medium">${(product.totalRevenue || 0).toLocaleString()}</td>
                                            <td className="p-4 text-right text-green-500 font-medium">+${(product.totalProfit || 0).toLocaleString()}</td>
                                            <td className="p-4 text-center">
                                                <button
                                                    className="text-xs bg-primary/10 text-primary hover:bg-primary/20 px-3 py-1 rounded-full transition-colors"
                                                    onClick={() => openProductDetailModal(product)}
                                                >
                                                    Ver Detalle
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Product Detail Modal */}
            {selectedProduct && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="bg-card rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl border border-border"
                    >
                        <div className="p-6 border-b border-border flex justify-between items-start">
                            <div className='space-y-1'>
                                <h2 className="text-xl font-bold text-foreground">Detalle de Ventas: {selectedProduct.productName}</h2>
                                <p className='text-sm text-muted-foreground'>SKU: {selectedProduct.sku}</p>
                            </div>
                            <button onClick={closeProductDetailModal} className="p-2 hover:bg-muted rounded-full">
                                ✕
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                                <div className="p-4 bg-primary/5 rounded-xl border border-primary/10">
                                    <p className="text-sm text-muted-foreground">Total Vendido</p>
                                    <p className="text-2xl font-bold text-foreground">{selectedProduct.totalQuantity}</p>
                                </div>
                                <div className="p-4 bg-green-500/5 rounded-xl border border-green-500/10">
                                    <p className="text-sm text-muted-foreground">Ingresos Generados</p>
                                    <p className="text-2xl font-bold text-green-600">${(selectedProduct.totalRevenue || 0).toLocaleString()}</p>
                                </div>
                                <div className="p-4 bg-blue-500/5 rounded-xl border border-blue-500/10">
                                    <p className="text-sm text-muted-foreground">Ganancia Generada</p>
                                    <p className="text-2xl font-bold text-blue-600">${(selectedProduct.totalProfit || 0).toLocaleString()}</p>
                                </div>
                            </div>

                            <h3 className="text-lg font-semibold mb-4">Historial de Transacciones</h3>

                            <div className="rounded-xl border border-border overflow-hidden">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-muted/50">
                                        <tr>
                                            <th className="p-3 font-bold text-foreground">Fecha</th>
                                            <th className="p-3 font-bold text-foreground">Cliente</th>
                                            <th className="p-3 font-bold text-foreground">Canal</th>
                                            <th className="p-3 font-bold text-center text-foreground">Cantidad</th>
                                            <th className="p-3 font-bold text-right text-foreground">Precio Unit.</th>
                                            <th className="p-3 font-bold text-right text-foreground">Total</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border">
                                        {loadingDetails ? (
                                            <tr><td colSpan="6" className="p-8 text-center">Cargando historial...</td></tr>
                                        ) : productSales.length === 0 ? (
                                            <tr><td colSpan="6" className="p-8 text-center text-muted-foreground">No hay transacciones registradas.</td></tr>
                                        ) : (
                                            productSales.map(sale => {
                                                const item = sale.products.find(p => p.product?._id === selectedProduct._id || p.product === selectedProduct._id);
                                                return (
                                                    <tr key={sale._id} className="hover:bg-muted/10">
                                                        <td className="p-3 text-foreground">
                                                            {new Date(sale.date).toLocaleDateString()}
                                                            <span className="text-xs text-muted-foreground block">
                                                                {new Date(sale.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                            </span>
                                                        </td>
                                                        <td className="p-3 text-foreground">{sale.customer?.name || 'Cliente Casual'}</td>
                                                        <td className="p-3">
                                                            <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${sale.channel === 'WhatsApp' ? 'bg-green-200 text-green-950 dark:bg-green-900/40 dark:text-green-200' :
                                                                sale.channel === 'Instagram' ? 'bg-pink-200 text-pink-950 dark:bg-pink-900/40 dark:text-pink-200' :
                                                                    'bg-blue-200 text-blue-950 dark:bg-blue-900/40 dark:text-blue-200'
                                                                }`}>
                                                                {sale.channel}
                                                            </span>
                                                        </td>
                                                        <td className="p-3 text-center font-medium text-foreground">{item?.quantity || 1}</td>
                                                        <td className="p-3 text-right text-muted-foreground">${(item?.unitPrice || 0).toLocaleString()}</td>
                                                        <td className="p-3 text-right font-bold text-foreground">${(item?.subtotal || 0).toLocaleString()}</td>
                                                    </tr>
                                                );
                                            })
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div className="p-4 border-t border-border bg-muted/20 flex justify-end">
                            <button
                                onClick={closeProductDetailModal}
                                className="px-4 py-2 bg-background border border-border rounded-lg hover:bg-muted transition-colors"
                            >
                                Cerrar
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}

            {/* Transaction Detail Modal */}
            {selectedTransaction && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="bg-card rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl border border-border"
                    >
                        <div className="p-6 border-b border-border flex justify-between items-start">
                            <div>
                                <h2 className="text-xl font-bold text-foreground">Detalle de Transacción</h2>
                                <p className="text-sm text-muted-foreground">ID: {selectedTransaction._id}</p>
                            </div>
                            <button onClick={closeTransactionModal} className="p-2 hover:bg-muted rounded-full">
                                ✕
                            </button>
                        </div>

                        <div className="p-6 flex-1 overflow-y-auto space-y-6">
                            {/* Header Info */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <p className="text-xs text-muted-foreground uppercase font-bold">Fecha</p>
                                    <p className="text-foreground font-bold">
                                        {new Date(selectedTransaction.date).toLocaleDateString()}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        {new Date(selectedTransaction.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-xs text-muted-foreground uppercase font-bold">Cliente</p>
                                    <p className="text-foreground font-bold">{selectedTransaction.customer?.name || 'Cliente Casual'}</p>
                                    {selectedTransaction.customer?.contactNumber && (
                                        <p className="text-sm text-muted-foreground">{selectedTransaction.customer.contactNumber}</p>
                                    )}
                                </div>
                                <div className="space-y-1">
                                    <p className="text-xs text-muted-foreground uppercase font-bold">Método Pago</p>
                                    <p className="text-foreground font-medium">{selectedTransaction.paymentMethod}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-xs text-muted-foreground uppercase font-bold">Canal</p>
                                    <span className={`px-3 py-1 rounded-full text-xs inline-block mt-1 font-bold
                                        ${selectedTransaction.channel === 'WhatsApp' ? 'bg-green-200 text-green-950 dark:bg-green-900/40 dark:text-green-200' :
                                            selectedTransaction.channel === 'Instagram' ? 'bg-pink-200 text-pink-950 dark:bg-pink-900/40 dark:text-pink-200' :
                                                'bg-blue-200 text-blue-950 dark:bg-blue-900/40 dark:text-blue-200'}`}>
                                        {selectedTransaction.channel}
                                    </span>
                                </div>
                            </div>

                            <div className="border-t border-border pt-4">
                                <h3 className="text-sm font-bold mb-3 text-foreground uppercase">Productos Comprados</h3>
                                <div className="rounded-xl border border-border overflow-hidden">
                                    <table className="w-full text-left text-sm">
                                        <thead className="bg-muted/50">
                                            <tr>
                                                <th className="p-3 font-bold text-foreground">Producto</th>
                                                <th className="p-3 font-bold text-center text-foreground">Cant.</th>
                                                <th className="p-3 font-bold text-right text-foreground">Precio</th>
                                                <th className="p-3 font-bold text-right text-foreground">Subtotal</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-border">
                                            {selectedTransaction.products.map((item, idx) => (
                                                <tr key={idx} className="hover:bg-muted/10">
                                                    <td className="p-3">
                                                        <p className="font-semibold text-foreground">{item.product?.name || 'Producto Eliminado'}</p>
                                                    </td>
                                                    <td className="p-3 text-center text-foreground font-medium">{item.quantity}</td>
                                                    <td className="p-3 text-right text-muted-foreground">${(item.unitPrice || 0).toLocaleString()}</td>
                                                    <td className="p-3 text-right font-bold text-foreground">${(item.subtotal || 0).toLocaleString()}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                        <tfoot className="bg-muted/20">
                                            <tr>
                                                <td colSpan="3" className="p-3 text-right font-bold text-foreground">Total Pagado</td>
                                                <td className="p-3 text-right font-bold text-lg text-foreground">${(selectedTransaction.totalAmount || 0).toLocaleString()}</td>
                                            </tr>
                                            <tr>
                                                <td colSpan="3" className="p-3 text-right text-green-600 font-bold text-xs">Ganancia Generada</td>
                                                <td className="p-3 text-right text-green-600 font-bold text-xs">+ ${(selectedTransaction.totalProfit || 0).toLocaleString()}</td>
                                            </tr>
                                        </tfoot>
                                    </table>
                                </div>
                            </div>
                        </div>

                        <div className="p-4 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-muted/20 flex justify-end">
                            <button
                                onClick={closeTransactionModal}
                                className="px-4 py-2 bg-primary text-primary-foreground font-medium rounded-lg hover:bg-primary/90 transition-colors shadow-sm"
                            >
                                Cerrar
                            </button>
                        </div>
                    </motion.div>
                </div >
            )}
        </div >
    );
};

export default Reports;
