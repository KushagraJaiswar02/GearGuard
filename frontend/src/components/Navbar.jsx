import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { Moon, Sun } from 'lucide-react';

const Navbar = () => {
    const { theme, setTheme } = useTheme();

    return (
        <header className="h-14 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex items-center justify-between px-6 sticky top-0 z-30">
            <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-muted-foreground">Organization / Only Project</span>
            </div>

            <div className="flex items-center gap-4">
                <button
                    onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                    className="p-2 rounded-full hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
                >
                    {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                </button>
                <button className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    Feedback
                </button>
                <div className="h-8 w-8 rounded-full bg-secondary border border-border flex items-center justify-center text-xs font-medium">
                    US
                </div>
            </div>
        </header>
    );
};

export default Navbar;
