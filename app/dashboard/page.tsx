"use client";

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import UserDashboard from '@/pages/dashboard/UserDashboard';
import AdminDashboard from '@/pages/dashboard/AdminDashboard';
import TraderDashboard from '@/pages/dashboard/TraderDashboard';

export default function DashboardPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  // Show nothing while checking auth state
  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const getPageContent = () => {
    switch (user?.role) {
      case 'admin':  return <AdminDashboard />;
      case 'trader': return <TraderDashboard />;
      default:       return <UserDashboard />;
    }
  };

  return (
    <DashboardLayout>
      {getPageContent()}
    </DashboardLayout>
  );
}
