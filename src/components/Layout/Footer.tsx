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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <span className="text-white text-2xl font-bold">W</span>
              </div>
              <div>
                <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  وفرلي
                </h3>
                <p className="text-sm text-gray-400">متجر البرامج والأدوات</p>
              </div>
            </div>
            <p className="text-gray-300 mb-6 leading-relaxed">
              نقدم أفضل الأسعار لاشتراكات البرامج والأدوات الاحترافية. نوفر لك التصميم، التطوير، والمونتاج بأقل التكاليف.
            </p>
            <div className="flex items-center gap-4">
              <Link href="#" className="w-10 h-10 bg-gray-800 hover:bg-blue-600 rounded-lg flex items-center justify-center transition-colors">
                <FiFacebook className="text-xl" />
              </Link>
              <Link href="#" className="w-10 h-10 bg-gray-800 hover:bg-blue-400 rounded-lg flex items-center justify-center transition-colors">
                <FiTwitter className="text-xl" />
              </Link>
              <Link href="#" className="w-10 h-10 bg-gray-800 hover:bg-pink-600 rounded-lg flex items-center justify-center transition-colors">
                <FiInstagram className="text-xl" />
              </Link>
              <Link href="#" className="w-10 h-10 bg-gray-800 hover:bg-blue-700 rounded-lg flex items-center justify-center transition-colors">
                <FiLinkedin className="text-xl" />
              </Link>
              <Link href="#" className="w-10 h-10 bg-gray-800 hover:bg-red-600 rounded-lg flex items-center justify-center transition-colors">
                <FiYoutube className="text-xl" />
              </Link>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-6 text-white">روابط سريعة</h4>
            <ul className="space-y-3">
              <li>
                <Link href="/products" className="text-gray-300 hover:text-blue-400 transition-colors">
                  جميع المنتجات
                </Link>
              </li>
              <li>
                <Link href="/categories" className="text-gray-300 hover:text-blue-400 transition-colors">
                  فئات البرامج
                </Link>
              </li>
              <li>
                <Link href="/deals" className="text-gray-300 hover:text-blue-400 transition-colors">
                  العروض الخاصة
                </Link>
              </li>
              <li>
                <Link href="/student-discount" className="text-gray-300 hover:text-blue-400 transition-colors">
                  خصم الطلاب
                </Link>
              </li>
              <li>
                <Link href="/enterprise" className="text-gray-300 hover:text-blue-400 transition-colors">
                  حلول الشركات
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-gray-300 hover:text-blue-400 transition-colors">
                  المدونة
                </Link>
              </li>
            </ul>
          </div>

          {/* Support & Services */}
          <div>
            <h4 className="text-lg font-semibold mb-6 text-white">الدعم والخدمات</h4>
            <ul className="space-y-3">
              <li>
                <Link href="/support" className="text-gray-300 hover:text-blue-400 transition-colors">
                  مركز المساعدة
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-300 hover:text-blue-400 transition-colors">
                  اتصل بنا
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-gray-300 hover:text-blue-400 transition-colors">
                  الأسئلة الشائعة
                </Link>
              </li>
              <li>
                <Link href="/tutorials" className="text-gray-300 hover:text-blue-400 transition-colors">
                  الدروس التعليمية
                </Link>
              </li>
              <li>
                <Link href="/downloads" className="text-gray-300 hover:text-blue-400 transition-colors">
                  التحميلات
                </Link>
              </li>
              <li>
                <Link href="/status" className="text-gray-300 hover:text-blue-400 transition-colors">
                  حالة الخدمة
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-semibold mb-6 text-white">معلومات الاتصال</h4>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <FiMapPin className="text-blue-400 mt-1 flex-shrink-0" />
                <div>
                  <p className="text-gray-300 text-sm">
                    الرياض، المملكة العربية السعودية<br />
                    برج المملكة، الطابق 15
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <FiPhone className="text-blue-400" />
                <div>
                  <p className="text-gray-300 text-sm">+966 50 123 4567</p>
                  <p className="text-gray-400 text-xs">من الأحد إلى الخميس</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <FiMail className="text-blue-400" />
                <div>
                  <p className="text-gray-300 text-sm">support@wafarle.com</p>
                  <p className="text-gray-400 text-xs">الرد خلال 24 ساعة</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Bar */}
      <div className="bg-gray-800 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="flex items-center gap-3 text-center md:text-right">
              <FiShield className="text-green-400 text-2xl" />
              <div>
                <h5 className="font-semibold text-white">ضمان الجودة</h5>
                <p className="text-sm text-gray-400">جميع المنتجات أصلية 100%</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 text-center md:text-right">
              <FiCreditCard className="text-blue-400 text-2xl" />
              <div>
                <h5 className="font-semibold text-white">دفع آمن</h5>
                <p className="text-sm text-gray-400">حماية كاملة للمعاملات</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 text-center md:text-right">
              <FiTruck className="text-purple-400 text-2xl" />
              <div>
                <h5 className="font-semibold text-white">توصيل فوري</h5>
                <p className="text-sm text-gray-400">استلام فوري للرخص</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 text-center md:text-right">
              <FiRefreshCw className="text-orange-400 text-2xl" />
              <div>
                <h5 className="font-semibold text-white">استرداد الأموال</h5>
                <p className="text-sm text-gray-400">خلال 30 يوم</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="bg-gray-950 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-center md:text-right">
              <p className="text-gray-400 text-sm">
                © 2024 وفرلي. جميع الحقوق محفوظة.
              </p>
            </div>
            
            <div className="flex items-center gap-6 text-sm">
              <Link href="/privacy" className="text-gray-400 hover:text-white transition-colors">
                سياسة الخصوصية
              </Link>
              <Link href="/terms" className="text-gray-400 hover:text-white transition-colors">
                شروط الاستخدام
              </Link>
              <Link href="/cookies" className="text-gray-400 hover:text-white transition-colors">
                ملفات تعريف الارتباط
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
