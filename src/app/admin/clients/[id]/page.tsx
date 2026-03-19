'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

type Client = {
  id: string
  company_name: string
  status: 'lead' | 'prospect' | 'active' | 'inactive' | 'churned'
  industry: string | null
  website: string | null
  address: string | null
  city: string | null
  state: string | null
  country: string | null
  postal_code: string | null
  gstin: string | null
  pan: string | null
  notes: string | null
  created_at: string
}

type Contact = {
  id: string
  name: string
  email: string
  phone: string | null
  designation: string | null
  is_primary: boolean
  created_at: string
}

const statusColors = {
  lead: 'bg-gray-100 text-gray-800',
  prospect: 'bg-blue-100 text-blue-800',
  active: 'bg-green-100 text-green-800',
  inactive: 'bg-yellow-100 text-yellow-800',
  churned: 'bg-red-100 text-red-800'
}

export default function ClientDetailPage() {
  const params = useParams()
  const router = useRouter()
  const clientId = params.id as string

  const [client, setClient] = useState<Client | null>(null)
  const [contacts, setContacts] = useState<Contact[]>([])
  const [loading, setLoading] = useState(true)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showContactForm, setShowContactForm] = useState(false)
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    phone: '',
    designation: '',
    is_primary: false
  })

  useEffect(() => {
    fetchClientData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clientId])

  async function fetchClientData() {
    try {
      setLoading(true)
      
      // Fetch client
      const { data: clientData, error: clientError } = await supabase
        .from('clients')
        .select('*')
        .eq('id', clientId)
        .single()

      if (clientError) throw clientError
      setClient(clientData)

      // Fetch contacts
      const { data: contactsData, error: contactsError } = await supabase
        .from('contacts')
        .select('*')
        .eq('client_id', clientId)
        .order('is_primary', { ascending: false })
        .order('created_at', { ascending: false })

      if (contactsError) throw contactsError
      setContacts(contactsData || [])
    } catch (error) {
      console.error('Error fetching client:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleDeleteClient() {
    try {
      const { error } = await supabase
        .from('clients')
        .delete()
        .eq('id', clientId)

      if (error) throw error
      router.push('/admin/clients')
    } catch (error) {
      console.error('Error deleting client:', error)
      alert('Failed to delete client')
    }
  }

  async function handleAddContact(e: React.FormEvent) {
    e.preventDefault()
    try {
      const { error } = await supabase
        .from('contacts')
        .insert([{
          client_id: clientId,
          ...contactForm
        }])

      if (error) throw error

      setShowContactForm(false)
      setContactForm({ name: '', email: '', phone: '', designation: '', is_primary: false })
      fetchClientData()
    } catch (error) {
      console.error('Error adding contact:', error)
      alert('Failed to add contact')
    }
  }

  async function handleDeleteContact(contactId: string) {
    if (!confirm('Are you sure you want to delete this contact?')) return

    try {
      const { error } = await supabase
        .from('contacts')
        .delete()
        .eq('id', contactId)

      if (error) throw error
      fetchClientData()
    } catch (error) {
      console.error('Error deleting contact:', error)
      alert('Failed to delete contact')
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  if (!client) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Client not found</h2>
          <Link href="/admin/clients" className="text-purple-600 hover:text-purple-700 mt-4 inline-block">
            ← Back to Clients
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/admin/clients"
          className="text-sm text-purple-600 hover:text-purple-700 mb-4 inline-block"
        >
          ← Back to Clients
        </Link>
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{client.company_name}</h1>
            <div className="mt-2 flex items-center space-x-4">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[client.status]}`}>
                {client.status}
              </span>
              {client.industry && (
                <span className="text-sm text-gray-500">Industry: {client.industry}</span>
              )}
            </div>
          </div>
          <div className="flex space-x-3">
            <Link
              href={`/admin/clients/${clientId}/edit`}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Edit
            </Link>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="px-4 py-2 border border-red-300 rounded-md shadow-sm text-sm font-medium text-red-700 bg-white hover:bg-red-50"
            >
              Delete
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Company Details */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Company Details</h2>
            <dl className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
              {client.website && (
                <>
                  <dt className="text-sm font-medium text-gray-500">Website</dt>
                  <dd className="text-sm text-gray-900">
                    <a href={client.website} target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:text-purple-700">
                      {client.website}
                    </a>
                  </dd>
                </>
              )}
              {client.address && (
                <>
                  <dt className="text-sm font-medium text-gray-500">Address</dt>
                  <dd className="text-sm text-gray-900">
                    {client.address}
                    {(client.city || client.state || client.postal_code) && (
                      <><br />{[client.city, client.state, client.postal_code].filter(Boolean).join(', ')}</>
                    )}
                    {client.country && <><br />{client.country}</>}
                  </dd>
                </>
              )}
              {client.gstin && (
                <>
                  <dt className="text-sm font-medium text-gray-500">GSTIN</dt>
                  <dd className="text-sm text-gray-900">{client.gstin}</dd>
                </>
              )}
              {client.pan && (
                <>
                  <dt className="text-sm font-medium text-gray-500">PAN</dt>
                  <dd className="text-sm text-gray-900">{client.pan}</dd>
                </>
              )}
            </dl>
            {client.notes && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Notes</h3>
                <p className="text-sm text-gray-900 whitespace-pre-wrap">{client.notes}</p>
              </div>
            )}
          </div>

          {/* Contacts */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium text-gray-900">Contacts</h2>
              <button
                onClick={() => setShowContactForm(true)}
                className="px-3 py-1 text-sm bg-purple-600 text-white rounded hover:bg-purple-700"
              >
                + Add Contact
              </button>
            </div>

            {showContactForm && (
              <form onSubmit={handleAddContact} className="mb-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
                <h3 className="text-sm font-medium text-gray-900 mb-3">New Contact</h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <input
                    type="text"
                    placeholder="Name *"
                    required
                    value={contactForm.name}
                    onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                    className="px-3 py-2 border border-gray-300 rounded-md"
                  />
                  <input
                    type="email"
                    placeholder="Email *"
                    required
                    value={contactForm.email}
                    onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                    className="px-3 py-2 border border-gray-300 rounded-md"
                  />
                  <input
                    type="tel"
                    placeholder="Phone"
                    value={contactForm.phone}
                    onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                    className="px-3 py-2 border border-gray-300 rounded-md"
                  />
                  <input
                    type="text"
                    placeholder="Designation"
                    value={contactForm.designation}
                    onChange={(e) => setContactForm({ ...contactForm, designation: e.target.value })}
                    className="px-3 py-2 border border-gray-300 rounded-md"
                  />
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={contactForm.is_primary}
                      onChange={(e) => setContactForm({ ...contactForm, is_primary: e.target.checked })}
                      className="rounded border-gray-300"
                    />
                    <span className="text-sm text-gray-700">Primary Contact</span>
                  </label>
                </div>
                <div className="mt-3 flex space-x-2">
                  <button type="submit" className="px-3 py-1 bg-purple-600 text-white text-sm rounded hover:bg-purple-700">
                    Add
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowContactForm(false)}
                    className="px-3 py-1 bg-gray-200 text-gray-700 text-sm rounded hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

            {contacts.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-8">No contacts added yet.</p>
            ) : (
              <div className="space-y-3">
                {contacts.map((contact) => (
                  <div key={contact.id} className="flex justify-between items-start p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="text-sm font-medium text-gray-900">{contact.name}</h3>
                        {contact.is_primary && (
                          <span className="px-2 py-0.5 text-xs bg-purple-100 text-purple-800 rounded">Primary</span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">{contact.email}</p>
                      {contact.phone && <p className="text-sm text-gray-600">{contact.phone}</p>}
                      {contact.designation && <p className="text-xs text-gray-500">{contact.designation}</p>}
                    </div>
                    <button
                      onClick={() => handleDeleteContact(contact.id)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Stats */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Quick Stats</h2>
            <div className="space-y-3">
              <div>
                <div className="text-sm text-gray-500">Contacts</div>
                <div className="text-2xl font-semibold text-gray-900">{contacts.length}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Projects</div>
                <div className="text-2xl font-semibold text-gray-900">0</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Invoices</div>
                <div className="text-2xl font-semibold text-gray-900">0</div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h2>
            <div className="space-y-2">
              <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded">
                Create Project
              </button>
              <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded">
                Create Invoice
              </button>
              <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded">
                Schedule Meeting
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Delete Client</h3>
            <p className="text-sm text-gray-500 mb-6">
              Are you sure you want to delete this client? This action cannot be undone and will also delete all associated projects, invoices, and contacts.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteClient}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
