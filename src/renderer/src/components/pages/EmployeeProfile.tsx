import React from 'react'
import { useParams } from 'react-router-dom'

export function EmployeeProfile() {
  const { id } = useParams<{ id: string }>()
  
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">ملف الموظف #{id}</h1>
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <p className="text-gray-500">جاري العمل على صفحة ملف الموظف...</p>
        </div>
      </div>
    </div>
  )
}
