import React from 'react';
import { useNavigate } from 'react-router-dom';

const Login = () => {
    const navigate = useNavigate();

    const handleLogin = (e) => {
        e.preventDefault();
        // Simulate login
        navigate('/');
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-muted/20">
            <div className="bg-card p-8 rounded-xl shadow-lg w-full max-w-md border border-border">
                <h1 className="text-2xl font-bold text-center mb-6">Iniciar Sesión</h1>
                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Email</label>
                        <input type="email" className="w-full p-2 rounded-md border border-input bg-background" placeholder="admin@example.com" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Contraseña</label>
                        <input type="password" className="w-full p-2 rounded-md border border-input bg-background" placeholder="••••••••" />
                    </div>
                    <button type="submit" className="w-full bg-primary text-primary-foreground py-2 rounded-md font-medium hover:bg-primary/90 transition">
                        Entrar
                    </button>
                </form>
            </div>
        </div>
    );
};
export default Login;
