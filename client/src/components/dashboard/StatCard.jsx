import React from 'react';

const StatCard = ({ title, value, icon: Icon, color, className, trend }) => (
    <div className={`bg-card p-6 rounded-xl border border-border shadow-sm flex items-start justify-between ${className}`}>
        <div>
            <p className="text-muted-foreground text-sm font-medium mb-1">{title}</p>
            <h3 className="text-2xl font-bold text-foreground">{value}</h3>
            {trend && (
                <p className={`text-xs mt-1 font-medium ${trend === "Todo en orden" ? "text-green-500" : "text-destructive"}`}>
                    {trend}
                </p>
            )}
        </div>
        <div className={`p-3 rounded-lg ${color}`}>
            <Icon size={24} className="text-white" />
        </div>
    </div>
);

export default StatCard;
