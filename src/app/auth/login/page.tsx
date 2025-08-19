import LoginForm from '@/components/Auth/LoginForm'

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">مرحباً بك</h1>
          <p className="text-gray-600">سجل دخولك للوصول إلى حسابك</p>
        </div>
        <LoginForm />
      </div>
    </div>
  )
}
