'use client'

// Reusable File Upload Component
// Handles drag-and-drop uploads to Google Cloud Storage
// Used for insurance cards, legal documents, ID uploads, etc.

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
  accept = '.jpg,.jpeg,.png,.gif,.pdf',
  required = false,
  patientId,
  fileType,
  currentFileUrl,
  onUploadComplete,
  helpText,
}: FileUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [fileUrl, setFileUrl] = useState(currentFileUrl || '')
  const [fileName, setFileName] = useState('')
  const [error, setError] = useState('')
  const [isDragging, setIsDragging] = useState(false)

  const handleFileChange = async (file: File | null) => {
    if (!file) return

    // Reset error
    setError('')

    // Validate file type
    const allowedExtensions = accept.split(',').map((ext) => ext.trim())
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase()

    if (!allowedExtensions.includes(fileExtension)) {
      setError(`Invalid file type. Allowed types: ${accept}`)
      return
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024
    if (file.size > maxSize) {
      setError('File too large. Maximum size is 10MB.')
      return
    }

    // Upload file
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
      setFileName(file.name)
      onUploadComplete(data.url)
    } catch (err) {
      console.error('Upload error:', err)
      setError(err instanceof Error ? err.message : 'Upload failed. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileChange(file)
    }
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)

    const file = e.dataTransfer.files?.[0]
    if (file) {
      handleFileChange(file)
    }
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleRemove = () => {
    setFileUrl('')
    setFileName('')
    setError('')
    onUploadComplete('')
  }

  const isImage = fileUrl && (fileUrl.match(/\.(jpg|jpeg|png|gif)(\?|$)/i) || fileUrl.startsWith('data:image/'))
  const isPDF = fileUrl && (fileUrl.match(/\.pdf(\?|$)/i) || fileUrl.startsWith('data:application/pdf'))

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>

      {helpText && <p className="text-xs text-gray-500 mb-2">{helpText}</p>}

      {!fileUrl ? (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`relative border-2 border-dashed rounded-lg p-6 text-center ${
            isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
          } ${uploading ? 'opacity-50 cursor-wait' : 'cursor-pointer'}`}
        >
          <input
            type="file"
            name={name}
            required={required}
            accept={accept}
            onChange={handleInputChange}
            disabled={uploading}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />

          <ArrowUpTrayIcon className="mx-auto h-12 w-12 text-gray-400" />

          {uploading ? (
            <p className="mt-2 text-sm text-gray-600">Uploading...</p>
          ) : (
            <>
              <p className="mt-2 text-sm text-gray-600">
                <span className="font-semibold text-blue-600">Click to upload</span> or drag and drop
              </p>
              <p className="text-xs text-gray-500 mt-1">{accept.toUpperCase()} (max 10MB)</p>
            </>
          )}
        </div>
      ) : (
        <div className="border border-green-300 bg-green-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {isImage && (
                <img
                  src={fileUrl}
                  alt="Uploaded file"
                  className="h-16 w-auto rounded border border-gray-300"
                />
              )}

              {isPDF && <DocumentIcon className="h-8 w-8 text-red-600" />}

              <div>
                <p className="text-sm font-medium text-green-900">File uploaded successfully</p>
                {fileName && <p className="text-xs text-green-700 mt-1">{fileName}</p>}

                {isPDF && (
                  <a
                    href={fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-600 hover:text-blue-700 underline mt-1 inline-block"
                  >
                    Open PDF in new tab
                  </a>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={handleRemove}
              className="flex-shrink-0 text-red-600 hover:text-red-700"
              title="Remove file"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}

      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  )
}
