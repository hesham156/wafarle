'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { FiUsers, FiPackage, FiShoppingCart, FiDollarSign } from 'react-icons/fi'

interface Stats {
  totalUsers: number
  totalProducts: number
  totalOrders: number
  totalRevenue: number
}

export default function DashboardStats() {
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      setLoading(true)
      
      // إحصائيات المستخدمين
      const { count: usersCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })

      // إحصائيات المنتجات
      const { count: productsCount } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })

      // إحصائيات الطلبات (افتراضية حتى يتم إنشاء جدول الطلبات)
      const ordersCount = 0
      const totalRevenue = 0

      setStats({
        totalUsers: usersCount || 0,
        totalProducts: productsCount || 0,
        totalOrders: ordersCount,
        totalRevenue: totalRevenue
      })
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-xl shadow-lg p-6 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          </div>
        ))}
      </div>
    )
  }

  const statCards = [
    {
      title: 'إجمالي المستخدمين',
      value: stats.totalUsers.toLocaleString('ar-SA'),
      icon: FiUsers,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'إجمالي المنتجات',
      value: stats.totalProducts.toLocaleString('ar-SA'),
      icon: FiPackage,
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'إجمالي الطلبات',
      value: stats.totalOrders.toLocaleString('ar-SA'),
      icon: FiShoppingCart,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      title: 'إجمالي الإيرادات',
      value: `${stats.totalRevenue.toLocaleString('ar-SA')} ريال`,
      icon: FiDollarSign,
      color: 'from-orange-500 to-orange-600',
      bgColor: 'bg-orange-50'
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statCards.map((stat, index) => {
        const Icon = stat.icon
        return (
          <div key={index} className={`${stat.bgColor} rounded-xl shadow-lg p-6`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">
                  {stat.title}
                </p>
                <p className="text-2xl font-bold text-gray-800">
                  {stat.value}
                </p>
              </div>
              <div className={`w-12 h-12 bg-gradient-to-r ${stat.color} rounded-lg flex items-center justify-center`}>
                <Icon className="text-white text-xl" />
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
