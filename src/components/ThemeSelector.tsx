
import React from 'react';
import { Button } from '@/components/ui/button';
import { Laptop, Moon, Sun } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import { cn } from '@/lib/utils';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

export const ThemeSelector = ({ className }: { className?: string }) => {
  const { theme, setTheme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className={cn("w-9 h-9 rounded-full", className)}>
          {theme === 'dark' && <Moon className="h-5 w-5 text-primary" />}
          {theme === 'light' && <Sun className="h-5 w-5 text-primary" />}
          {theme === 'system' && <Laptop className="h-5 w-5 text-primary" />}
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="glass-dark backdrop-blur-xl border border-border/30">
        <DropdownMenuItem 
          onClick={() => setTheme('light')}
          className={cn("gap-2 cursor-pointer", theme === 'light' && "bg-accent text-accent-foreground")}
        >
          <Sun className="h-4 w-4" />
          <span>Light</span>
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => setTheme('dark')}
          className={cn("gap-2 cursor-pointer", theme === 'dark' && "bg-accent text-accent-foreground")}
        >
          <Moon className="h-4 w-4" />
          <span>Dark</span>
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => setTheme('system')}
          className={cn("gap-2 cursor-pointer", theme === 'system' && "bg-accent text-accent-foreground")}
        >
          <Laptop className="h-4 w-4" />
          <span>System</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
