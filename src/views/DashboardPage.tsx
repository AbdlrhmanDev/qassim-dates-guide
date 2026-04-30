import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import UserDashboard from './dashboard/UserDashboard';
import AdminDashboard from './dashboard/AdminDashboard';
import TraderDashboard from './dashboard/TraderDashboard';
import UsersPage from './dashboard/UsersPage';
import ProductsPage from './dashboard/ProductsPage';
import AnalyticsPage from './dashboard/AnalyticsPage';
import ReportsPage from './dashboard/ReportsPage';
import SettingsPage from './dashboard/SettingsPage';
import OrdersPage from './dashboard/OrdersPage';
import ProfilePage from './dashboard/ProfilePage';
import SalesPage from './dashboard/SalesPage';
import ExhibitionsAdminPage from './dashboard/ExhibitionsAdminPage';
import TradersAdminPage from './dashboard/TradersAdminPage';
import ProducersAdminPage from './dashboard/ProducersAdminPage';

const DashboardPage: React.FC = () => {
  const { isRTL } = useLanguage();
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/demo-login" replace />;
  }

  const getPageContent = () => {
    const path = location.pathname;
    
    if (path.includes('/users')) return <UsersPage />;
    if (path.includes('/products')) return <ProductsPage />;
    if (path.includes('/analytics')) return <AnalyticsPage />;
    if (path.includes('/reports')) return <ReportsPage />;
    if (path.includes('/settings')) return <SettingsPage />;
    if (path.includes('/orders')) return <OrdersPage />;
    if (path.includes('/profile')) return <ProfilePage />;
    if (path.includes('/sales')) return <SalesPage />;
    if (path.includes('/exhibitions')) return <ExhibitionsAdminPage />;
    if (path.includes('/traders')) return <TradersAdminPage />;
    if (path.includes('/producers')) return <ProducersAdminPage />;
    
    switch (user?.role) {
      case 'admin': return <AdminDashboard />;
      case 'trader': return <TraderDashboard />;
      default: return <UserDashboard />;
    }
  };

  return (
    <>
      <Helmet>
        <title>{isRTL ? 'لوحة التحكم' : 'Dashboard'} | {isRTL ? 'تمور القصيم' : 'Qassim Dates'}</title>
      </Helmet>
      <DashboardLayout>
        {getPageContent()}
      </DashboardLayout>
    </>
  );
};

export default DashboardPage;
