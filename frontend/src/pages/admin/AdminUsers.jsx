import React, { useState, useEffect } from 'react'
import { adminAPI } from '../../services/api'
import { Users, Search, Eye, Shield, UserCheck } from 'lucide-react'
import { Link } from 'react-router-dom'
import Card from '../../components/ui/Card'
import Input from '../../components/ui/Input'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import EmptyState from '../../components/ui/EmptyState'
import { TableSkeleton } from '../../components/ui/Skeleton'

export default function AdminUsers() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const perPage = 20

  useEffect(() => {
    setLoading(true)
    adminAPI.users({ search, page, per_page: perPage })
      .then(r => {
        setUsers(r.data.users || r.data || [])
        setTotal(r.data.total || (r.data.users ? r.data.users.length : r.data.length) || 0)
      })
      .catch(() => setUsers([]))
      .finally(() => setLoading(false))
  }, [search, page])

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-brand-border">
        <div>
          <h1 className="text-2xl font-semibold text-brand-text tracking-tight flex items-center gap-2.5">
            <Users className="w-6 h-6 text-brand-emerald" />
            User Identity & Tenant Administration
          </h1>
          <p className="text-sm text-brand-secondary mt-1">
            Audit user records, manage role assignments, and review authentication activity ({total} total accounts).
          </p>
        </div>
      </div>

      <Card>
        {/* Search Bar */}
        <div className="mb-4">
          <Input
            icon={Search}
            placeholder="Search accounts by name or email address..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1) }}
          />
        </div>

        {loading ? (
          <TableSkeleton rows={6} cols={6} />
        ) : users.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No Users Match Query"
            description="Try altering your search keywords or clearing filters."
          />
        ) : (
          <div className="overflow-x-auto -mx-5 -mb-5">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-brand-border bg-brand-bg/50">
                  <th className="text-left py-2.5 px-4 font-semibold text-brand-secondary uppercase">Account Name</th>
                  <th className="text-left py-2.5 px-4 font-semibold text-brand-secondary uppercase">Email Address</th>
                  <th className="text-left py-2.5 px-4 font-semibold text-brand-secondary uppercase">Jurisdiction</th>
                  <th className="text-left py-2.5 px-4 font-semibold text-brand-secondary uppercase">Role</th>
                  <th className="text-left py-2.5 px-4 font-semibold text-brand-secondary uppercase">Joined</th>
                  <th className="text-left py-2.5 px-4 font-semibold text-brand-secondary uppercase">Last Active</th>
                  <th className="text-left py-2.5 px-4 font-semibold text-brand-secondary uppercase">Status</th>
                  <th className="py-2.5 px-4" />
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border">
                {users.map((u, i) => (
                  <tr key={u.id || i} className="hover:bg-brand-bg/60 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-brand-forest text-white font-semibold text-xs flex items-center justify-center shrink-0">
                          {u.full_name?.[0]?.toUpperCase() || 'U'}
                        </div>
                        <span className="font-medium text-brand-text">{u.full_name || 'User'}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono text-brand-secondary">{u.email}</td>
                    <td className="py-3 px-4 text-brand-secondary">{u.state || '—'}</td>
                    <td className="py-3 px-4">
                      <Badge variant={u.role?.toLowerCase() === 'admin' ? 'danger' : 'default'} size="sm">
                        {u.role?.toUpperCase()}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 font-mono text-brand-secondary">
                      {u.created_at ? new Date(u.created_at).toLocaleDateString('en-IN') : '—'}
                    </td>
                    <td className="py-3 px-4 font-mono text-brand-secondary">
                      {u.last_login ? new Date(u.last_login).toLocaleDateString('en-IN') : 'Never'}
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant={u.is_active !== false ? 'success' : 'danger'} size="sm">
                        {u.is_active !== false ? 'Active' : 'Suspended'}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Link
                        to={`/admin/users/${u.id}`}
                        className="p-1.5 rounded hover:bg-brand-bg text-brand-secondary hover:text-brand-text inline-flex"
                        title="View Account Details"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  )
}
