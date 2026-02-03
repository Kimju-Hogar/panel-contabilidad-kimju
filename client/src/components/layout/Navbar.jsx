import { Bell, Menu, User } from 'lucide-react';

const Navbar = () => {
    return (
        <header className="bg-card border-b border-border shadow-sm h-16 flex items-center justify-between px-6">
            <div className="flex items-center md:hidden">
                <button className="p-2 text-muted-foreground hover:bg-accent rounded-md">
                    <Menu size={24} />
                </button>
            </div>

            <div className="flex-1 flex justify-end items-center space-x-4">
                <button className="p-2 relative text-muted-foreground hover:bg-accent rounded-full transition-colors">
                    <Bell size={20} />
                    <span className="absolute top-2 right-2 w-2 h-2 bg-destructive rounded-full"></span>
                </button>

                <div className="flex items-center space-x-3 pl-4 border-l border-border">
                    <div className="text-right hidden sm:block">
                        <p className="text-sm font-medium text-foreground">Admin User</p>
                        <p className="text-xs text-muted-foreground">Administrador</p>
                    </div>
                    <div className="h-9 w-9 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                        <User size={20} />
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Navbar;
