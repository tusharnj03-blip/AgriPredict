import React, { Suspense, lazy } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './context/AuthContext'
import { ProtectedRoute, AdminRoute, PublicRoute } from './layouts/ProtectedRoute'
import AppLayout from './layouts/AppLayout'

// Public pages
const Home = lazy(() => import('./pages/public/Home'))
const About = lazy(() => import('./pages/public/About'))
const Features = lazy(() => import('./pages/public/Features'))
const Contact = lazy(() => import('./pages/public/Contact'))
const Login = lazy(() => import('./pages/auth/Login'))
const Register = lazy(() => import('./pages/auth/Register'))
const ForgotPassword = lazy(() => import('./pages/auth/ForgotPassword'))

// User pages
const Dashboard = lazy(() => import('./pages/user/Dashboard'))
const Profile = lazy(() => import('./pages/user/Profile'))
const Farms = lazy(() => import('./pages/user/Farms'))
const FarmDetail = lazy(() => import('./pages/user/FarmDetail'))
const YieldPrediction = lazy(() => import('./pages/user/YieldPrediction'))
const RiskAnalysis = lazy(() => import('./pages/user/RiskAnalysis'))
const CropRecommendation = lazy(() => import('./pages/user/CropRecommendation'))
const Weather = lazy(() => import('./pages/user/Weather'))
const SoilAnalysis = lazy(() => import('./pages/user/SoilAnalysis'))
const CropHealth = lazy(() => import('./pages/user/CropHealth'))
const MarketAnalysis = lazy(() => import('./pages/user/MarketAnalysis'))
const ProfitAnalysis = lazy(() => import('./pages/user/ProfitAnalysis'))
const WhatIfSimulator = lazy(() => import('./pages/user/WhatIfSimulator'))
const DiseaseDetection = lazy(() => import('./pages/user/DiseaseDetection'))
const Irrigation = lazy(() => import('./pages/user/Irrigation'))
const Alerts = lazy(() => import('./pages/user/Alerts'))
const History = lazy(() => import('./pages/user/History'))
const Reports = lazy(() => import('./pages/user/Reports'))
const Settings = lazy(() => import('./pages/user/Settings'))
const Assistant = lazy(() => import('./pages/user/Assistant'))

// Admin pages
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'))
const AdminUsers = lazy(() => import('./pages/admin/AdminUsers'))
const AdminUserActivity = lazy(() => import('./pages/admin/AdminUserActivity'))
const AdminAnalytics = lazy(() => import('./pages/admin/AdminAnalytics'))
const AdminPredictions = lazy(() => import('./pages/admin/AdminPredictions'))
const AdminFarms = lazy(() => import('./pages/admin/AdminFarms'))
const AdminModels = lazy(() => import('./pages/admin/AdminModels'))
const AdminSystemLogs = lazy(() => import('./pages/admin/AdminSystemLogs'))
const AdminReports = lazy(() => import('./pages/admin/AdminReports'))
const AdminSettings = lazy(() => import('./pages/admin/AdminSettings'))

const NotFound = lazy(() => import('./pages/NotFound'))

function PageLoader() {
  return (
    <div className="min-h-screen bg-agri-dark flex items-center justify-center">
      <div className="text-center">
        <div className="w-10 h-10 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-gray-400 text-sm">Loading...</p>
      </div>
    </div>
  )
}

function UserLayout({ children }) {
  return (
    <ProtectedRoute>
      <AppLayout>{children}</AppLayout>
    </ProtectedRoute>
  )
}

function AdminLayout({ children }) {
  return (
    <AdminRoute>
      <AppLayout>{children}</AppLayout>
    </AdminRoute>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#1a2e1f',
              color: '#fff',
              border: '1px solid #2d4a35',
            },
            success: { iconTheme: { primary: '#22c55e', secondary: '#fff' } },
            error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
          }}
        />
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/features" element={<Features />} />
            <Route path="/contact" element={<Contact />} />

            {/* Auth routes */}
            <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
            <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
            <Route path="/forgot-password" element={<ForgotPassword />} />

            {/* User routes */}
            <Route path="/dashboard" element={<UserLayout><Dashboard /></UserLayout>} />
            <Route path="/profile" element={<UserLayout><Profile /></UserLayout>} />
            <Route path="/farms" element={<UserLayout><Farms /></UserLayout>} />
            <Route path="/farms/:id" element={<UserLayout><FarmDetail /></UserLayout>} />
            <Route path="/yield-prediction" element={<UserLayout><YieldPrediction /></UserLayout>} />
            <Route path="/risk-analysis" element={<UserLayout><RiskAnalysis /></UserLayout>} />
            <Route path="/crop-recommendation" element={<UserLayout><CropRecommendation /></UserLayout>} />
            <Route path="/weather" element={<UserLayout><Weather /></UserLayout>} />
            <Route path="/soil-analysis" element={<UserLayout><SoilAnalysis /></UserLayout>} />
            <Route path="/crop-health" element={<UserLayout><CropHealth /></UserLayout>} />
            <Route path="/market-analysis" element={<UserLayout><MarketAnalysis /></UserLayout>} />
            <Route path="/profit-analysis" element={<UserLayout><ProfitAnalysis /></UserLayout>} />
            <Route path="/what-if-simulator" element={<UserLayout><WhatIfSimulator /></UserLayout>} />
            <Route path="/disease-detection" element={<UserLayout><DiseaseDetection /></UserLayout>} />
            <Route path="/irrigation" element={<UserLayout><Irrigation /></UserLayout>} />
            <Route path="/alerts" element={<UserLayout><Alerts /></UserLayout>} />
            <Route path="/history" element={<UserLayout><History /></UserLayout>} />
            <Route path="/reports" element={<UserLayout><Reports /></UserLayout>} />
            <Route path="/settings" element={<UserLayout><Settings /></UserLayout>} />
            <Route path="/assistant" element={<UserLayout><Assistant /></UserLayout>} />

            {/* Admin routes */}
            <Route path="/admin" element={<AdminLayout><AdminDashboard /></AdminLayout>} />
            <Route path="/admin/users" element={<AdminLayout><AdminUsers /></AdminLayout>} />
            <Route path="/admin/user-activity" element={<AdminLayout><AdminUserActivity /></AdminLayout>} />
            <Route path="/admin/analytics" element={<AdminLayout><AdminAnalytics /></AdminLayout>} />
            <Route path="/admin/predictions" element={<AdminLayout><AdminPredictions /></AdminLayout>} />
            <Route path="/admin/farms" element={<AdminLayout><AdminFarms /></AdminLayout>} />
            <Route path="/admin/models" element={<AdminLayout><AdminModels /></AdminLayout>} />
            <Route path="/admin/system-logs" element={<AdminLayout><AdminSystemLogs /></AdminLayout>} />
            <Route path="/admin/reports" element={<AdminLayout><AdminReports /></AdminLayout>} />
            <Route path="/admin/settings" element={<AdminLayout><AdminSettings /></AdminLayout>} />

            {/* Legacy URL fallbacks / redirects */}
            <Route path="/demo" element={<Navigate to="/yield-prediction" replace />} />
            <Route path="/demo.html" element={<Navigate to="/yield-prediction" replace />} />
            <Route path="/pages/demo.html" element={<Navigate to="/yield-prediction" replace />} />
            <Route path="/how-it-works" element={<Navigate to="/features" replace />} />
            <Route path="/pages/how-it-works.html" element={<Navigate to="/features" replace />} />
            <Route path="/roadmap" element={<Navigate to="/about" replace />} />
            <Route path="/pages/roadmap.html" element={<Navigate to="/about" replace />} />

            {/* 404 */}
            <Route path="/not-found" element={<NotFound />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </AuthProvider>
    </BrowserRouter>
  )
}
