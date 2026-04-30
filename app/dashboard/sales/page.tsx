"use client";
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import SalesPage from '@/views/dashboard/SalesPage';

export default function DashboardSalesPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  useEffect(() => { if (!isLoading && !isAuthenticated) router.push("/login"); }, [isAuthenticated, isLoading, router]);
  if (isLoading || !isAuthenticated) return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>;
  return <DashboardLayout><SalesPage /></DashboardLayout>;
}
