'use client'

// Reusable File Upload Component
// Used for insurance cards, legal documents, etc.

import { useState } from 'react'
import { ArrowUpTrayIcon, XMarkIcon, DocumentIcon } from '@heroicons/react/24/outline'

interface FileUploadProps {
  label: string
  name: string
  accept?: string
  required?: boolean
  patientId: string
  fileType: string
  currentFileUrl?: string
  onUploadComplete: (url: string) => void
  helpText?: string
}

export default function FileUpload({
  label,
  name,
  accept = 'image/jpeg,image/jpg,image/png,image/gif,application/pdf',
  required = false,
  patientId,
  fileType,
  currentFileUrl,
  onUploadComplete,
  helpText,
}: FileUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [fileUrl, setFileUrl] = useState(currentFileUrl || '')
  const [fileName, setFileName] = useState('')

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setError('')
    setUploading(true)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('fileType', fileType)
      formData.append('patientId', patientId)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Upload failed')
      }

      setFileUrl(data.url)
      setFileName(data.fileName)
      onUploadComplete(data.url)
    } catch (err: any) {
      console.error('Upload error:', err)
      setError(err.message || 'Failed to upload file')
    } finally {
      setUploading(false)
    }
  }

  const handleRemove = () => {
    setFileUrl('')
    setFileName('')
    onUploadComplete('')
    setError('')
  }

  const isPDF = fileUrl && (fileUrl.includes('application/pdf') || fileName.toLowerCase().endsWith('.pdf'))

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label} {required && '*'}
      </label>

      {!fileUrl ? (
        <div>
          <div className="flex items-center justify-center w-full">
            <label
              htmlFor={name}
              className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors"
            >
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <ArrowUpTrayIcon className="w-10 h-10 mb-3 text-gray-400" />
                <p className="mb-2 text-sm text-gray-500">
                  <span className="font-semibold">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-gray-500">JPG, PNG, GIF or PDF (max 10MB)</p>
              </div>
              <input
                id={name}
                name={name}
                type="file"
                accept={accept}
                required={required && !fileUrl}
                onChange={handleFileChange}
                disabled={uploading}
                className="hidden"
              />
            </label>
          </div>

          {uploading && (
            <div className="mt-2 text-sm text-blue-600 flex items-center gap-2">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Uploading...
            </div>
          )}

          {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
        </div>
      ) : (
        <div className="border-2 border-gray-200 rounded-lg p-4 bg-gray-50">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              {isPDF ? (
                <div className="flex items-center gap-3">
                  <DocumentIcon className="w-12 h-12 text-red-500 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{fileName || 'PDF Document'}</p>
                    <p className="text-xs text-gray-500 mt-1">PDF file uploaded successfully</p>
                  </div>
                </div>
              ) : (
                <div>
                  <img src={fileUrl} alt={label} className="max-h-40 rounded border border-gray-300" />
                  <p className="text-xs text-gray-500 mt-2">{fileName || 'Image uploaded'}</p>
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={handleRemove}
              className="p-1 text-gray-400 hover:text-red-500 transition-colors flex-shrink-0"
              title="Remove file"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {helpText && <p className="mt-1 text-xs text-gray-500">{helpText}</p>}
    </div>
  )
}
