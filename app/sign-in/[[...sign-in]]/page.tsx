import { SignIn } from '@clerk/nextjs';
import Image from 'next/image';

export default function SignInPage() {
  return (
    <div className="min-h-screen flex">
      {/* Left side - Wallpaper */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-2/3 relative">
        <Image
          src="/zignals_login_wallpaper.png"
          alt="Zignals Trading Platform"
          fill
          className="object-cover"
          priority
        />
        {/* Overlay with branding */}
        <div className="absolute inset-0 bg-black/20 flex flex-col justify-end p-8">
          <div className="text-white">
            <h1 className="text-4xl font-bold mb-4">Welcome Back</h1>
            <p className="text-xl opacity-90">
              Continue your professional trading journey
            </p>
          </div>
        </div>
      </div>

      {/* Right side - Sign In Form */}
      <div className="flex-1 lg:w-1/2 xl:w-1/3 flex items-center justify-center p-8 bg-gray-50 dark:bg-gray-900">
        <div className="w-full max-w-md">
          {/* Mobile logo for small screens */}
          <div className="lg:hidden mb-8 text-center">
            <Image
              src="/official_zignals_logo.png"
              alt="Zignals"
              width={120}
              height={40}
              className="mx-auto"
            />
          </div>
          
          <SignIn
            routing="virtual"
            fallbackRedirectUrl="/"
            signUpUrl="/sign-up"
            appearance={{
              elements: {
                rootBox: 'w-full',
                card: 'bg-white dark:bg-gray-800 shadow-xl border-0 rounded-xl p-8',
                headerTitle: 'text-2xl font-bold text-gray-900 dark:text-white text-center mb-2',
                headerSubtitle: 'text-gray-600 dark:text-gray-300 text-center mb-6',
                socialButtonsBlockButton:
                  'w-full border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-white rounded-lg py-3 px-4 font-medium transition-colors',
                socialButtonsBlockButtonText: 'text-gray-900 dark:text-white font-medium',
                formButtonPrimary:
                  'w-full bg-[#33E1DA] hover:bg-[#2BC4BE] text-gray-900 font-semibold py-3 px-4 rounded-lg transition-colors',
                formFieldInput:
                  'w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white text-gray-900 rounded-lg py-3 px-4 focus:ring-2 focus:ring-[#33E1DA] focus:border-transparent',
                formFieldLabel: 'text-gray-700 dark:text-gray-200 font-medium mb-2 block',
                footerActionLink:
                  'text-[#33E1DA] hover:text-[#2BC4BE] font-medium',
                footerActionText: 'text-gray-600 dark:text-gray-300',
                identityPreviewText: 'text-gray-900 dark:text-gray-100',
                identityPreviewEditButton: 'text-[#33E1DA] hover:text-[#2BC4BE]',
                formFieldInputShowPasswordButton: 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200',
                alternativeMethodsBlockButton: 'text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 rounded-lg py-2 px-4',
                otpCodeFieldInput: 'border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-lg py-3 px-4 text-center',
                formResendCodeLink: 'text-[#33E1DA] hover:text-[#2BC4BE] font-medium',
                main: 'text-gray-900 dark:text-white',
                dividerLine: 'bg-gray-300 dark:bg-gray-600',
                dividerText: 'text-gray-500 dark:text-gray-400',
              },
              variables: {
                colorPrimary: '#33E1DA',
                colorBackground: '#ffffff',
                colorInputBackground: '#ffffff',
                colorInputText: '#1f2937',
                borderRadius: '0.5rem',
              },
            }}
          />
        </div>
      </div>
    </div>
  );
}
