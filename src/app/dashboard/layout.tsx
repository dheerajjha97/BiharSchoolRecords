
'use client';

import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, PlusCircle, Users, LogOut, Loader2, KeyRound, Building, History, CheckCircle2, Menu } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { usePendingAdmissionsCount } from '@/hooks/use-pending-admissions';

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  SidebarMenuBadge,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';


export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { school, loading, logout } = useAuth();
  const { count: pendingCount } = usePendingAdmissionsCount();
  const [open, setOpen] = React.useState(false);
  
  React.useEffect(() => {
    if (!loading && !school) {
      router.push('/login');
    }
  }, [loading, school, router]);

  const MobileNav = () => (
    <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="md:hidden text-primary-foreground hover:bg-primary/80 hover:text-primary-foreground">
            <Menu />
            <span className="sr-only">Toggle Menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent 
            side="left" 
            className="p-0 bg-sidebar text-sidebar-foreground"
        >
          <Sidebar>
             <SidebarHeader>
              <div className="flex items-center gap-2 p-2">
                {loading ? (
                    <div className="flex items-center gap-3 p-2 w-full">
                        <Skeleton className="h-8 w-8 rounded-md flex-shrink-0" />
                        <div className="group-data-[collapsible=icon]:hidden min-w-0 flex-1 space-y-1.5">
                            <Skeleton className="h-5 w-3/4" />
                            <Skeleton className="h-3 w-full" />
                        </div>
                    </div>
                ) : (
                  <Link href="/dashboard/profile" className="flex items-center gap-3 p-2 w-full" onClick={() => setOpen(false)}>
                      <div className="flex-shrink-0">
                          <Image src="/logo.jpg" alt="School Logo" width={32} height={32} className="rounded-md" />
                      </div>
                      <div className="group-data-[collapsible=icon]:hidden min-w-0">
                          <div className="font-bold text-base text-sidebar-primary">{school?.name || 'EduAssist'}</div>
                      </div>
                  </Link>
                )}
              </div>
            </SidebarHeader>
             <SidebarContent className="p-2 pt-8">
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={pathname === '/dashboard'} onClick={() => setOpen(false)}>
                    <Link href="/dashboard"><LayoutDashboard /><span>Dashboard</span></Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={pathname.startsWith('/dashboard/admissions/pending')} onClick={() => setOpen(false)}>
                    <Link href="/dashboard/admissions/pending"><History /><span>Pending Admissions</span>{pendingCount > 0 && <SidebarMenuBadge>{pendingCount}</SidebarMenuBadge>}</Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={pathname.startsWith('/dashboard/students')} onClick={() => setOpen(false)}>
                    <Link href="/dashboard/students"><CheckCircle2 /><span>Approved Students</span></Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={pathname === '/form'} onClick={() => setOpen(false)}>
                    <Link href="/form"><PlusCircle /><span>New Admission</span></Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                 <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={pathname === '/dashboard/profile'} onClick={() => setOpen(false)}>
                    <Link href="/dashboard/profile"><Building /><span>School Profile</span></Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={pathname === '/dashboard/reset-password'} onClick={() => setOpen(false)}>
                    <Link href="/dashboard/reset-password"><KeyRound /><span>Reset Password</span></Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarContent>
          </Sidebar>
        </SheetContent>
      </Sheet>
  )

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center gap-2 p-2">
            {loading ? (
                <div className="flex items-center gap-3 p-2 w-full">
                    <Skeleton className="h-8 w-8 rounded-md flex-shrink-0" />
                    <div className="group-data-[collapsible=icon]:hidden min-w-0 flex-1 space-y-1.5">
                        <Skeleton className="h-5 w-3/4" />
                        <Skeleton className="h-3 w-full" />
                    </div>
                </div>
            ) : (
              <Link href="/dashboard/profile" className="flex items-center gap-3 p-2 w-full">
                  <div className="flex-shrink-0">
                      <Image src="/logo.jpg" alt="School Logo" width={32} height={32} className="rounded-md" />
                  </div>
                  <div className="group-data-[collapsible=icon]:hidden min-w-0">
                      <div className="font-bold text-base text-sidebar-primary">{school?.name || 'EduAssist'}</div>
                  </div>
              </Link>
            )}
          </div>
        </SidebarHeader>
        <SidebarContent className="p-2">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={pathname === '/dashboard'} tooltip="Dashboard">
                <Link href="/dashboard"><LayoutDashboard /><span>Dashboard</span></Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={pathname.startsWith('/dashboard/admissions/pending')} tooltip="Pending Admissions">
                <Link href="/dashboard/admissions/pending"><History /><span>Pending Admissions</span>{pendingCount > 0 && <SidebarMenuBadge>{pendingCount}</SidebarMenuBadge>}</Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
             <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={pathname.startsWith('/dashboard/students')} tooltip="Approved Students">
                <Link href="/dashboard/students"><CheckCircle2 /><span>Approved Students</span></Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={pathname === '/form'} tooltip="New Admission">
                <Link href="/form"><PlusCircle /><span>New Admission</span></Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>
        <SidebarHeader className="mt-auto">
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === '/dashboard/profile'} tooltip="School Profile">
                  <Link href="/dashboard/profile"><Building /><span>School Profile</span></Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === '/dashboard/reset-password'} tooltip="Reset Password">
                  <Link href="/dashboard/reset-password"><KeyRound /><span>Reset Password</span></Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
      </Sidebar>
      <SidebarInset>
        <header className="flex items-center justify-between p-4 h-16 bg-primary text-primary-foreground shadow-md sticky top-0 z-10">
            <div className="flex items-center gap-4">
                <MobileNav />
                <div className="hidden md:block">
                  <h1 className="text-xl font-bold">{school?.name || 'EduAssist'}</h1>
                </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm hidden sm:inline">{school?.udise}</span>
              <Button variant="ghost" size="icon" onClick={logout} aria-label="Logout" className="text-primary-foreground hover:bg-primary/80 hover:text-primary-foreground">
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
        </header>
        <main className="flex-1 p-4 sm:p-6 md:p-8 bg-secondary/40">
            {(loading || !school) ? (
                <div className="flex items-center justify-center h-full">
                    <Loader2 className="h-8 w-8 animate-spin" />
                </div>
            ) : (
                children
            )}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
