import { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, useMotionValue, useTransform, animate, useInView } from 'framer-motion';
import { useAuthStore } from '../store/authStore';
import { Button } from '../components/ui/button';

function AnimatedCounter({ value }: { value: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "0px" });
  const count = useMotionValue(0);
  const rounded = useTransform(count, Math.round);

  useEffect(() => {
    if (isInView) {
      const animation = animate(count, value, { duration: 2.5, ease: [0.16, 1, 0.3, 1] });
      return animation.stop;
    }
  }, [value, isInView]);

  return <motion.span ref={ref}>{rounded}</motion.span>;
}

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

export function Landing() {
  const { isAuthenticated, role, logout } = useAuthStore();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalDonations: 0,
    completedDonations: 0,
    approvedNGOs: 0,
    totalFoodDistributedApprox: 0
  });

  const fetchStats = () => {
    fetch('/api/stats')
      .then(res => res.json())
      .then(data => setStats(data))
      .catch(err => console.error("Failed to load stats", err));
  };

  useEffect(() => {
    fetchStats();
    // Real-time syncing every 5 seconds
    const interval = setInterval(fetchStats, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleDashboardRedirect = () => {
    if (role === 'admin') navigate('/admin');
    else if (role === 'ngo') navigate('/ngo');
    else if (role === 'donor') navigate('/donor');
  };

  return (
    <div className="min-h-screen bg-[#F0FDF4] font-sans selection:bg-[#10B981]/20 selection:text-[#0F172A] overflow-hidden text-[#475569]">
      {/* Navbar */}
      <nav className="absolute top-0 z-50 w-full transition-all duration-300">
        <div className="container mx-auto flex h-16 sm:h-20 items-center justify-between px-4 sm:px-6 lg:px-8 max-w-7xl">
          <Link to="/" className="flex items-center gap-2.5 group">
            <img src="/images/logo.png" alt="Food Relief Logo" className="h-7 w-7 sm:h-8 sm:w-8 object-contain drop-shadow-md transition-transform group-hover:scale-105" />
            <span className="text-base sm:text-lg font-bold tracking-tight text-white">Food Relief</span>
          </Link>

          <div className="flex items-center gap-3 sm:gap-5">
            {isAuthenticated ? (
              <>
                <Button variant="ghost" onClick={handleDashboardRedirect} className="text-slate-200 hover:text-white hover:bg-white/10 rounded-full px-5 font-medium transition-all">Dashboard</Button>
                <Button variant="outline" onClick={logout} className="border-white/20 bg-transparent text-slate-200 hover:text-white hover:bg-white/10 rounded-full px-5 font-medium transition-all text-sm">Logout</Button>
              </>
            ) : (
              <>
                <Button variant="ghost" asChild className="hidden sm:flex text-slate-200 hover:text-white hover:bg-white/10 rounded-full px-5 font-medium transition-all">
                  <Link to="/login">Login</Link>
                </Button>
                <Button asChild className="bg-emerald-500 hover:bg-emerald-400 text-white border-0 shadow-lg shadow-emerald-500/20 rounded-full px-6 font-semibold transition-all hover:scale-105">
                  <Link to="/register">Get Started</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex flex-col justify-center items-center pt-24 pb-48 overflow-hidden">
        {/* Background Image & Premium Overlay */}
        <div className="absolute inset-0 z-0 bg-[#0F172A]">
          <img 
            src="/images/hero.png" 
            alt="Hero Background" 
            className="w-full h-full object-cover object-right sm:object-[80%_center]" 
          />
          {/* Left-to-right gradient so the text is readable but the right side image is perfectly clear */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#0F172A]/90 via-[#0F172A]/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A]/30 to-transparent" />
        </div>

        {/* Hero Content */}
        <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8 pt-20">
          <div className="max-w-2xl text-left">
            <motion.div 
              variants={fadeInUp}
              initial="hidden"
              animate="visible"
              className="mb-6 font-medium text-emerald-400 tracking-[0.3em] uppercase text-[11px] opacity-90"
            >
              A Community Driven Initiative
            </motion.div>
            
            <motion.h1 
              variants={fadeInUp}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.1 }}
              className="text-4xl sm:text-5xl font-bold tracking-tight text-white mb-6 leading-[1.15]"
            >
              Turn Surplus into <br className="hidden sm:block"/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 to-teal-200">Sustenance</span>
            </motion.h1>
            
            <motion.p 
              variants={fadeInUp}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.2 }}
              className="text-base sm:text-lg leading-relaxed text-slate-300 mb-10 font-light max-w-xl"
            >
              Connect <span className="font-medium text-white">excess food</span> from donors to <span className="font-medium text-white">registered NGOs</span> seamlessly. Together, we can reduce waste and feed those in need in our communities.
            </motion.p>
            
            <motion.div 
              variants={fadeInUp}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <Button asChild size="lg" className="w-full sm:w-auto bg-emerald-500 hover:bg-emerald-400 text-white h-12 px-8 text-sm font-semibold rounded-full shadow-[0_0_20px_rgba(16,185,129,0.2)] transition-all">
                <Link to="/register">Become a Donor</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="w-full sm:w-auto h-12 px-8 text-sm font-semibold rounded-full border border-white/20 bg-transparent hover:bg-white/10 text-white transition-all">
                <Link to="/register">Register as NGO</Link>
              </Button>
            </motion.div>

            {/* Stats inline under buttons */}
            <motion.div 
              variants={fadeInUp}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.4 }}
              className="mt-14 pt-8 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-6"
            >
              {[
                { value: stats.totalDonations, label: "Total Donations" },
                { value: stats.completedDonations, label: "Successful Deliveries" },
                { value: stats.approvedNGOs, label: "Approved NGOs" },
                { value: stats.totalFoodDistributedApprox, label: "Meals Distributed" }
              ].map((stat, i) => (
                <div key={i} className="space-y-1.5">
                  <div className="text-2xl sm:text-3xl font-semibold tracking-tight text-white">
                    <AnimatedCounter value={stat.value} />
                  </div>
                  <div className="text-emerald-400 font-medium text-[10px] tracking-[0.2em] uppercase opacity-80">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-32 bg-gradient-to-b from-[#F0FDF4] to-white relative overflow-hidden border-y border-emerald-100/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              className="text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-900 mb-6"
            >
              How It Works
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ delay: 0.1 }}
              className="text-lg sm:text-xl text-slate-500 font-medium leading-relaxed max-w-2xl mx-auto"
            >
              A beautifully simple, transparent process to get food to those who need it most.
            </motion.p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 lg:gap-16 relative mt-12">
            {[
              { title: "1. Post Donation", desc: "Donors post details about available surplus food, including quantity, type, and pickup location." },
              { title: "2. Claim & Collect", desc: "Nearby approved NGOs are notified and can claim the donation for immediate pickup." },
              { title: "3. Share Proof", desc: "NGOs distribute the food and upload proof photos, notifying donors that their food made an impact." }
            ].map((step, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: i * 0.15, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="bg-white p-8 sm:p-10 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_60px_rgba(16,185,129,0.08)] border border-slate-100 transition-all duration-500 relative group transform hover:-translate-y-2 z-10 flex flex-col items-center text-center"
              >
                <div className="text-emerald-500 font-extrabold text-5xl mb-6 tracking-tighter opacity-80 group-hover:opacity-100 transition-opacity duration-300">
                  {i + 1}
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-4 tracking-tight">{step.title.split('. ')[1]}</h3>
                <p className="text-slate-500 text-base font-medium leading-relaxed">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>



      <footer className="bg-white py-8 border-t border-slate-100 text-center">
        <p className="text-slate-500 text-sm font-medium tracking-wide">© 2026 Food Relief Platform. All rights reserved.</p>
      </footer>
    </div>
  );
}
