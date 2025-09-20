'use client';

export function FeatureHighlights() {
  const features = [
    {
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M3 3L21 21M9 9L21 3L12 12L3 21L9 9Z" stroke="#0577DA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      title: "Real-time Signals",
      description: "Professional trading signals with instant notifications"
    },
    {
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M3 3V9L9 12L15 9V3M3 3L9 6L15 3M3 3L9 6M15 3L9 6" stroke="#0577DA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M9 12V18L15 21V15" stroke="#0577DA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      title: "Advanced Analytics",
      description: "Professional-grade charts and market analysis tools"
    },
    {
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="#0577DA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      title: "Secure Platform",
      description: "Enterprise-grade security with encrypted data"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {features.map((feature, index) => (
        <div key={index} className="flex items-start space-x-4 p-4 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 transition-colors">
          <div className="flex-shrink-0 w-12 h-12 bg-[#0577DA]/10 rounded-lg flex items-center justify-center">
            {feature.icon}
          </div>
          <div>
            <h3 className="text-white font-semibold mb-2">{feature.title}</h3>
            <p className="text-gray-300 text-sm">{feature.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
