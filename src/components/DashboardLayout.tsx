import React, { useState } from 'react';
import { useEffect } from 'react';
import { useLanguage } from '@/lib/i18n';
import { useTheme } from '@/lib/theme';
import { useAuth } from '@/lib/auth';
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarTrigger,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Moon, Sun, Globe, LogOut, MessageSquare, Lightbulb, User, BarChart3, Users, DollarSign } from 'lucide-react';


interface DashboardLayoutProps {
  children: React.ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
  tabs: { id: string; label: string; icon: React.ElementType }[];
}

export default function DashboardLayout({ children, activeTab, onTabChange, tabs }: DashboardLayoutProps) {
  const { t, lang, setLang } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const { user, signOut } = useAuth();

// ده جزء جوه الـ DashboardLayout بتاعك
const [isBlocked, setIsBlocked] = useState(false);



  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <Sidebar collapsible="icon">
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-bold text-primary-foreground">SV</span>
                  </div>
                  <span className="text-sm font-semibold truncate">{t('systemName')}</span>
                </div>
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {tabs.map(tab => (
                    <SidebarMenuItem key={tab.id}>
                      <SidebarMenuButton
                        onClick={() => onTabChange(tab.id)}
                        className={activeTab === tab.id ? 'bg-primary/10 text-primary font-medium' : ''}
                      >
                        <tab.icon className="h-4 w-4" />
                        <span>{tab.label}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            <SidebarGroup className="mt-auto">
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton onClick={signOut} className="text-destructive">
                      <LogOut className="h-4 w-4" />
                      <span>{t('logout')}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>

        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-14 flex items-center justify-between border-b border-border px-4">
            <div className="flex items-center gap-2">
              <SidebarTrigger />
              <span className="text-sm text-muted-foreground">{user?.email}</span>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" onClick={toggleTheme}>
                {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </Button>
              <Button variant="outline" size="sm" onClick={() => setLang(lang === 'en' ? 'ar' : 'en')}>
                <Globe className="h-4 w-4 me-1" />
                {lang === 'en' ? 'عربي' : 'EN'}
              </Button>
            </div>
          </header>
          <main className="flex-1 p-4 md:p-6 overflow-auto">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
