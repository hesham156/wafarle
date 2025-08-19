import Image from "next/image";
import SupabaseExample from "@/components/SupabaseExample";
import Link from "next/link";
import Layout from "@/components/Layout/Layout";

export default function Home() {
  return (
    <Layout>
      <div className="font-sans min-h-screen">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 py-12 sm:py-16 lg:py-20">
          <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 text-center">
            <div className="flex items-center justify-center gap-2 sm:gap-3 mb-6 sm:mb-8">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
                <span className="text-white text-3xl sm:text-4xl font-bold">W</span>
              </div>
            </div>
            
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-800 mb-4 sm:mb-6">
              مرحباً بك في{" "}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                وفرلي
              </span>
            </h1>
            
            <p className="text-lg sm:text-xl text-gray-600 mb-6 sm:mb-8 max-w-3xl mx-auto leading-relaxed px-4">
              متجر البرامج والأدوات الاحترافية - نوفر لك أفضل الأسعار لاشتراكات التصميم، التطوير، والمونتاج
            </p>
            
            {/* Hero Search Bar */}
            <div className="max-w-2xl mx-auto mb-6 sm:mb-8 px-4">
              <form action="/products" method="get" className="relative">
                <div className="relative">
                  <input
                    type="text"
                    name="search"
                    placeholder="ابحث عن البرامج والأدوات التي تحتاجها..."
                    className="w-full px-4 sm:px-6 py-3 sm:py-4 pr-20 sm:pr-24 text-base sm:text-lg border-0 rounded-2xl shadow-lg focus:outline-none focus:ring-4 focus:ring-blue-300 focus:ring-opacity-50"
                  />
                  <button
                    type="submit"
                    className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 sm:px-6 py-2 rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all transform hover:scale-105 text-sm sm:text-base"
                  >
                    بحث
                  </button>
                </div>
              </form>
              <div className="mt-3 text-center">
                <p className="text-xs sm:text-sm text-gray-500">جرب البحث عن: Adobe Photoshop, Figma, Visual Studio Code</p>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4">
              <Link
                href="/products"
                className="px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all transform hover:scale-105 shadow-lg text-sm sm:text-base"
              >
                تصفح المنتجات
              </Link>
              <Link
                href="/deals"
                className="px-6 sm:px-8 py-3 sm:py-4 bg-white text-blue-600 font-semibold rounded-xl border-2 border-blue-200 hover:bg-blue-50 transition-all transform hover:scale-105 shadow-lg text-sm sm:text-base"
              >
                العروض الخاصة
              </Link>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-12 sm:py-16 lg:py-20 bg-white">
          <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
            <div className="text-center mb-12 sm:mb-16">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 mb-3 sm:mb-4">لماذا تختار وفرلي؟</h2>
              <p className="text-lg sm:text-xl text-gray-600">نقدم لك أفضل الخدمات والأسعار</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
              <div className="text-center p-6 sm:p-8 bg-gray-50 rounded-2xl hover:shadow-lg transition-all">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                  <span className="text-white text-xl sm:text-2xl">💰</span>
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-3 sm:mb-4">أفضل الأسعار</h3>
                <p className="text-sm sm:text-base text-gray-600">نوفر لك أرخص الأسعار لجميع البرامج والأدوات مع ضمان الجودة</p>
              </div>
              
              <div className="text-center p-6 sm:p-8 bg-gray-50 rounded-2xl hover:shadow-lg transition-all">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                  <span className="text-white text-xl sm:text-2xl">⚡</span>
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-3 sm:mb-4">توصيل فوري</h3>
                <p className="text-sm sm:text-base text-gray-600">احصل على رخص البرامج فوراً بعد الدفع عبر البريد الإلكتروني</p>
              </div>
              
              <div className="text-center p-6 sm:p-8 bg-gray-50 rounded-2xl hover:shadow-lg transition-all">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                  <span className="text-white text-xl sm:text-2xl">🛡️</span>
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-3 sm:mb-4">ضمان الجودة</h3>
                <p className="text-sm sm:text-base text-gray-600">جميع المنتجات أصلية 100% مع ضمان استرداد الأموال</p>
              </div>
            </div>
          </div>
        </section>

        {/* Popular Categories */}
        <section className="py-12 sm:py-16 lg:py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
            <div className="text-center mb-12 sm:mb-16">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 mb-3 sm:mb-4">الفئات الشائعة</h2>
              <p className="text-lg sm:text-xl text-gray-600">تصفح مجموعتنا الواسعة من البرامج والأدوات</p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              <Link href="/category/design" className="group">
                <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all transform hover:scale-105">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-pink-500 to-red-500 rounded-xl flex items-center justify-center mx-auto mb-3 sm:mb-4 group-hover:scale-110 transition-transform">
                    <span className="text-white text-lg sm:text-2xl">🎨</span>
                  </div>
                  <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-2 text-center">برامج التصميم</h3>
                  <p className="text-xs sm:text-sm text-gray-600 text-center">Adobe, Figma, Sketch</p>
                </div>
              </Link>
              
              <Link href="/category/development" className="group">
                <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all transform hover:scale-105">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center mx-auto mb-3 sm:mb-4 group-hover:scale-110 transition-transform">
                    <span className="text-white text-lg sm:text-2xl">💻</span>
                  </div>
                  <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-2 text-center">برامج التطوير</h3>
                  <p className="text-xs sm:text-sm text-gray-600 text-center">JetBrains, VS Code, Sublime</p>
                </div>
              </Link>
              
              <Link href="/category/video" className="group">
                <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all transform hover:scale-105">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mx-auto mb-3 sm:mb-4 group-hover:scale-110 transition-transform">
                    <span className="text-white text-lg sm:text-2xl">🎬</span>
                  </div>
                  <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-2 text-center">برامج الفيديو</h3>
                  <p className="text-xs sm:text-sm text-gray-600 text-center">Premiere, After Effects, DaVinci</p>
                </div>
              </Link>
              
              <Link href="/category/productivity" className="group">
                <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all transform hover:scale-105">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center mx-auto mb-3 sm:mb-4 group-hover:scale-110 transition-transform">
                    <span className="text-white text-lg sm:text-2xl">📊</span>
                  </div>
                  <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-2 text-center">برامج الإنتاجية</h3>
                  <p className="text-xs sm:text-sm text-gray-600 text-center">Office, Notion, Slack</p>
                </div>
              </Link>
            </div>
          </div>
        </section>

        {/* Authentication System */}
        <section className="py-12 sm:py-16 lg:py-20 bg-white">
          <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
            <div className="text-center mb-12 sm:mb-16">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 mb-3 sm:mb-4">نظام المصادقة والأدوار</h2>
              <p className="text-lg sm:text-xl text-gray-600">نظام متكامل لإدارة المستخدمين والصلاحيات</p>
            </div>
            
            <div className="w-full max-w-5xl mx-auto bg-white rounded-2xl shadow-2xl p-4 sm:p-6 lg:p-8 border border-gray-100">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
                <Link 
                  href="/auth/login"
                  className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-3 sm:py-4 px-3 sm:px-4 rounded-xl transition-all transform hover:scale-105 text-center shadow-lg text-sm sm:text-base"
                >
                  🔑 تسجيل الدخول
                </Link>
                
                <Link 
                  href="/auth/register"
                  className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-3 sm:py-4 px-3 sm:px-4 rounded-xl transition-all transform hover:scale-105 text-center shadow-lg text-sm sm:text-base"
                >
                  👤 إنشاء حساب
                </Link>
                
                <Link 
                  href="/auth/forgot-password"
                  className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white font-semibold py-3 sm:py-4 px-3 sm:px-4 rounded-xl transition-all transform hover:scale-105 text-center shadow-lg text-sm sm:text-base"
                >
                  🔓 نسيت كلمة المرور
                </Link>
                
                <Link 
                  href="/profile"
                  className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-semibold py-3 sm:py-4 px-3 sm:px-4 rounded-xl transition-all transform hover:scale-105 text-center shadow-lg text-sm sm:text-base"
                >
                  👨‍💼 الملف الشخصي
                </Link>

                <Link 
                  href="/admin"
                  className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold py-3 sm:py-4 px-3 sm:px-4 rounded-xl transition-all transform hover:scale-105 text-center shadow-lg text-sm sm:text-base"
                >
                  🛡️ لوحة التحكم
                </Link>
              </div>

              <div className="mt-6 sm:mt-8 p-4 sm:p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200">
                <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-3 sm:mb-4">🎯 الميزات المتوفرة:</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 text-xs sm:text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>تسجيل دخول آمن</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>نظام أدوار متقدم</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>تسجيل دخول بـ Google</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>إدارة المستخدمين</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>تشفير متقدم</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>واجهة عربية</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Supabase Example Component */}
        <section className="py-12 sm:py-16 lg:py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
            <div className="text-center mb-12 sm:mb-16">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 mb-3 sm:mb-4">اختبار الاتصال</h2>
              <p className="text-lg sm:text-xl text-gray-600">تأكد من عمل قاعدة البيانات</p>
            </div>
            
            <div className="w-full max-w-4xl mx-auto">
              <SupabaseExample />
            </div>
          </div>
        </section>
      </div>
    </Layout>
  )
}
