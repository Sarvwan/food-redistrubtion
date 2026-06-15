import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
interface SplitScreenLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
  imageSrc?: string;
}

export function SplitScreenLayout({ children, title, subtitle, imageSrc = "/images/auth_image.png" }: SplitScreenLayoutProps) {
  return (
    <div className="min-h-screen bg-[#FAFCFB] flex selection:bg-[#10B981]/20 selection:text-[#0F172A] overflow-hidden">
      {/* Left side - Visual/Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden items-center justify-center p-16 border-r border-slate-200/50">
        <div className="absolute inset-0 z-0">
          <img 
            src={imageSrc} 
            alt="Food Redistribution" 
            className="w-full h-full object-cover transform scale-105"
          />
          {/* Soft Image Overlay */}
          <div className="absolute inset-0 bg-slate-900/40 mix-blend-multiply z-10" />
          <div className="absolute inset-0 bg-gradient-to-br from-[#10B981]/30 to-[#0F172A]/80 z-20" />
        </div>

        {/* The left canvas text and logo have been removed per user request */}

        {/* Floating Background Blobs */}
        <motion.div
          animate={{ x: [0, 20, 0], y: [0, -20, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute -top-32 -left-32 w-96 h-96 bg-white/20 rounded-full blur-3xl opacity-50 z-10"
        />
        <motion.div
          animate={{ x: [0, -20, 0], y: [0, 20, 0], scale: [1, 1.2, 1] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute -bottom-32 -right-32 w-[500px] h-[500px] bg-emerald-900/20 rounded-full blur-3xl opacity-50 z-10"
        />
      </div>

      {/* Right side - Content/Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative bg-[#ECFDF5]">
        {/* Subtle radial glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] opacity-40 pointer-events-none" 
             style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.8) 0%, rgba(236,253,245,0) 70%)' }}></div>
             
        {/* Back Button */}
        <Link 
          to="/" 
          className="absolute top-8 right-8 inline-flex items-center gap-2 text-sm font-medium text-[#64748B] hover:text-[#0F172A] transition-colors z-20 bg-white/50 backdrop-blur-sm px-4 py-2 rounded-full border border-slate-200/60 shadow-sm"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Home
        </Link>

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-[500px] relative z-10 flex flex-col"
        >
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <img src="/images/logo.png" alt="Logo" className="h-16 w-auto object-contain" />
          </div>
          
          {/* Title and Subtitle */}
          <div className="text-center mb-10 space-y-3">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#0F172A]">{title}</h2>
            <p className="text-[#64748B] font-medium text-base">{subtitle}</p>
          </div>

          {children}
        </motion.div>
      </div>
    </div>
  );
}
