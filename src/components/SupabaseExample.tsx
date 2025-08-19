'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export default function SupabaseExample() {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [tableName, setTableName] = useState('')
  const [message, setMessage] = useState('')

  async function fetchData() {
    if (!tableName.trim()) {
      setMessage('يرجى إدخال اسم الجدول')
      return
    }

    try {
      setLoading(true)
      setError(null)
      setMessage('')
      
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .limit(20)

      if (error) throw error
      
      setData(data || [])
      setMessage(`تم جلب ${data?.length || 0} صف من جدول ${tableName}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'حدث خطأ ما')
      setData([])
    } finally {
      setLoading(false)
    }
  }

  async function testConnection() {
    try {
      setLoading(true)
      setError(null)
      setMessage('')
      
      // اختبار الاتصال
      const { data, error } = await supabase
        .from('_dummy_test_')
        .select('*')
        .limit(1)

      if (error && error.code === '42P01') {
        // جدول غير موجود - هذا يعني أن الاتصال يعمل
        setMessage('✅ الاتصال بـ Supabase يعمل بنجاح!')
      } else if (error) {
        throw error
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'حدث خطأ في الاتصال')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg border">
      <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">اختبار Supabase</h2>
      
      {/* اختبار الاتصال */}
      <div className="mb-6">
        <button
          onClick={testConnection}
          disabled={loading}
          className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white font-medium py-2 px-4 rounded-lg transition-colors"
        >
          {loading ? 'جاري الاختبار...' : 'اختبار الاتصال'}
        </button>
      </div>

      {/* إدخال اسم الجدول */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          اسم الجدول:
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={tableName}
            onChange={(e) => setTableName(e.target.value)}
            placeholder="أدخل اسم الجدول (مثال: users)"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={fetchData}
            disabled={loading || !tableName.trim()}
            className="bg-green-500 hover:bg-green-600 disabled:bg-green-300 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            {loading ? 'جاري...' : 'جلب البيانات'}
          </button>
        </div>
      </div>

      {/* الرسائل */}
      {message && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-blue-800">
          {message}
        </div>
      )}

      {/* رسائل الخطأ */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-800">
          <strong>خطأ:</strong> {error}
        </div>
      )}

      {/* عرض البيانات */}
      {data.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-gray-800">
            البيانات من جدول {tableName}:
          </h3>
          {data.map((item, index) => (
            <div key={index} className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
              <pre className="text-sm text-gray-700 overflow-x-auto">
                {JSON.stringify(item, null, 2)}
              </pre>
            </div>
          ))}
        </div>
      )}

      {/* تعليمات */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-semibold text-gray-800 mb-2">تعليمات:</h4>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• اضغط "اختبار الاتصال" للتأكد من عمل Supabase</li>
          <li>• أدخل اسم الجدول الذي تريد استعلامه</li>
          <li>• اضغط "جلب البيانات" لعرض محتويات الجدول</li>
          <li>• تأكد من إنشاء الجداول في لوحة تحكم Supabase أولاً</li>
        </ul>
      </div>
    </div>
  )
}
