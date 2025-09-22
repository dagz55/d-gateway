import { SignIn } from '@clerk/nextjs';

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-900 to-gray-800">
      <SignIn 
        routing="virtual" 
        fallbackRedirectUrl="/" 
        signUpUrl="/sign-up" 
      />
    </div>
  );
}
