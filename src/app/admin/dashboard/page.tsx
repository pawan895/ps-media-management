'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { 
  Users, 
  FolderKanban, 
  FileText, 
  TrendingUp,
  DollarSign,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react'

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalClients: 0,
    activeProjects: 0,
    totalInvoices: 0,
    pendingInvoices: 0,
    totalRevenue: 0,
    thisMonthRevenue: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      // Get client count
      const { count: clientCount } = await supabase
        .from('clients')
        .select('*', { count: 'exact', head: true })

      // Get active projects
      const { count: projectCount } = await supabase
        .from('projects')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active')

      // Get invoice stats
      const { count: invoiceCount } = await supabase
        .from('invoices')
        .select('*', { count: 'exact', head: true })

      const { count: pendingCount } = await supabase
        .from('invoices')
        .select('*', { count: 'exact', head: true })
        .in('status', ['draft', 'sent'])

      // Get revenue
      const { data: invoices } = await supabase
        .from('invoices')
        .select('total, paid_at')
        .eq('status', 'paid')

      const totalRevenue = invoices?.reduce((sum, inv) => sum + (inv.total || 0), 0) || 0
      
      const thisMonth = new Date()
      thisMonth.setDate(1)
      const thisMonthRevenue = invoices?.filter(inv => 
        inv.paid_at && new Date(inv.paid_at) >= thisMonth
      ).reduce((sum, inv) => sum + (inv.total || 0), 0) || 0

      setStats({
        totalClients: clientCount || 0,
        activeProjects: projectCount || 0,
        totalInvoices: invoiceCount || 0,
        pendingInvoices: pendingCount || 0,
        totalRevenue,
        thisMonthRevenue
      })
    } catch (error) {
      console.error('Failed to load stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const statCards = [
    {
      name: 'Total Clients',
      value: stats.totalClients,
      icon: Users,
      color: 'blue',
      bgColor: 'bg-blue-500/10',
      iconColor: 'text-blue-400'
    },
    {
      name: 'Active Projects',
      value: stats.activeProjects,
      icon: FolderKanban,
      color: 'purple',
      bgColor: 'bg-purple-500/10',
      iconColor: 'text-purple-400'
    },
    {
      name: 'Total Invoices',
      value: stats.totalInvoices,
      icon: FileText,
      color: 'green',
      bgColor: 'bg-green-500/10',
      iconColor: 'text-green-400'
    },
    {
      name: 'Pending Invoices',
      value: stats.pendingInvoices,
      icon: Clock,
      color: 'yellow',
      bgColor: 'bg-yellow-500/10',
      iconColor: 'text-yellow-400'
    }
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-400">Loading dashboard...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => (
          <div
            key={stat.name}
            className="bg-slate-800 border border-slate-700 rounded-xl p-6 hover:border-slate-600 transition"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm font-medium">{stat.name}</p>
                <p className="text-3xl font-bold text-white mt-2">{stat.value}</p>
              </div>
              <div className={`w-12 h-12 ${stat.bgColor} rounded-lg flex items-center justify-center`}>
                <stat.icon className={`w-6 h-6 ${stat.iconColor}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Revenue Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-semibold">Total Revenue</h3>
            <DollarSign className="w-5 h-5 text-green-400" />
          </div>
          <p className="text-3xl font-bold text-white">
            ₹{stats.totalRevenue.toLocaleString('en-IN')}
          </p>
          <p className="text-slate-400 text-sm mt-2">All time earnings</p>
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-semibold">This Month</h3>
            <TrendingUp className="w-5 h-5 text-blue-400" />
          </div>
          <p className="text-3xl font-bold text-white">
            ₹{stats.thisMonthRevenue.toLocaleString('en-IN')}
          </p>
          <p className="text-slate-400 text-sm mt-2">Current month revenue</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
        <h3 className="text-white font-semibold mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <a
            href="/admin/clients?action=new"
            className="flex flex-col items-center justify-center p-4 bg-slate-700 hover:bg-slate-600 rounded-lg transition text-center"
          >
            <Users className="w-8 h-8 text-blue-400 mb-2" />
            <span className="text-white text-sm font-medium">New Client</span>
          </a>
          <a
            href="/admin/projects?action=new"
            className="flex flex-col items-center justify-center p-4 bg-slate-700 hover:bg-slate-600 rounded-lg transition text-center"
          >
            <FolderKanban className="w-8 h-8 text-purple-400 mb-2" />
            <span className="text-white text-sm font-medium">New Project</span>
          </a>
          <a
            href="/admin/invoices?action=new"
            className="flex flex-col items-center justify-center p-4 bg-slate-700 hover:bg-slate-600 rounded-lg transition text-center"
          >
            <FileText className="w-8 h-8 text-green-400 mb-2" />
            <span className="text-white text-sm font-medium">Create Invoice</span>
          </a>
          <a
            href="/admin/meetings?action=new"
            className="flex flex-col items-center justify-center p-4 bg-slate-700 hover:bg-slate-600 rounded-lg transition text-center"
          >
            <Clock className="w-8 h-8 text-yellow-400 mb-2" />
            <span className="text-white text-sm font-medium">Schedule Meeting</span>
          </a>
        </div>
      </div>

      {/* Recent Activity Placeholder */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
        <h3 className="text-white font-semibold mb-4">Recent Activity</h3>
        <div className="text-slate-400 text-center py-8">
          No recent activity to display
        </div>
      </div>
    </div>
  )
}
