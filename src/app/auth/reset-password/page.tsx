import ResetPasswordForm from '@/components/Auth/ResetPasswordForm'

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">تعيين كلمة مرور جديدة</h1>
          <p className="text-gray-600">اختر كلمة مرور قوية لحسابك</p>
        </div>
        <ResetPasswordForm />
      </div>
    </div>
  )
}
