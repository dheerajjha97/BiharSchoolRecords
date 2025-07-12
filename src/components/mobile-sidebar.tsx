
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Menu, LayoutDashboard, PlusCircle, Users, LogOut, KeyRound, Building, History, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/context/AuthContext';
import { usePendingAdmissionsCount } from '@/hooks/use-pending-admissions';

const menuItems = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/dashboard/admissions/pending', label: 'Pending Admissions', icon: History, notification: 'pending' },
    { href: '/dashboard/students', label: 'Approved Students', icon: CheckCircle2 },
    { href: '/form', label: 'New Admission', icon: PlusCircle },
    { href: '/dashboard/profile', label: 'School Profile', icon: Building },
    { href: '/dashboard/reset-password', label: 'Reset Password', icon: KeyRound },
];

export function MobileSidebar() {
    const [open, setOpen] = useState(false);
    const pathname = usePathname();
    const { school, loading } = useAuth();
    const { count: pendingCount } = usePendingAdmissionsCount();

    useEffect(() => {
        setOpen(false);
    }, [pathname]);

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden">
                    <Menu />
                    <span className="sr-only">Toggle Menu</span>
                </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-72">
                <div className="flex h-full flex-col" style={{
                    background: 'linear-gradient(0deg, hsla(249, 80%, 30%, 1) 0%, hsla(251, 68%, 16%, 1) 100%)'
                }}>
                    <div className="p-4 border-b border-sidebar-border">
                        {loading ? (
                            <div className="flex items-center gap-3">
                                <Skeleton className="h-10 w-10 rounded-md" />
                                <div className="space-y-1.5">
                                    <Skeleton className="h-5 w-32" />
                                    <Skeleton className="h-3 w-40" />
                                </div>
                            </div>
                        ) : (
                            <Link href="/dashboard/profile" className="flex items-center gap-3">
                                <Image src="/logo.jpg" alt="School Logo" width={40} height={40} className="rounded-md" />
                                <div>
                                    <div className="font-bold text-base text-sidebar-primary">{school?.name || 'EduAssist'}</div>
                                    <div className="text-xs text-sidebar-foreground/70">{school?.address}</div>
                                </div>
                            </Link>
                        )}
                    </div>
                    <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                        {menuItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`flex items-center gap-3 rounded-md px-3 py-2 text-base font-medium transition-colors
                                        ${isActive
                                            ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                                            : 'text-sidebar-foreground hover:bg-sidebar-accent/50'
                                        }`}
                                >
                                    <Icon className="h-5 w-5" />
                                    <span>{item.label}</span>
                                    {item.notification === 'pending' && pendingCount > 0 && (
                                        <span className="ml-auto flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-xs text-white">
                                            {pendingCount}
                                        </span>
                                    )}
                                </Link>
                            );
                        })}
                    </nav>
                </div>
            </SheetContent>
        </Sheet>
    );
}
