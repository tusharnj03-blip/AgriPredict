import React, { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { farmsAPI, alertsAPI } from '../services/api'
import {
  LayoutDashboard, MapPin, TrendingUp, AlertTriangle, Leaf, Cloud,
  FlaskConical, Heart, BarChart3, DollarSign, Zap, Bug, Droplets,
  Bell, FileText, Settings, LogOut, Menu, X, ChevronDown,
  User, Shield, Activity, Database, Sparkles, Search, ChevronRight,
  ExternalLink, Command
} from 'lucide-react'
import clsx from 'clsx'
import Modal from '../components/ui/Modal'
import Badge from '../components/ui/Badge'

const USER_NAV_GROUPS = [
  {
    group: 'OVERVIEW',
    items: [
      { path: '/dashboard', icon: LayoutDashboard, label: 'Executive Dashboard' },
    ]
  },
  {
    group: 'AGRICULTURAL INTELLIGENCE',
    items: [
      { path: '/yield-prediction', icon: TrendingUp, label: 'Yield Forecast' },
      { path: '/risk-analysis', icon: AlertTriangle, label: 'Risk Intelligence' },
      { path: '/crop-recommendation', icon: Leaf, label: 'Crop Recommendation' },
      { path: '/soil-analysis', icon: FlaskConical, label: 'Soil Intelligence' },
      { path: '/weather', icon: Cloud, label: 'Weather Intelligence' },
      { path: '/crop-health', icon: Heart, label: 'Crop Monitoring' },
    ]
  },
  {
    group: 'FARM OPERATIONS',
    items: [
      { path: '/farms', icon: MapPin, label: 'My Farms' },
      { path: '/irrigation', icon: Droplets, label: 'Irrigation Management' },
      { path: '/disease-detection', icon: Bug, label: 'Disease Diagnostics' },
    ]
  },
  {
    group: 'BUSINESS INTELLIGENCE',
    items: [
      { path: '/market-analysis', icon: BarChart3, label: 'Market & Mandi Trends' },
      { path: '/profit-analysis', icon: DollarSign, label: 'Economic & Profit Assays' },
      { path: '/reports', icon: FileText, label: 'Intelligence Reports' },
    ]
  },
  {
    group: 'AI TOOLS',
    items: [
      { path: '/what-if-simulator', icon: Zap, label: 'What-If Simulator' },
      { path: '/assistant', icon: Sparkles, label: 'AgriAI Assistant', badge: 'AI' },
    ]
  },
  {
    group: 'ACCOUNT',
    items: [
      { path: '/alerts', icon: Bell, label: 'System Alerts' },
      { path: '/settings', icon: Settings, label: 'Settings & Security' },
      { path: '/profile', icon: User, label: 'Account Profile' },
    ]
  }
]

const ADMIN_NAV_GROUPS = [
  {
    group: 'GOVERNANCE & TELEMETRY',
    items: [
      { path: '/admin', icon: LayoutDashboard, label: 'Admin Dashboard' },
      { path: '/admin/users', icon: User, label: 'User Management' },
      { path: '/admin/user-activity', icon: Activity, label: 'Live Telemetry' },
      { path: '/admin/analytics', icon: BarChart3, label: 'Platform Analytics' },
    ]
  },
  {
    group: 'DATA & MODELS',
    items: [
      { path: '/admin/predictions', icon: TrendingUp, label: 'Predictions Log' },
      { path: '/admin/farms', icon: MapPin, label: 'Farm Directory' },
      { path: '/admin/models', icon: Database, label: 'Model Governance' },
    ]
  },
  {
    group: 'AUDIT & CONFIGURATION',
    items: [
      { path: '/admin/system-logs', icon: FileText, label: 'System Audit Logs' },
      { path: '/admin/reports', icon: FileText, label: 'Generated Reports' },
      { path: '/admin/settings', icon: Settings, label: 'Admin Security' },
    ]
  }
]

export default function AppLayout({ children }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(false)
  const [farms, setFarms] = useState([])
  const [selectedFarm, setSelectedFarm] = useState(null)
  const [unreadAlerts, setUnreadAlerts] = useState(0)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const isAdmin = user?.role === 'ADMIN'
  const navGroups = isAdmin ? ADMIN_NAV_GROUPS : USER_NAV_GROUPS

  useEffect(() => {
    // Load farms and unread alerts for top navigation
    if (!isAdmin) {
      farmsAPI.list().then(res => {
        const data = res.data || []
        setFarms(data)
        if (data.length > 0) setSelectedFarm(data[0])
      }).catch(() => {})

      alertsAPI.list().then(res => {
        const unread = (res.data || []).filter(a => !a.is_read).length
        setUnreadAlerts(unread)
      }).catch(() => {})
    }
  }, [isAdmin])

  // Handle hotkey Cmd+K or Ctrl+K for quick navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setSearchOpen(prev => !prev)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  // Quick navigation items for search modal
  const allNavItems = navGroups.flatMap(g => g.items)
  const filteredNavItems = searchQuery
    ? allNavItems.filter(i => i.label.toLowerCase().includes(searchQuery.toLowerCase()))
    : allNavItems

  return (
    <div className="flex h-screen overflow-hidden bg-[#F7F8F4] text-[#202923]">
      {/* Mobile Backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-[#10291F]/50 backdrop-blur-xs z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <aside
        className={clsx(
          'fixed lg:static inset-y-0 left-0 z-40 flex flex-col bg-white border-r border-[#E5E9E3] transition-all duration-200 select-none shrink-0',
          collapsed ? 'w-16' : 'w-64',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Brand Header */}
        <div
          className={clsx(
            'h-16 flex items-center border-b border-[#E5E9E3] px-4 gap-3 bg-white shrink-0',
            collapsed && 'justify-center px-2'
          )}
        >
          <div className="w-8 h-8 rounded-md bg-[#183D2B] flex items-center justify-center text-white shrink-0 shadow-subtle">
            <Leaf size={16} />
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <div className="font-semibold text-sm tracking-tight text-[#10291F] flex items-center gap-1.5">
                <span>AgriPredict AI</span>
                {isAdmin && <span className="text-[10px] bg-[#EEF2EC] text-[#183D2B] px-1.5 py-0.2 rounded font-mono font-bold">ADMIN</span>}
              </div>
              <p className="text-[10px] text-[#69766E] truncate font-medium">Intelligence for Every Acre.</p>
            </div>
          )}
        </div>

        {/* Navigation Sections */}
        <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-4">
          {navGroups.map((group, gIdx) => (
            <div key={gIdx}>
              {!collapsed && (
                <div className="sidebar-section-header">
                  {group.group}
                </div>
              )}
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const isActive = location.pathname === item.path ||
                    (item.path !== '/admin' && item.path !== '/dashboard' && location.pathname.startsWith(item.path))
                  const Icon = item.icon
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setSidebarOpen(false)}
                      className={clsx(
                        'sidebar-link',
                        isActive && 'active',
                        collapsed ? 'justify-center px-2' : ''
                      )}
                      title={collapsed ? item.label : undefined}
                    >
                      <Icon
                        size={16}
                        className={clsx(
                          'shrink-0',
                          isActive ? 'text-[#183D2B]' : 'text-[#69766E]'
                        )}
                      />
                      {!collapsed && (
                        <div className="flex-1 flex items-center justify-between min-w-0">
                          <span className="truncate">{item.label}</span>
                          {item.badge && (
                            <span className="text-[9px] font-bold bg-[#E9EFE9] text-[#183D2B] px-1.5 py-0.2 rounded">
                              {item.badge}
                            </span>
                          )}
                        </div>
                      )}
                    </Link>
                  )
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* User Account / Footer */}
        <div className="p-3 border-t border-[#E5E9E3] bg-[#FAFBF9] shrink-0">
          {!collapsed ? (
            <div className="flex items-center gap-2.5 mb-2.5 px-1">
              <div className="w-8 h-8 rounded-full bg-[#183D2B] text-white flex items-center justify-center font-semibold text-xs shrink-0">
                {user?.full_name?.[0]?.toUpperCase() || 'U'}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs font-semibold text-[#10291F] truncate">{user?.full_name}</div>
                <div className="text-[11px] text-[#69766E] truncate">{user?.email}</div>
              </div>
            </div>
          ) : (
            <div className="flex justify-center mb-2">
              <div className="w-8 h-8 rounded-full bg-[#183D2B] text-white flex items-center justify-center font-semibold text-xs">
                {user?.full_name?.[0]?.toUpperCase() || 'U'}
              </div>
            </div>
          )}

          <button
            onClick={handleLogout}
            className={clsx(
              'sidebar-link w-full text-[#D45B4C] hover:text-[#B84739] hover:bg-[#FDEEED]',
              collapsed && 'justify-center px-2'
            )}
            title={collapsed ? 'Sign Out' : undefined}
          >
            <LogOut size={15} className="shrink-0" />
            {!collapsed && <span>Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-[#F7F8F4]">
        {/* Top Header Bar */}
        <header className="h-16 bg-white border-b border-[#E5E9E3] flex items-center justify-between px-4 sm:px-6 shrink-0 z-10">
          <div className="flex items-center gap-3 min-w-0">
            {/* Mobile menu trigger */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-1.5 rounded-md text-[#69766E] hover:text-[#10291F] hover:bg-[#EEF2EC]"
            >
              <Menu size={18} />
            </button>

            {/* Desktop collapse toggle */}
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="hidden lg:flex p-1.5 rounded-md text-[#69766E] hover:text-[#10291F] hover:bg-[#EEF2EC]"
              title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            >
              <Menu size={18} />
            </button>

            {/* Breadcrumb path */}
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-[#69766E] truncate">
              <Link to="/dashboard" className="hover:text-[#10291F]">AgriPredict</Link>
              <ChevronRight size={12} className="text-[#A8B9A5]" />
              <span className="font-semibold text-[#10291F] capitalize truncate">
                {location.pathname.replace(/^\/admin\/?/, 'Admin: ').replace(/^\//, '').replace(/-/g, ' ') || 'Dashboard'}
              </span>
            </div>
          </div>

          {/* Right Header Controls */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Farm Context Selector for Farmers */}
            {!isAdmin && farms.length > 0 && (
              <div className="hidden md:flex items-center gap-1.5 bg-[#FAFBF9] border border-[#E5E9E3] px-2.5 py-1 rounded-md text-xs">
                <MapPin size={13} className="text-[#183D2B]" />
                <select
                  className="bg-transparent font-medium text-[#10291F] outline-none cursor-pointer max-w-[150px] truncate"
                  value={selectedFarm?.id || ''}
                  onChange={(e) => {
                    const f = farms.find(farm => farm.id === parseInt(e.target.value))
                    setSelectedFarm(f)
                  }}
                >
                  {farms.map(f => (
                    <option key={f.id} value={f.id}>
                      {f.farm_name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Quick Navigation Search Button (Cmd+K) */}
            <button
              onClick={() => setSearchOpen(true)}
              className="hidden sm:flex items-center gap-2 bg-[#F7F8F4] border border-[#E5E9E3] hover:border-[#A8B9A5] px-2.5 py-1.5 rounded-md text-xs text-[#69766E] transition-all"
            >
              <Search size={13} />
              <span>Search modules...</span>
              <kbd className="font-mono text-[10px] bg-white border border-[#E5E9E3] px-1.5 py-0.2 rounded text-[#8C9991]">
                ⌘K
              </kbd>
            </button>

            {/* Alerts notification icon */}
            <Link
              to="/alerts"
              className="relative p-1.5 rounded-md text-[#69766E] hover:text-[#10291F] hover:bg-[#EEF2EC] transition-colors"
              title="System Alerts"
            >
              <Bell size={17} />
              {unreadAlerts > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#D45B4C] ring-2 ring-white" />
              )}
            </Link>

            {/* User Profile Avatar Link */}
            <Link
              to={isAdmin ? '/admin/settings' : '/profile'}
              className="flex items-center gap-2 pl-2 border-l border-[#E5E9E3] hover:opacity-85 transition-opacity"
            >
              <div className="w-7 h-7 rounded-full bg-[#183D2B] text-white flex items-center justify-center font-bold text-xs shadow-subtle">
                {user?.full_name?.[0]?.toUpperCase() || 'U'}
              </div>
              <span className="text-xs font-semibold text-[#10291F] hidden xl:inline truncate max-w-[120px]">
                {user?.full_name?.split(' ')[0]}
              </span>
            </Link>
          </div>
        </header>

        {/* Scrollable Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>

      {/* Quick Search / Command Palette Modal */}
      <Modal
        isOpen={searchOpen}
        onClose={() => {
          setSearchOpen(false)
          setSearchQuery('')
        }}
        maxWidth="max-w-lg"
      >
        <div className="space-y-3">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#69766E]" />
            <input
              type="text"
              placeholder="Jump to module, intelligence tool, or farm management..."
              className="input-field pl-9 py-2 text-xs"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus
            />
          </div>

          <div className="max-h-64 overflow-y-auto space-y-1 pt-2">
            {filteredNavItems.map((item) => (
              <div
                key={item.path}
                onClick={() => {
                  navigate(item.path)
                  setSearchOpen(false)
                  setSearchQuery('')
                }}
                className="flex items-center justify-between p-2 rounded-md hover:bg-[#F7F8F4] cursor-pointer text-xs group"
              >
                <div className="flex items-center gap-2.5">
                  <item.icon size={15} className="text-[#69766E] group-hover:text-[#183D2B]" />
                  <span className="font-medium text-[#202923] group-hover:text-[#183D2B]">{item.label}</span>
                </div>
                <ChevronRight size={13} className="text-[#A8B9A5]" />
              </div>
            ))}
            {filteredNavItems.length === 0 && (
              <p className="text-xs text-[#69766E] text-center py-4">No matching modules found</p>
            )}
          </div>
        </div>
      </Modal>
    </div>
  )
}
