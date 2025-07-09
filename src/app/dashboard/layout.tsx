
'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, PlusCircle, School, Users, LogOut, Loader2, KeyRound } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';


export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { school, loading, logout } = useAuth();
  
  React.useEffect(() => {
    if (!loading && !school) {
      router.push('/login');
    }
  }, [loading, school, router]);

  if (loading || !school) {
    return (
        <div className="flex items-center justify-center min-h-screen bg-background">
            <Loader2 className="h-8 w-8 animate-spin" />
        </div>
    );
  }

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center gap-2 p-2">
            <Link href="/dashboard" className="flex items-center gap-3 p-2 w-full">
                <div className="p-2 bg-primary/10 rounded-lg flex-shrink-0">
                    <School className="h-6 w-6 text-primary" />
                </div>
                <div className="group-data-[collapsible=icon]:hidden min-w-0">
                    <div className="font-bold text-base text-sidebar-primary">{school?.name || 'EduAssist'}</div>
                    <div className="text-xs text-sidebar-foreground/70 whitespace-pre-wrap">{school?.address}</div>
                </div>
            </Link>
          </div>
        </SidebarHeader>
        <SidebarContent className="p-2">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={pathname === '/dashboard'}
                tooltip="Dashboard"
              >
                <Link href="/dashboard">
                  <LayoutDashboard />
                  <span>Dashboard</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
             <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={pathname.startsWith('/dashboard/students')}
                tooltip="Students List"
              >
                <Link href="/dashboard/students">
                  <Users />
                  <span>Students List</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={pathname === '/form'}
                tooltip="New Admission"
              >
                <Link href="/form">
                  <PlusCircle />
                  <span>New Admission</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
             <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={pathname === '/dashboard/reset-password'}
                tooltip="Reset Password"
              >
                <Link href="/dashboard/reset-password">
                  <KeyRound />
                  <span>Reset Password</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>
      </Sidebar>
      <SidebarInset>
        <header className="flex items-center justify-between p-2 border-b bg-card min-h-[60px]">
            <div className="flex items-center gap-2">
                <SidebarTrigger className="lg:hidden" />
                <div className="lg:hidden">
                    <div className="font-bold text-base">{school?.name || 'EduAssist'}</div>
                    <div className="text-muted-foreground text-xs">{school?.address}</div>
                </div>
            </div>
            <div>
              <Button variant="ghost" size="icon" onClick={logout} aria-label="Logout">
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
        </header>
        <div className="flex-1 p-4 sm:p-6 md:p-8 bg-secondary/40">
            {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
