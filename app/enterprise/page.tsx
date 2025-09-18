import { EnterpriseLanding } from '@/components/enterprise/EnterpriseLanding'
import Link from 'next/link'

export default function EnterprisePage() {
  return (
    <>
      {/* Navigation overlay */}
      <div className="fixed top-6 left-6 z-50 flex gap-3">
        <Link 
          href="/"
          className="px-4 py-2 text-sm bg-enhanced-card backdrop-blur-md text-foreground rounded-lg shadow-sm border border-border hover:bg-enhanced-card-hover hover:text-primary hover:shadow-md transition-all duration-200"
        >
          ← Original
        </Link>
        <Link 
          href="/auth"
          className="px-4 py-2 text-sm bg-brand-600 text-white rounded-lg shadow-sm hover:bg-brand-700 hover:shadow-md transition-all duration-200"
        >
          Sign In
        </Link>
      </div>

      {/* Enterprise Landing */}
      <EnterpriseLanding />
    </>
  )
}