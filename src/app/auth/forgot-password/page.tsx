import ForgotPasswordForm from '@/components/Auth/ForgotPasswordForm'

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">نسيت كلمة المرور؟</h1>
          <p className="text-gray-600">لا تقلق، سنساعدك في استعادتها</p>
        </div>
        <ForgotPasswordForm />
      </div>
    </div>
  )
}
