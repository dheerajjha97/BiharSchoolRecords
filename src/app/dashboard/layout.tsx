'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { FileCog, LayoutDashboard, LogOut, PlusCircle, School, Users } from 'lucide-react';
import { useSchoolData } from '@/hooks/use-school-data';

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
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import {
    Menubar,
    MenubarContent,
    MenubarItem,
    MenubarMenu,
    MenubarTrigger,
} from "@/components/ui/menubar"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { school, loading } = useSchoolData();

  const handleLogout = () => {
    localStorage.removeItem('udise_code');
    localStorage.removeItem('school_data');
    router.push('/');
  };

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center gap-2 p-2">
            <SidebarTrigger className="size-8 lg:hidden" />
            <Link href="/dashboard" className="flex items-center gap-3 font-bold text-xl text-primary p-2">
              <div className="p-2 bg-primary/10 rounded-lg">
                <School className="h-6 w-6" />
              </div>
              <div className="group-data-[collapsible=icon]:hidden">
                {loading ? (
                    <div className="space-y-1">
                        <Skeleton className="h-5 w-32" />
                    </div>
                ) : (
                    <span>{school?.name || 'EduAssist'}</span>
                )}
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
          </SidebarMenu>
        </SidebarContent>
      </Sidebar>
      <SidebarInset>
        <header className="flex items-center justify-end p-2 border-b bg-card">
            <Menubar className="border-none bg-transparent shadow-none">
                <MenubarMenu>
                    <MenubarTrigger asChild>
                        <Button variant="ghost">
                            <FileCog className="mr-2 h-4 w-4" />
                            Options
                        </Button>
                    </MenubarTrigger>
                    <MenubarContent align="end">
                        <MenubarItem onClick={handleLogout} className="text-destructive focus:bg-destructive/10 focus:text-destructive cursor-pointer">
                            <LogOut className="mr-2 h-4 w-4" />
                            <span>Logout</span>
                        </MenubarItem>
                    </MenubarContent>
                </MenubarMenu>
            </Menubar>
        </header>
        <main className="min-h-screen p-4 sm:p-6 md:p-8 bg-secondary/40">
            {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
