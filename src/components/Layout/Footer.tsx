'use client'

import Link from 'next/link'
import { 
  FiMail, 
  FiPhone, 
  FiMapPin, 
  FiFacebook, 
  FiTwitter, 
  FiInstagram, 
  FiLinkedin,
  FiYoutube,
  FiShield,
  FiCreditCard,
  FiTruck,
  FiRefreshCw
} from 'react-icons/fi'

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-8 sm:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {/* Company Info */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <span className="text-white text-lg sm:text-2xl font-bold">W</span>
              </div>
              <div>
                <h3 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  وفرلي
                </h3>
                <p className="text-xs sm:text-sm text-gray-400">متجر البرامج والأدوات</p>
              </div>
            </div>
            <p className="text-sm sm:text-base text-gray-300 mb-4 sm:mb-6 leading-relaxed">
              نقدم أفضل الأسعار لاشتراكات البرامج والأدوات الاحترافية. نوفر لك التصميم، التطوير، والمونتاج بأقل التكاليف.
            </p>
            <div className="flex items-center gap-3 sm:gap-4">
              <Link href="#" className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-800 hover:bg-blue-600 rounded-lg flex items-center justify-center transition-colors">
                <FiFacebook className="text-lg sm:text-xl" />
              </Link>
              <Link href="#" className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-800 hover:bg-blue-400 rounded-lg flex items-center justify-center transition-colors">
                <FiTwitter className="text-lg sm:text-xl" />
              </Link>
              <Link href="#" className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-800 hover:bg-pink-600 rounded-lg flex items-center justify-center transition-colors">
                <FiInstagram className="text-lg sm:text-xl" />
              </Link>
              <Link href="#" className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-800 hover:bg-blue-700 rounded-lg flex items-center justify-center transition-colors">
                <FiLinkedin className="text-lg sm:text-xl" />
              </Link>
              <Link href="#" className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-800 hover:bg-red-600 rounded-lg flex items-center justify-center transition-colors">
                <FiYoutube className="text-lg sm:text-xl" />
              </Link>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-base sm:text-lg font-semibold mb-4 sm:mb-6 text-white">روابط سريعة</h4>
            <ul className="space-y-2 sm:space-y-3">
              <li>
                <Link href="/products" className="text-sm sm:text-base text-gray-300 hover:text-blue-400 transition-colors">
                  جميع المنتجات
                </Link>
              </li>
              <li>
                <Link href="/categories" className="text-sm sm:text-base text-gray-300 hover:text-blue-400 transition-colors">
                  فئات البرامج
                </Link>
              </li>
              <li>
                <Link href="/deals" className="text-sm sm:text-base text-gray-300 hover:text-blue-400 transition-colors">
                  العروض الخاصة
                </Link>
              </li>
              <li>
                <Link href="/student-discount" className="text-sm sm:text-base text-gray-300 hover:text-blue-400 transition-colors">
                  خصم الطلاب
                </Link>
              </li>
              <li>
                <Link href="/enterprise" className="text-sm sm:text-base text-gray-300 hover:text-blue-400 transition-colors">
                  حلول الشركات
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-sm sm:text-base text-gray-300 hover:text-blue-400 transition-colors">
                  المدونة
                </Link>
              </li>
            </ul>
          </div>

          {/* Support & Services */}
          <div>
            <h4 className="text-base sm:text-lg font-semibold mb-4 sm:mb-6 text-white">الدعم والخدمات</h4>
            <ul className="space-y-2 sm:space-y-3">
              <li>
                <Link href="/support" className="text-sm sm:text-base text-gray-300 hover:text-blue-400 transition-colors">
                  مركز المساعدة
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-sm sm:text-base text-gray-300 hover:text-blue-400 transition-colors">
                  اتصل بنا
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-sm sm:text-base text-gray-300 hover:text-blue-400 transition-colors">
                  الأسئلة الشائعة
                </Link>
              </li>
              <li>
                <Link href="/tutorials" className="text-sm sm:text-base text-gray-300 hover:text-blue-400 transition-colors">
                  الدروس التعليمية
                </Link>
              </li>
              <li>
                <Link href="/downloads" className="text-sm sm:text-base text-gray-300 hover:text-blue-400 transition-colors">
                  التحميلات
                </Link>
              </li>
              <li>
                <Link href="/api" className="text-sm sm:text-base text-gray-300 hover:text-blue-400 transition-colors">
                  واجهة برمجة التطبيقات
                </Link>
              </li>
            </ul>
          </div>

          {/* Company & Legal */}
          <div>
            <h4 className="text-base sm:text-lg font-semibold mb-4 sm:mb-6 text-white">الشركة والقانون</h4>
            <ul className="space-y-2 sm:space-y-3">
              <li>
                <Link href="/about" className="text-sm sm:text-base text-gray-300 hover:text-blue-400 transition-colors">
                  من نحن
                </Link>
              </li>
              <li>
                <Link href="/careers" className="text-sm sm:text-base text-gray-300 hover:text-blue-400 transition-colors">
                  الوظائف
                </Link>
              </li>
              <li>
                <Link href="/press" className="text-sm sm:text-base text-gray-300 hover:text-blue-400 transition-colors">
                  الصحافة
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-sm sm:text-base text-gray-300 hover:text-blue-400 transition-colors">
                  سياسة الخصوصية
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-sm sm:text-base text-gray-300 hover:text-blue-400 transition-colors">
                  شروط الاستخدام
                </Link>
              </li>
              <li>
                <Link href="/cookies" className="text-sm sm:text-base text-gray-300 hover:text-blue-400 transition-colors">
                  ملفات تعريف الارتباط
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Features Bar */}
      <div className="bg-gray-800 py-6 sm:py-8">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <FiShield className="text-white text-lg sm:text-xl" />
              </div>
              <div>
                <h5 className="text-sm sm:text-base font-semibold text-white">أمان 100%</h5>
                <p className="text-xs sm:text-sm text-gray-400">حماية كاملة لبياناتك</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-600 rounded-lg flex items-center justify-center">
                <FiCreditCard className="text-white text-lg sm:text-xl" />
              </div>
              <div>
                <h5 className="text-sm sm:text-base font-semibold text-white">دفع آمن</h5>
                <p className="text-xs sm:text-sm text-gray-400">طرق دفع متعددة</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-purple-600 rounded-lg flex items-center justify-center">
                <FiTruck className="text-white text-lg sm:text-xl" />
              </div>
              <div>
                <h5 className="text-sm sm:text-base font-semibold text-white">توصيل فوري</h5>
                <p className="text-xs sm:text-sm text-gray-400">بعد الدفع مباشرة</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-yellow-600 rounded-lg flex items-center justify-center">
                <FiRefreshCw className="text-white text-lg sm:text-xl" />
              </div>
              <div>
                <h5 className="text-sm sm:text-base font-semibold text-white">ضمان استرداد</h5>
                <p className="text-xs sm:text-sm text-gray-400">خلال 30 يوم</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="bg-gray-950 py-4 sm:py-6">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
            <div className="text-center sm:text-right">
              <p className="text-xs sm:text-sm text-gray-400">
                © 2024 وفرلي. جميع الحقوق محفوظة.
              </p>
            </div>
            
            <div className="flex items-center gap-4 sm:gap-6">
              <Link href="/privacy" className="text-xs sm:text-sm text-gray-400 hover:text-white transition-colors">
                الخصوصية
              </Link>
              <Link href="/terms" className="text-xs sm:text-sm text-gray-400 hover:text-white transition-colors">
                الشروط
              </Link>
              <Link href="/sitemap" className="text-xs sm:text-sm text-gray-400 hover:text-white transition-colors">
                خريطة الموقع
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
