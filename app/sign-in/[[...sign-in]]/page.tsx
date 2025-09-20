import { SignIn } from '@clerk/nextjs';

export default function SignInPage() {
  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: 'url(/login_background_wallpaper_zignals04.png)',
        backgroundBlendMode: 'overlay',
        backgroundColor: 'rgba(0, 0, 0, 0.4)'
      }}
    >
      <SignIn
        appearance={{
          elements: {
            rootBox: 'mx-auto',
            card: 'bg-white dark:bg-gray-900 shadow-2xl border dark:border-gray-700',
            headerTitle: 'text-2xl font-bold text-gray-900 dark:text-white',
            headerSubtitle: 'text-gray-700 dark:text-gray-200',
            socialButtonsBlockButton:
              'border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-white',
            socialButtonsBlockButtonText: 'text-gray-900 dark:text-white font-medium',
            formButtonPrimary:
              'bg-blue-600 hover:bg-blue-700 text-white font-medium',
            formFieldInput:
              'border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white text-gray-900',
            formFieldLabel: 'text-gray-900 dark:text-white font-medium',
            footerActionLink:
              'text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium',
            footerActionText: 'text-gray-700 dark:text-gray-200',
            identityPreviewText: 'text-gray-900 dark:text-gray-100',
            identityPreviewEditButton: 'text-blue-600 dark:text-blue-400',
            formFieldInputShowPasswordButton: 'text-gray-600 dark:text-gray-300',
            alternativeMethodsBlockButton: 'text-gray-900 dark:text-white border-gray-300 dark:border-gray-600',
            otpCodeFieldInput: 'border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white',
            formResendCodeLink: 'text-blue-600 dark:text-blue-400 font-medium',
            main: 'text-gray-900 dark:text-white',
          },
        }}
      />
    </div>
  );
}