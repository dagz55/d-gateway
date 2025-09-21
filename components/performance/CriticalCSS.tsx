// Critical CSS for above-the-fold content
export const CriticalCSS = () => (
  <style jsx global>{`
    /* Critical styles for immediate rendering */
    .landing-hero {
      min-height: 100vh;
      background: linear-gradient(135deg, #040918 0%, #071635 50%, #02040B 100%);
      color: white;
      display: flex;
      flex-direction: column;
    }
    
    .landing-nav {
      position: sticky;
      top: 0;
      z-index: 40;
      backdrop-filter: blur(8px);
      background: rgba(3, 8, 21, 0.95);
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }
    
    .landing-content {
      flex: 1;
      display: flex;
      align-items: center;
      padding: 2rem 1rem;
    }
    
    .hero-title {
      font-size: clamp(2rem, 5vw, 4rem);
      font-weight: 700;
      line-height: 1.1;
      margin-bottom: 1rem;
    }
    
    .hero-subtitle {
      font-size: clamp(1rem, 2.5vw, 1.25rem);
      opacity: 0.8;
      margin-bottom: 2rem;
      max-width: 600px;
    }
    
    .cta-button {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.75rem 1.5rem;
      background: linear-gradient(90deg, #0577DA 0%, #1199FA 100%);
      color: white;
      text-decoration: none;
      border-radius: 9999px;
      font-weight: 600;
      transition: transform 0.2s ease;
    }
    
    .cta-button:hover {
      transform: translateY(-1px);
    }
    
    /* Loading states */
    .loading-skeleton {
      background: linear-gradient(90deg, rgba(255,255,255,0.1) 25%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0.1) 75%);
      background-size: 200% 100%;
      animation: loading 1.5s infinite;
    }
    
    @keyframes loading {
      0% { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }
  `}</style>
);
