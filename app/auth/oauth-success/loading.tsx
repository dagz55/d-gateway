export default function OAuthSuccessLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A0F1F] via-[#1A1F35] to-[#0A0F1F] flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin h-8 w-8 border-2 border-[#33E1DA] border-t-transparent rounded-full mx-auto mb-4"></div>
        <p className="text-white">Redirecting to your dashboard...</p>
        <p className="text-white/60 text-sm mt-2">Setting up your account...</p>
      </div>
    </div>
  );
}