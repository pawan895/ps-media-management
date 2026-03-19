'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { FolderKanban, FileText, Receipt, TrendingUp } from 'lucide-react'

type Stats = {
  activeProjects: number
  totalInvoices: number
  paidInvoices: number
  pendingAmount: number
  totalReceipts: number
}

export default function ClientDashboard() {
  const [stats, setStats] = useState<Stats>({
    activeProjects: 0,
    totalInvoices: 0,
    paidInvoices: 0,
    pendingAmount: 0,
    totalReceipts: 0
  })
  const [loading, setLoading] = useState(true)
  const [clientId, setClientId] = useState<string | null>(null)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  async function fetchDashboardData() {
    try {
      setLoading(true)
      
      // Get current user and their client ID
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Get client_id from contacts table
      const { data: contact } = await supabase
        .from('contacts')
        .select('client_id')
        .eq('user_id', user.id)
        .single()

      if (!contact) return
      setClientId(contact.client_id)

      // Fetch projects
      const { data: projects } = await supabase
        .from('projects')
        .select('id, status')
        .eq('client_id', contact.client_id)

      // Fetch invoices
      const { data: invoices } = await supabase
        .from('invoices')
        .select('status, total')
        .eq('client_id', contact.client_id)

      // Fetch receipts
      const { data: receipts } = await supabase
        .from('receipts')
        .select('id')
        .eq('client_id', contact.client_id)

      const activeProjects = projects?.filter(p => p.status === 'active').length || 0
      const totalInvoices = invoices?.length || 0
      const paidInvoices = invoices?.filter(i => i.status === 'paid').length || 0
      const pendingAmount = invoices
        ?.filter(i => ['sent', 'overdue'].includes(i.status))
        .reduce((sum, i) => sum + Number(i.total), 0) || 0

      setStats({
        activeProjects,
        totalInvoices,
        paidInvoices,
        pendingAmount,
        totalReceipts: receipts?.length || 0
      })
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-sm text-gray-700">
          Welcome to your client portal
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <FolderKanban className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Active Projects</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.activeProjects}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <FileText className="h-8 w-8 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Invoices</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.totalInvoices}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <TrendingUp className="h-8 w-8 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Pending Amount</p>
              <p className="text-2xl font-semibold text-gray-900">
                ₹{stats.pendingAmount.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Receipt className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Receipts</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.totalReceipts}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          href="/client/projects"
          className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow"
        >
          <FolderKanban className="h-8 w-8 text-blue-600 mb-3" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">View Projects</h3>
          <p className="text-sm text-gray-600">
            Track progress and milestones of your projects
          </p>
        </Link>

        <Link
          href="/client/invoices"
          className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow"
        >
          <FileText className="h-8 w-8 text-purple-600 mb-3" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">View Invoices</h3>
          <p className="text-sm text-gray-600">
            Check your invoices and payment status
          </p>
        </Link>

        <Link
          href="/client/receipts"
          className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow"
        >
          <Receipt className="h-8 w-8 text-green-600 mb-3" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">View Receipts</h3>
          <p className="text-sm text-gray-600">
            Access your payment receipts and confirmations
          </p>
        </Link>
      </div>
    </div>
  )
}
