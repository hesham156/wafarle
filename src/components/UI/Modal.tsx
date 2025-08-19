'use client'

import { useEffect } from 'react'
import { FiX, FiAlertTriangle, FiCheckCircle, FiInfo, FiTrash2 } from 'react-icons/fi'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  message: string
  type?: 'success' | 'error' | 'warning' | 'info' | 'confirm'
  onConfirm?: () => void
  confirmText?: string
  cancelText?: string
  showCloseButton?: boolean
}

export default function Modal({
  isOpen,
  onClose,
  title,
  message,
  type = 'info',
  onConfirm,
  confirmText = 'تأكيد',
  cancelText = 'إلغاء',
  showCloseButton = true
}: ModalProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <FiCheckCircle className="w-8 h-8 text-green-500" />
      case 'error':
        return <FiAlertTriangle className="w-8 h-8 text-red-500" />
      case 'warning':
        return <FiAlertTriangle className="w-8 h-8 text-yellow-500" />
      case 'confirm':
        return <FiTrash2 className="w-8 h-8 text-red-500" />
      default:
        return <FiInfo className="w-8 h-8 text-blue-500" />
    }
  }

  const getIconBgColor = () => {
    switch (type) {
      case 'success':
        return 'bg-green-100'
      case 'error':
        return 'bg-red-100'
      case 'warning':
        return 'bg-yellow-100'
      case 'confirm':
        return 'bg-red-100'
      default:
        return 'bg-blue-100'
    }
  }

  const getButtonColors = () => {
    switch (type) {
      case 'success':
        return 'bg-green-600 hover:bg-green-700'
      case 'error':
        return 'bg-red-600 hover:bg-red-700'
      case 'warning':
        return 'bg-yellow-600 hover:bg-yellow-700'
      case 'confirm':
        return 'bg-red-600 hover:bg-red-700'
      default:
        return 'bg-blue-600 hover:bg-blue-700'
    }
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/20 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-md transform overflow-hidden rounded-2xl bg-white shadow-2xl transition-all">
          {/* Header */}
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-full ${getIconBgColor()}`}>
                  {getIcon()}
                </div>
                <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
              </div>
              {showCloseButton && (
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-200"
                >
                  <FiX className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="px-6 py-6">
            <p className="text-gray-700 leading-relaxed">{message}</p>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
            <div className="flex gap-3 justify-end">
              {type === 'confirm' && (
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  {cancelText}
                </button>
              )}
              <button
                onClick={type === 'confirm' ? onConfirm : onClose}
                className={`px-6 py-2 text-white rounded-lg transition-colors font-medium ${getButtonColors()}`}
              >
                {type === 'confirm' ? confirmText : 'حسناً'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
