'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { Download, Send, CheckCircle2, Trash2 } from 'lucide-react'
import jsPDF from 'jspdf'
import 'jspdf-autotable'

type Invoice = {
  id: string
  invoice_number: string
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled'
  issue_date: string
  due_date: string
  subtotal: number
  tax_rate: number
  tax_amount: number
  total: number
  notes: string | null
  terms: string | null
  clients?: {
    company_name: string
    address: string | null
    city: string | null
    state: string | null
    gstin: string | null
  }
}

type InvoiceItem = {
  id: string
  description: string
  quantity: number
  unit_price: number
  amount: number
}

const statusColors = {
  draft: 'bg-gray-100 text-gray-800',
  sent: 'bg-blue-100 text-blue-800',
  paid: 'bg-green-100 text-green-800',
  overdue: 'bg-red-100 text-red-800',
  cancelled: 'bg-gray-200 text-gray-600'
}

export default function InvoiceDetailPage() {
  const params = useParams()
  const router = useRouter()
  const invoiceId = params.id as string

  const [invoice, setInvoice] = useState<Invoice | null>(null)
  const [items, setItems] = useState<InvoiceItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchInvoice()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [invoiceId])

  async function fetchInvoice() {
    try {
      setLoading(true)
      
      const { data: invoiceData, error: invoiceError } = await supabase
        .from('invoices')
        .select('*, clients(*)')
        .eq('id', invoiceId)
        .single()

      if (invoiceError) throw invoiceError
      setInvoice(invoiceData)

      const { data: itemsData, error: itemsError } = await supabase
        .from('invoice_items')
        .select('*')
        .eq('invoice_id', invoiceId)
        .order('display_order')

      if (itemsError) throw itemsError
      setItems(itemsData || [])
    } catch (error) {
      console.error('Error fetching invoice:', error)
    } finally {
      setLoading(false)
    }
  }

  async function updateStatus(newStatus: 'sent' | 'paid' | 'cancelled') {
    try {
      const { error } = await supabase
        .from('invoices')
        .update({ status: newStatus })
        .eq('id', invoiceId)

      if (error) throw error
      fetchInvoice()
    } catch (error) {
      console.error('Error updating status:', error)
      alert('Failed to update status')
    }
  }

  async function deleteInvoice() {
    if (!confirm('Are you sure you want to delete this invoice?')) return

    try {
      const { error } = await supabase
        .from('invoices')
        .delete()
        .eq('id', invoiceId)

      if (error) throw error
      router.push('/admin/invoices')
    } catch (error) {
      console.error('Error deleting invoice:', error)
      alert('Failed to delete invoice')
    }
  }

  function generatePDF() {
    if (!invoice) return

    const doc = new jsPDF()

    // Header
    doc.setFontSize(24)
    doc.setFont('helvetica', 'bold')
    doc.text('INVOICE', 20, 20)

    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text('PS Media', 20, 30)
    doc.text('Professional Services', 20, 35)
    doc.text('Bangalore, India', 20, 40)

    // Invoice Details (Right side)
    doc.setFontSize(10)
    doc.text(`Invoice #: ${invoice.invoice_number}`, 140, 20)
    doc.text(`Issue Date: ${new Date(invoice.issue_date).toLocaleDateString('en-IN')}`, 140, 25)
    doc.text(`Due Date: ${new Date(invoice.due_date).toLocaleDateString('en-IN')}`, 140, 30)
    doc.text(`Status: ${invoice.status.toUpperCase()}`, 140, 35)

    // Bill To
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.text('Bill To:', 20, 55)
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text(invoice.clients?.company_name || '', 20, 62)
    if (invoice.clients?.address) {
      doc.text(invoice.clients.address, 20, 67)
    }
    if (invoice.clients?.city || invoice.clients?.state) {
      doc.text(`${invoice.clients?.city || ''}, ${invoice.clients?.state || ''}`, 20, 72)
    }
    if (invoice.clients?.gstin) {
      doc.text(`GSTIN: ${invoice.clients.gstin}`, 20, 77)
    }

    // Table
    const tableData = items.map(item => [
      item.description,
      item.quantity.toString(),
      `₹${item.unit_price.toFixed(2)}`,
      `₹${item.amount.toFixed(2)}`
    ])

    // Using autoTable from jspdf-autotable
    ;(doc as any).autoTable({
      startY: 90,
      head: [['Description', 'Quantity', 'Unit Price', 'Amount']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [147, 51, 234] },
      styles: { fontSize: 10 }
    })

    // Get final Y position after table
    const finalY = (doc as any).lastAutoTable.finalY + 10

    // Totals
    const totalsX = 140
    doc.text(`Subtotal:`, totalsX, finalY)
    doc.text(`₹${invoice.subtotal.toFixed(2)}`, 185, finalY, { align: 'right' })
    
    doc.text(`GST (${invoice.tax_rate}%):`, totalsX, finalY + 6)
    doc.text(`₹${invoice.tax_amount.toFixed(2)}`, 185, finalY + 6, { align: 'right' })
    
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(12)
    doc.text(`Total:`, totalsX, finalY + 14)
    doc.text(`₹${invoice.total.toFixed(2)}`, 185, finalY + 14, { align: 'right' })

    // Notes
    if (invoice.notes) {
      doc.setFontSize(10)
      doc.setFont('helvetica', 'normal')
      doc.text('Notes:', 20, finalY + 30)
      doc.text(invoice.notes, 20, finalY + 36, { maxWidth: 170 })
    }

    // Terms
    if (invoice.terms) {
      doc.setFontSize(9)
      doc.setFont('helvetica', 'italic')
      const termsY = invoice.notes ? finalY + 50 : finalY + 30
      doc.text('Terms & Conditions:', 20, termsY)
      doc.text(invoice.terms, 20, termsY + 5, { maxWidth: 170 })
    }

    // Download
    doc.save(`${invoice.invoice_number}.pdf`)
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  if (!invoice) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Invoice not found</h2>
          <Link href="/admin/invoices" className="text-purple-600 hover:text-purple-700 mt-4 inline-block">
            ← Back to Invoices
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/admin/invoices"
          className="text-sm text-purple-600 hover:text-purple-700 mb-4 inline-block"
        >
          ← Back to Invoices
        </Link>
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{invoice.invoice_number}</h1>
            <span className={`mt-2 inline-block px-3 py-1 rounded-full text-sm font-medium ${statusColors[invoice.status]}`}>
              {invoice.status}
            </span>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={generatePDF}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
            >
              <Download className="h-4 w-4 mr-2" />
              PDF
            </button>
            {invoice.status === 'draft' && (
              <button
                onClick={() => updateStatus('sent')}
                className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 text-sm"
              >
                <Send className="h-4 w-4 mr-2" />
                Mark Sent
              </button>
            )}
            {(invoice.status === 'sent' || invoice.status === 'overdue') && (
              <button
                onClick={() => updateStatus('paid')}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm"
              >
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Mark Paid
              </button>
            )}
            <Link
              href={`/admin/invoices/${invoiceId}/edit`}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Edit
            </Link>
            <button
              onClick={deleteInvoice}
              className="p-2 border border-red-300 rounded-md text-red-600 hover:bg-red-50"
            >
              <Trash2 className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Invoice Content */}
      <div className="bg-white shadow rounded-lg p-8">
        {/* Dates */}
        <div className="grid grid-cols-2 gap-6 mb-8">
          <div>
            <p className="text-sm font-medium text-gray-500">Issue Date</p>
            <p className="mt-1 text-sm text-gray-900">
              {new Date(invoice.issue_date).toLocaleDateString('en-IN', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Due Date</p>
            <p className="mt-1 text-sm text-gray-900">
              {new Date(invoice.due_date).toLocaleDateString('en-IN', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>
        </div>

        {/* Bill To */}
        <div className="mb-8">
          <p className="text-sm font-medium text-gray-500 mb-2">Bill To</p>
          <div className="text-sm text-gray-900">
            <p className="font-medium">{invoice.clients?.company_name}</p>
            {invoice.clients?.address && <p>{invoice.clients.address}</p>}
            {(invoice.clients?.city || invoice.clients?.state) && (
              <p>{[invoice.clients?.city, invoice.clients?.state].filter(Boolean).join(', ')}</p>
            )}
            {invoice.clients?.gstin && <p>GSTIN: {invoice.clients.gstin}</p>}
          </div>
        </div>

        {/* Items Table */}
        <div className="mb-8">
          <table className="min-w-full">
            <thead className="border-b-2 border-gray-300">
              <tr>
                <th className="pb-2 text-left text-sm font-semibold text-gray-900">Description</th>
                <th className="pb-2 text-right text-sm font-semibold text-gray-900">Qty</th>
                <th className="pb-2 text-right text-sm font-semibold text-gray-900">Unit Price</th>
                <th className="pb-2 text-right text-sm font-semibold text-gray-900">Amount</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-b border-gray-200">
                  <td className="py-3 text-sm text-gray-900">{item.description}</td>
                  <td className="py-3 text-sm text-gray-900 text-right">{item.quantity}</td>
                  <td className="py-3 text-sm text-gray-900 text-right">₹{item.unit_price.toFixed(2)}</td>
                  <td className="py-3 text-sm text-gray-900 text-right">₹{item.amount.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="flex justify-end">
          <div className="w-64 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Subtotal:</span>
              <span className="font-medium">₹{invoice.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">GST ({invoice.tax_rate}%):</span>
              <span className="font-medium">₹{invoice.tax_amount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-lg font-bold border-t-2 border-gray-300 pt-2">
              <span>Total:</span>
              <span className="text-purple-600">₹{invoice.total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Notes & Terms */}
        {(invoice.notes || invoice.terms) && (
          <div className="mt-8 pt-8 border-t border-gray-200 space-y-4">
            {invoice.notes && (
              <div>
                <p className="text-sm font-medium text-gray-900 mb-2">Notes</p>
                <p className="text-sm text-gray-600 whitespace-pre-wrap">{invoice.notes}</p>
              </div>
            )}
            {invoice.terms && (
              <div>
                <p className="text-sm font-medium text-gray-900 mb-2">Terms & Conditions</p>
                <p className="text-sm text-gray-600 whitespace-pre-wrap">{invoice.terms}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
