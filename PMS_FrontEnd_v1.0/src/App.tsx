import React, { useEffect, useState } from 'react';
import { LoginPage } from './components/LoginPage';
import { DashboardPage } from './components/DashboardPage';
import { ProjectDetailPage } from './components/ProjectDetailPage';
import { AdminPage } from './components/AdminPage';
import { ExecutiveDashboard } from './components/ExecutiveDashboard';
import { BudgetManagementPage } from './components/BudgetManagementPage';
import { IntegrationsPage } from './components/IntegrationsPage';
import { ThemeToggle } from './components/ThemeToggle';
import { useTheme } from './components/useTheme';
import { useAuth } from './context/AuthContext';
import type { Project, User } from './api/types';

type Page = 'login' | 'dashboard' | 'project' | 'admin' | 'executive' | 'budget' | 'integrations';

export default function App() {
  const { user, setAuth, clearAuth } = useAuth();
  const [currentPage, setCurrentPage] = useState<Page>(user ? 'dashboard' : 'login');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const { isDarkMode, toggleTheme } = useTheme();

  useEffect(() => {
    if (!user && currentPage !== 'login') {
      setCurrentPage('login');
    }
  }, [user, currentPage]);

  const handleLogin = (userData: User, token: string) => {
    setAuth(userData, token);
    setCurrentPage('dashboard');
  };

  const handleLogout = () => {
    clearAuth();
    setSelectedProject(null);
    setCurrentPage('login');
  };

  const handleProjectSelect = (project: Project) => {
    setSelectedProject(project);
    setCurrentPage('project');
  };

  const handleBackToDashboard = () => {
    setSelectedProject(null);
    setCurrentPage('dashboard');
  };

  const handleAdminAccess = () => {
    setCurrentPage('admin');
  };

  const handleBackFromAdmin = () => {
    setCurrentPage('dashboard');
  };

  const handleExecutiveAccess = () => {
    setCurrentPage('executive');
  };

  const handleBudgetAccess = () => {
    setCurrentPage('budget');
  };

  const handleIntegrationsAccess = () => {
    setCurrentPage('integrations');
  };

  const handleBackFromExecutive = () => {
    setCurrentPage('dashboard');
  };

  const handleBackFromBudget = () => {
    setCurrentPage('dashboard');
  };

  const handleBackFromIntegrations = () => {
    setCurrentPage('dashboard');
  };

  return (
    <div className="min-h-screen" style={{ background: 'var(--background)' }}>
      {/* 플로팅 테마 토글 - 모든 페이지에서 접근 가능 */}
      <ThemeToggle 
        isDarkMode={isDarkMode} 
        onToggle={toggleTheme} 
        variant="floating"
      />

      {currentPage === 'login' && (
        <LoginPage onLogin={handleLogin} isDarkMode={isDarkMode} onToggleDarkMode={toggleTheme} />
      )}
      
      {currentPage === 'dashboard' && user && (
        <DashboardPage 
          user={user}
          onLogout={handleLogout}
          onProjectSelect={handleProjectSelect}
          isDarkMode={isDarkMode}
          onToggleDarkMode={toggleTheme}
          onAdminAccess={handleAdminAccess}
          onExecutiveAccess={handleExecutiveAccess}
          onBudgetAccess={handleBudgetAccess}
          onIntegrationsAccess={handleIntegrationsAccess}
        />
      )}
      
      {currentPage === 'project' && user && selectedProject && (
        <ProjectDetailPage 
          user={user}
          project={selectedProject}
          onBack={handleBackToDashboard}
          onLogout={handleLogout}
          isDarkMode={isDarkMode}
          onToggleDarkMode={toggleTheme}
        />
      )}
      
      {currentPage === 'admin' && user && (
        <AdminPage 
          user={user}
          onBack={handleBackFromAdmin}
          onLogout={handleLogout}
          isDarkMode={isDarkMode}
          onToggleDarkMode={toggleTheme}
        />
      )}

      {currentPage === 'executive' && user && (
        <ExecutiveDashboard 
          user={user}
          onBack={handleBackFromExecutive}
          onLogout={handleLogout}
          isDarkMode={isDarkMode}
          onToggleDarkMode={toggleTheme}
        />
      )}

      {currentPage === 'budget' && user && (
        <BudgetManagementPage 
          user={user}
          onBack={handleBackFromBudget}
          onLogout={handleLogout}
          isDarkMode={isDarkMode}
          onToggleDarkMode={toggleTheme}
        />
      )}

      {currentPage === 'integrations' && user && (
        <IntegrationsPage 
          user={user}
          onBack={handleBackFromIntegrations}
          onLogout={handleLogout}
          isDarkMode={isDarkMode}
          onToggleDarkMode={toggleTheme}
        />
      )}
    </div>
  );
}
