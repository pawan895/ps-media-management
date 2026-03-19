'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

type Project = {
  id: string
  name: string
  description: string | null
  status: string
  progress: number
  start_date: string | null
  end_date: string | null
  budget: number | null
}

const statusColors = {
  planning: 'bg-blue-100 text-blue-800',
  active: 'bg-green-100 text-green-800',
  'on-hold': 'bg-yellow-100 text-yellow-800',
  completed: 'bg-gray-100 text-gray-800',
  cancelled: 'bg-red-100 text-red-800'
}

export default function ClientProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProjects()
  }, [])

  async function fetchProjects() {
    try {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: contact } = await supabase
        .from('contacts')
        .select('client_id')
        .eq('user_id', user.id)
        .single()

      if (!contact) return

      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('client_id', contact.client_id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setProjects(data || [])
    } catch (error) {
      console.error('Error fetching projects:', error)
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
      <h1 className="text-3xl font-bold text-gray-900 mb-8">My Projects</h1>

      {projects.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <p className="text-gray-500">No projects yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {projects.map((project) => (
            <div key={project.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-semibold text-gray-900">{project.name}</h3>
                <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                  statusColors[project.status as keyof typeof statusColors]
                }`}>
                  {project.status}
                </span>
              </div>

              {project.description && (
                <p className="text-sm text-gray-600 mb-4">{project.description}</p>
              )}

              <div className="mb-4">
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>Progress</span>
                  <span className="font-medium">{project.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-purple-600 h-2 rounded-full transition-all"
                    style={{ width: `${project.progress}%` }}
                  />
                </div>
              </div>

              {(project.start_date || project.budget) && (
                <div className="text-sm text-gray-600 space-y-1">
                  {project.start_date && (
                    <p>
                      <span className="font-medium">Timeline: </span>
                      {new Date(project.start_date).toLocaleDateString('en-IN')}
                      {project.end_date && ` - ${new Date(project.end_date).toLocaleDateString('en-IN')}`}
                    </p>
                  )}
                  {project.budget && (
                    <p>
                      <span className="font-medium">Budget: </span>
                      ₹{Number(project.budget).toLocaleString()}
                    </p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
