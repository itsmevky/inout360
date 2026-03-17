import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield, Lock, Activity, Smartphone, AlertTriangle,
  CheckCircle, Zap, Eye, Building2, Factory, Landmark,
  Microscope, Truck, GraduationCap, Menu, X,
  Network, Database, Cloud, LockKeyhole, Cpu, Globe, ArrowRight, Users
} from "lucide-react";
import pidliteLogo from "../Images/PIL.png";
import heroSecurity from "../Images/hero_secure_final.png";
import dashboardMockup from "../Images/dashboard_actual.png";
import { toast } from "react-toastify";
import { postData } from "../Helpers/api.js";


// Reusable Animation Variants
const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.15 } }
};

const DashboardPreview = () => {
  return (
    <div className="w-full bg-white rounded-3xl overflow-hidden shadow-2xl flex border border-slate-200">
      <img
        src={dashboardMockup}
        alt="PIL Dashboard Control Center"
        className="w-full h-auto object-cover"
      />
    </div>
  );
};

const Home = () => {
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    company: "",
    email: "",
    message: "",
    requestDemo: false
  });


  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.company || !formData.email) {
      toast.error("Please fill in all required fields.");
      return;
    }

    setIsSubmitting(true);
    try {
      const resp = await postData("/demoResponse/submit", formData);
      if (resp.status) {
        toast.success(resp.message || "Request submitted successfully!");
        setFormData({
          name: "",
          company: "",
          email: "",
          message: "",
          requestDemo: false
        });
      } else {
        toast.error(resp.data.message || "Something went wrong.");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to submit request.");
    } finally {
      setIsSubmitting(false);
    }
  };


  // Features Data
  const features = [
    { icon: <Lock className="w-8 h-8" />, title: "Camera Restriction", desc: "Policy-driven camera blocking to prevent unauthorized visual data recording." },
    { icon: <Activity className="w-8 h-8" />, title: "Automated Attendance", desc: "Real-time login/logout tracking with QR and location-based validation." },
    { icon: <Users className="w-8 h-8" />, title: "Visitor Management", desc: "Seamless guest check-ins, badge generation, and activity monitoring." },
    { icon: <Smartphone className="w-8 h-8" />, title: "MDM Integration", desc: "Manage device settings and security protocols via centralized policies." },
    { icon: <AlertTriangle className="w-8 h-8" />, title: "Instant Security Alerts", desc: "Automated notifications for policy breaches and restricted area access." },
    { icon: <Shield className="w-8 h-8" />, title: "Compliance Auditing", desc: "Comprehensive logs for Contractors, Employees, and Managers for audit-ready reporting." }
  ];

  // Industries Data
  const industries = [
    { icon: <Factory className="w-10 h-10" />, name: "Manufacturing" },
    { icon: <Building2 className="w-10 h-10" />, name: "Corporate Offices" },
    { icon: <Landmark className="w-10 h-10" />, name: "Government" },
    { icon: <Microscope className="w-10 h-10" />, name: "Pharma" },
    { icon: <GraduationCap className="w-10 h-10" />, name: "Education" },
    { icon: <Truck className="w-10 h-10" />, name: "Logistics" }
  ];

  // Particle Background Component (Light Theme)
  const ParticleBackground = () => {
    return (
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#f1f5f9_1px,transparent_1px),linear-gradient(to_bottom,#f1f5f9_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-60"></div>
        {/* Animated soft orbs */}
        <motion.div
          animate={{ x: [0, 50, 0], y: [0, -30, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute top-1/4 -left-20 w-96 h-96 bg-blue-100 rounded-full blur-[100px] opacity-60"
        />
        <motion.div
          animate={{ x: [0, -50, 0], y: [0, 30, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-1/4 right-0 w-96 h-96 bg-indigo-100 rounded-full blur-[100px] opacity-60"
        />
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 font-['Inter',_sans-serif] selection:bg-blue-600 selection:text-white overflow-x-hidden">

      {/* MODERN BEAUTIFUL HEADER */}
      <header className={`fixed top-0 w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-white/95 backdrop-blur-md border-b border-slate-200 py-3 shadow-md' : 'bg-white/80 backdrop-blur-sm border-b border-transparent py-5 shadow-sm'}`}>
        <div className="w-full mx-auto px-6 md:px-12 lg:px-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => navigate("/")}>
            <div className="relative">
              <div className="absolute inset-0 bg-blue-100 rounded-full blur opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <img
                src={pidliteLogo}
                alt="PIL Logo"
                className="h-12 w-auto object-contain relative z-10 transition-transform duration-300 group-hover:scale-105"
              />
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex flex-wrap justify-end gap-3 lg:gap-4 items-center">
            <button
              onClick={() => navigate("/app-qr")}
              className="px-6 py-2.5 bg-slate-50 hover:bg-blue-50 text-slate-700 hover:text-blue-600 font-bold rounded-xl border border-slate-200 hover:border-blue-200 transition-all duration-300 shadow-sm text-sm"
            >
              Get App
            </button>
            <button
              onClick={() => navigate("/qr-login")}
              className="px-6 py-2.5 bg-blue-50 text-blue-600 font-bold rounded-xl border border-blue-100 hover:bg-blue-100 transition-all duration-300 shadow-sm text-sm"
            >
              QR Login
            </button>
            <button
              onClick={() => navigate("/vendor-register")}
              className="px-6 py-2.5 bg-slate-50 hover:bg-blue-50 text-slate-700 hover:text-blue-600 font-bold rounded-xl border border-slate-200 hover:border-blue-200 transition-all duration-300 shadow-sm text-sm"
            >
              Vendor Register
            </button>

            <button
              onClick={() => {
                localStorage.removeItem("accesstoken");
                localStorage.removeItem("refreshtoken");
                Cookies.remove("accesstoken");
                Cookies.remove("refreshtoken");
                navigate("/login");
              }}
              className="px-8 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-200 hover:shadow-blue-300 hover:-translate-y-0.5 transition-all duration-300 text-sm"
            >
              Sign In
            </button>
          </div>

          {/* Mobile Menu Toggle */}
          <div className="md:hidden flex items-center">
            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-slate-700 p-2 focus:outline-none">
              {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Dropdown */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-white/95 backdrop-blur-md border-t border-slate-200 overflow-hidden"
            >
              <div className="flex flex-col gap-3 px-6 py-6">
                <button
                  onClick={() => { setIsMobileMenuOpen(false); navigate("/app-qr"); }}
                  className="w-full text-center px-6 py-3 bg-slate-50 text-slate-700 font-bold rounded-xl border border-slate-200 text-base"
                >
                  Get App
                </button>
                <button
                  onClick={() => { setIsMobileMenuOpen(false); navigate("/qr-login"); }}
                  className="w-full text-center px-6 py-3 bg-blue-50 text-blue-600 font-bold rounded-xl border border-blue-100 text-base"
                >
                  QR Login
                </button>
                <button
                  onClick={() => { setIsMobileMenuOpen(false); navigate("/vendor-register"); }}
                  className="w-full text-center px-6 py-3 bg-slate-50 text-slate-700 font-bold rounded-xl border border-slate-200 text-base"
                >
                  Vendor Register
                </button>
                <button
                  onClick={() => {
                    localStorage.removeItem("accesstoken");
                    localStorage.removeItem("refreshtoken");
                    Cookies.remove("accesstoken");
                    Cookies.remove("refreshtoken");
                    setIsMobileMenuOpen(false);
                    navigate("/login");
                  }}
                  className="w-full text-center px-6 py-3 bg-blue-600 text-white font-bold rounded-xl shadow-md shadow-blue-200 text-base"
                >
                  Sign In
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* 1. HERO SECTION */}
      <section className="relative min-h-screen flex items-center pt-32 pb-20 overflow-hidden">
        <ParticleBackground />

        <div className="w-full  mx-auto px-6 md:px-12 lg:px-16 relative z-10 flex flex-col items-center text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="flex flex-col items-center mb-16"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-xs font-bold uppercase tracking-widest mb-8">
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
              Next-Gen Security Platform
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-slate-900 mb-8 leading-[1.1] tracking-tight">
              Next-Gen Security & <br className="hidden md:block" />
              <span className="text-blue-600">
                Advanced Intelligence
              </span>
            </h1>

            <p className="text-2xl text-slate-700 mb-12 max-w-3xl font-medium leading-relaxed">
              Complete Control Over Device Security, Cameras, and Workspace Compliance. The ultimate real-time monitoring and restriction platform.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 border-b border-transparent w-full">
              <button 
                onClick={() => document.getElementById("request-demo")?.scrollIntoView({ behavior: 'smooth' })}
                className="w-full sm:w-auto px-10 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-lg transition-all shadow-lg shadow-blue-200 flex items-center justify-center gap-3"
              >
                Request Demo
                <ArrowRight size={20} />
              </button>
              <button className="w-full sm:w-auto px-10 py-4 bg-white hover:bg-slate-50 border-2 border-slate-200 text-slate-700 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-3">
                Contact Sales
              </button>
            </div>
          </motion.div>

          {/* Dashboard Mockup - Center aligned */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="relative perspective-1000 w-full max-w-4xl"
          >
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              className="relative rounded-[2rem] overflow-hidden shadow-2xl border-[8px] border-slate-100 bg-white"
            >
              <img
                src={heroSecurity}
                alt="PIL Security Restriction"
                className="w-full h-auto object-cover"
              />
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* 2. ABOUT PIL SECTION */}
      <section id="platform" className="py-28 relative overflow-hidden bg-gradient-to-b from-white via-[#f0f7ff] to-[#e4f0ff]">

        {/* Magical Background Waves & Sparkles */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden flex items-center justify-center z-0">
          {/* Ambient Glows */}
          <div className="absolute top-[30%] left-[10%] w-[500px] h-[500px] bg-blue-300/20 rounded-full blur-[100px]"></div>
          <div className="absolute bottom-[10%] right-[10%] w-[600px] h-[600px] bg-indigo-300/20 rounded-full blur-[120px]"></div>
          <div className="absolute top-[50%] left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-blue-200/30 rounded-full blur-[80px]"></div>

          {/* Sweeping Arcs (Simulated with curved SVG) */}
          <svg className="absolute top-[40%] left-[-10%] w-[120%] h-[400px] text-white/50 animate-[pulse_6s_ease-in-out_infinite]" fill="none" viewBox="0 0 1200 400" preserveAspectRatio="none">
            <path d="M0,200 C300,100 400,300 600,200 C800,100 900,300 1200,200" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeDasharray="10 20" className="opacity-40" />
            <path d="M0,250 C250,350 350,150 600,250 C850,350 950,150 1200,250" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="opacity-60" />
            <path d="M0,150 C400,50 500,350 800,150 C1000,50 1100,250 1200,150" stroke="#93c5fd" strokeWidth="1" strokeLinecap="round" className="opacity-30" />
          </svg>

          {/* Sparkles */}
          <div className="absolute top-[25%] left-[20%] w-3 h-3 rounded-full bg-white shadow-[0_0_20px_5px_rgba(255,255,255,1)] animate-pulse"></div>
          <div className="absolute top-[45%] right-[25%] w-2 h-2 rounded-full bg-white shadow-[0_0_15px_3px_rgba(255,255,255,1)] animate-[pulse_3s_ease-in-out_infinite]"></div>
          <div className="absolute bottom-[35%] left-[30%] w-1.5 h-1.5 rounded-full bg-blue-300 shadow-[0_0_10px_2px_rgba(147,197,253,1)] animate-[pulse_4s_ease-in-out_infinite]"></div>
          <div className="absolute top-[60%] right-[15%] w-2.5 h-2.5 rounded-full bg-blue-200 shadow-[0_0_15px_4px_rgba(191,219,254,1)] animate-[pulse_2s_ease-in-out_infinite]"></div>
        </div>

        <div className="w-full mx-auto px-6 md:px-12 lg:px-16 flex flex-col items-center text-center relative z-10 ">

          <div className="mb-20 max-w-4xl">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black mb-8 text-slate-800 tracking-tight drop-shadow-sm">
              Empowering Security with <span className="text-blue-600">PIL (Policy-Driven Information Lock)</span>
            </h2>
            <p className="text-slate-700 text-lg md:text-xl lg:text-2xl leading-relaxed font-medium drop-shadow-sm max-w-3xl mx-auto">
              PIL (Policy-Driven Information Lock) is a comprehensive ecosystem designed for the modern workspace. From automated attendance to military-grade camera restrictions, we provide everything needed for a secure and efficient environment.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12 w-full items-end pb-8">

            {/* Card 1: MDM Integration */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: 0.1, duration: 0.6 }}
              className="p-8 md:p-10 rounded-[2.5rem] bg-white/70 backdrop-blur-xl border-2 border-white shadow-[rgba(100,150,250,0.15)_0px_30px_60px_-15px] hover:shadow-[rgba(100,150,250,0.25)_0px_40px_70px_-15px] hover:-translate-y-2 transition-all duration-500 flex flex-col items-center group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-t from-blue-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

              {/* Layered 3D Icon Simulation */}
              <div className="relative w-32 h-32 mb-8 flex justify-center items-center group-hover:scale-105 transition-transform duration-500 z-10">
                <div className="absolute inset-0 bg-blue-300 blur-2xl opacity-30 group-hover:opacity-50 transition-opacity"></div>
                <div className="absolute top-2 left-0 text-slate-300/80 drop-shadow-xl animate-[spin_30s_linear_infinite]"><Network className="w-16 h-16" strokeWidth={1.5} /></div>
                <Smartphone className="w-20 h-20 text-blue-500 drop-shadow-2xl absolute bottom-0 right-4" fill="currentColor" stroke="white" strokeWidth={1} />
                <LockKeyhole className="w-14 h-14 text-indigo-400 drop-shadow-lg absolute bottom-2 left-2" fill="currentColor" stroke="white" strokeWidth={1.5} />
              </div>

              <h3 className="text-2xl font-black mb-5 text-slate-800 tracking-tight relative z-10">QR Attendance system</h3>
              <p className="text-slate-600 leading-relaxed text-[1.05rem] font-medium relative z-10">Seamless and touchless attendance management for employees and visitors through secure QR-based login/logout.</p>
            </motion.div>

            {/* Card 2: Compliance Ready (Elevated) */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="p-8 md:p-12 rounded-[2.5rem] bg-white/80 backdrop-blur-2xl border-2 border-white shadow-[rgba(100,150,250,0.2)_0px_40px_80px_-20px] hover:shadow-[rgba(100,150,250,0.3)_0px_50px_90px_-20px] hover:-translate-y-3 transition-all duration-500 flex flex-col items-center group relative overflow-hidden md:-translate-y-6 md:hover:-translate-y-9 z-20"
            >
              <div className="absolute inset-0 bg-gradient-to-t from-blue-100/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

              {/* Layered 3D Icon Simulation */}
              <div className="relative w-40 h-40 mb-8 flex justify-center items-center group-hover:scale-105 transition-transform duration-500 z-10">
                <div className="absolute inset-0 bg-blue-400 blur-2xl opacity-40 group-hover:opacity-60 transition-opacity"></div>
                <div className="absolute opacity-80"><img src="https://cdn-icons-png.flaticon.com/512/8148/8148819.png" alt="documents" className="w-24 h-24 object-contain opacity-20 drop-shadow-lg" style={{ filter: 'grayscale(100%) blur(1px)' }} /></div>
                <Shield className="w-28 h-28 text-blue-500 drop-shadow-2xl absolute top-0" fill="currentColor" stroke="white" strokeWidth={1} />
                <CheckCircle className="w-12 h-12 text-white drop-shadow-lg absolute top-8" fill="white" stroke="#3b82f6" strokeWidth={2} />
                <div className="absolute bottom-4 right-0 transform rotate-12 bg-white rounded-full shadow-lg p-2"><CheckCircle className="w-8 h-8 text-yellow-400" fill="currentColor" stroke="white" strokeWidth={1} /></div>
              </div>

              <h3 className="text-[1.7rem] font-black mb-5 text-slate-800 tracking-tight relative z-10">Premises Restrictions</h3>
              <p className="text-slate-600 leading-relaxed text-[1.05rem] font-medium relative z-10">Policy-based automated blocking of cameras and apps like Facebook strictly within the organization's premises.</p>
            </motion.div>

            {/* Card 3: Data Encryption */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="p-8 md:p-10 rounded-[2.5rem] bg-white/70 backdrop-blur-xl border-2 border-white shadow-[rgba(100,150,250,0.15)_0px_30px_60px_-15px] hover:shadow-[rgba(100,150,250,0.25)_0px_40px_70px_-15px] hover:-translate-y-2 transition-all duration-500 flex flex-col items-center group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-t from-blue-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

              {/* Layered 3D Icon Simulation */}
              <div className="relative w-32 h-32 mb-8 flex justify-center items-center group-hover:scale-105 transition-transform duration-500 z-10">
                <div className="absolute inset-0 bg-blue-300 blur-2xl opacity-30 group-hover:opacity-50 transition-opacity"></div>
                <Database className="w-20 h-20 text-blue-400 drop-shadow-2xl absolute bottom-0 left-2" fill="currentColor" stroke="white" strokeWidth={1} />
                <Lock className="w-16 h-16 text-blue-600 drop-shadow-xl absolute top-2 right-2" fill="currentColor" stroke="white" strokeWidth={1.5} />
              </div>

              <h3 className="text-2xl font-black mb-5 text-slate-800 tracking-tight relative z-10">MDM & App Control</h3>
              <p className="text-slate-600 leading-relaxed text-[1.05rem] font-medium relative z-10">Centralized mobile device management to push restrictions and monitor compliance across registered devices.</p>
            </motion.div>

          </div>
        </div>
      </section>

      {/* 3. WHY CHOOSE US */}
      <section id="solutions" className="py-28 relative overflow-hidden bg-gradient-to-br from-[#eaf4ff] via-[#dcedff] to-[#eaf4ff]">

        {/* Magical / Snowy Background Orbs and Textures */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden flex items-center justify-center z-0">
          {/* Glowing Ambient Clouds */}
          <div className="absolute top-[0%] left-[10%] w-[600px] h-[600px] bg-white/60 rounded-full blur-[100px]"></div>
          <div className="absolute bottom-[20%] right-[5%] w-[700px] h-[700px] bg-blue-200/40 rounded-full blur-[120px]"></div>
          <div className="absolute top-[40%] left-1/2 -translate-x-1/2 w-[1000px] h-[400px] bg-white/50 rounded-full blur-[100px]"></div>

          {/* Sweeping Arcs (Simulated with curved SVG) */}
          <svg className="absolute top-[30%] left-[-10%] w-[120%] h-[500px] text-white/50" fill="none" viewBox="0 0 1200 500" preserveAspectRatio="none">
            <path d="M0,250 C300,100 400,400 600,250 C800,100 900,400 1200,250" stroke="currentColor" strokeWidth="6" strokeLinecap="round" className="opacity-40 animate-[pulse_6s_ease-in-out_infinite]" />
            <path d="M0,300 C250,450 350,150 600,300 C850,450 950,150 1200,300" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="opacity-60" />
            <path d="M0,200 C400,50 500,450 800,200 C1000,50 1100,350 1200,200" stroke="#bfdbfe" strokeWidth="1.5" strokeLinecap="round" className="opacity-50" />
            <path d="M0,350 C400,200 600,500 900,350 C1100,250 1150,450 1200,350" stroke="#e0f2fe" strokeWidth="3" strokeLinecap="round" className="opacity-50" />
          </svg>

          {/* Sparkles / Snowflakes */}
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-white animate-pulse"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                width: `${Math.random() * 4 + 2}px`,
                height: `${Math.random() * 4 + 2}px`,
                boxShadow: `0 0 ${Math.random() * 10 + 5}px ${Math.random() * 2 + 1}px rgba(255,255,255,1)`,
                animationDuration: `${Math.random() * 3 + 2}s`
              }}
            ></div>
          ))}
        </div>

        <div className="w-full mx-auto px-6 md:px-12 lg:px-16 flex flex-col items-center text-center relative z-10">

          <div className="mb-20 max-w-3xl">
            <h2 className="text-4xl md:text-5xl lg:text-[3.5rem] font-black mb-6 text-slate-800 tracking-tight drop-shadow-sm">
              Why Choose <span className="text-blue-600">Us</span>
            </h2>
            <p className="text-slate-700 text-xl md:text-2xl font-medium drop-shadow-sm max-w-2xl mx-auto">
              Unmatched capabilities for enterprise surveillance management.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10 w-full mb-10">

            {/* 1. Military-Grade Encryption */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: 0.1, duration: 0.5 }}
              className="p-8 md:p-10 rounded-3xl bg-white/60 backdrop-blur-xl border-2 border-white shadow-[0_8px_32px_0_rgba(150,180,250,0.15)] hover:shadow-[0_8px_32px_0_rgba(150,180,250,0.3)] hover:-translate-y-1 transition-all duration-300 flex flex-col items-center group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-t from-white/80 to-transparent"></div>

              <div className="relative w-36 h-36 mb-8 flex justify-center items-center group-hover:scale-105 transition-transform duration-500 z-10">
                <div className="absolute inset-0 bg-blue-300 blur-2xl opacity-40"></div>
                {/* 3D Representation */}
                <div className="relative">
                  <div className="absolute -left-8 top-6 transform -rotate-12 bg-gradient-to-b from-blue-300 to-blue-500 p-4 rounded-3xl text-white shadow-xl border border-blue-200/50 opacity-90"><Lock className="w-8 h-8" /></div>
                  <Shield className="w-28 h-28 text-blue-500 drop-shadow-2xl relative z-10" fill="currentColor" stroke="white" strokeWidth={1} />
                  <div className="absolute inset-0 flex items-center justify-center z-20 top-2">
                    <Lock className="w-10 h-10 text-white drop-shadow-md" />
                  </div>
                </div>
              </div>

              <h3 className="text-xl md:text-2xl font-black mb-4 text-slate-800 relative z-10">{features[0].title}</h3>
              <p className="text-slate-600 leading-relaxed font-medium relative z-10">{features[0].desc}</p>
            </motion.div>

            {/* 2. Real-Time Monitoring */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="p-8 md:p-10 rounded-3xl bg-white/60 backdrop-blur-xl border-2 border-white shadow-[0_8px_32px_0_rgba(150,180,250,0.15)] hover:shadow-[0_8px_32px_0_rgba(150,180,250,0.3)] hover:-translate-y-1 transition-all duration-300 flex flex-col items-center group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-t from-white/80 to-transparent"></div>

              <div className="relative w-40 h-36 mb-8 flex justify-center items-center group-hover:scale-105 transition-transform duration-500 z-10">
                <div className="absolute inset-0 bg-blue-300 blur-2xl opacity-40"></div>
                {/* 3D Representation */}
                <div className="relative w-full h-full flex items-center justify-center mt-2">
                  <div className="absolute -left-6 bg-gradient-to-b from-slate-700 to-slate-900 border-2 border-slate-600 rounded-lg p-2 shadow-xl opacity-90 w-20 h-16 flex items-center justify-center transform -rotate-6"><Activity className="w-8 h-8 text-blue-400" /></div>
                  <div className="absolute right-0 bg-gradient-to-b from-blue-500 to-blue-700 border-4 border-slate-300 rounded-xl p-2 shadow-2xl z-10 w-28 h-20 flex items-center justify-center"><Activity className="w-12 h-12 text-white" /></div>
                  <Shield className="w-10 h-10 text-blue-400 drop-shadow-xl absolute -bottom-4 z-20 left-12" fill="currentColor" stroke="white" strokeWidth={1.5} />
                </div>
              </div>

              <h3 className="text-xl md:text-2xl font-black mb-4 text-slate-800 relative z-10">{features[1].title}</h3>
              <p className="text-slate-600 leading-relaxed font-medium relative z-10">{features[1].desc}</p>
            </motion.div>

            {/* 3. Performance Analytics */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="p-8 md:p-10 rounded-3xl bg-white/60 backdrop-blur-xl border-2 border-white shadow-[0_8px_32px_0_rgba(150,180,250,0.15)] hover:shadow-[0_8px_32px_0_rgba(150,180,250,0.3)] hover:-translate-y-1 transition-all duration-300 flex flex-col items-center group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-t from-white/80 to-transparent"></div>

              <div className="relative w-36 h-36 mb-8 flex justify-center items-center group-hover:scale-105 transition-transform duration-500 z-10">
                <div className="absolute inset-0 bg-blue-300 blur-2xl opacity-40"></div>
                {/* 3D Representation */}
                <div className="relative w-full h-full flex items-center justify-center">
                  <div className="absolute left-0 top-2 bg-gradient-to-br from-blue-400 to-blue-600 w-20 h-28 rounded-lg shadow-xl border-t-2 border-blue-200 opacity-90"></div>
                  <div className="absolute left-6 top-6 bg-slate-800 w-16 h-24 rounded shadow-2xl border-4 border-slate-600 z-10 flex text-center justify-center items-center"><Users className="text-blue-400" /></div>
                  <div className="absolute right-0 top-14 bg-gradient-to-b from-blue-400 to-blue-700 w-16 h-16 rounded-full shadow-2xl z-20 border-4 border-blue-300 flex items-center justify-center"><div className="w-8 h-8 rounded-full bg-blue-900 absolute -bottom-8 -right-8 transform -rotate-45 w-2 h-10"></div></div>
                </div>
              </div>

              <h3 className="text-xl md:text-2xl font-black mb-4 text-slate-800 relative z-10">{features[2].title}</h3>
              <p className="text-slate-600 leading-relaxed font-medium relative z-10">{features[2].desc}</p>
            </motion.div>

            {/* 4. Remote Device Control */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="p-8 md:p-10 rounded-3xl bg-white/60 backdrop-blur-xl border-2 border-white shadow-[0_8px_32px_0_rgba(150,180,250,0.15)] hover:shadow-[0_8px_32px_0_rgba(150,180,250,0.3)] hover:-translate-y-1 transition-all duration-300 flex flex-col items-center group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-t from-white/80 to-transparent"></div>

              <div className="relative w-36 h-36 mb-8 flex justify-center items-center group-hover:scale-105 transition-transform duration-500 z-10">
                <div className="absolute inset-0 bg-blue-300 blur-2xl opacity-40"></div>
                {/* 3D Representation */}
                <div className="relative flex items-end">
                  <div className="relative bg-gradient-to-br from-blue-400 to-blue-600 w-16 h-28 rounded-xl shadow-xl border-t-2 border-blue-300 flex items-center justify-center"><Lock className="text-blue-200" /></div>
                  <div className="relative bg-white w-16 h-24 rounded-xl shadow-2xl border-4 border-blue-200 z-10 -ml-6 mb-2 flex flex-col items-center justify-center"><div className="w-10 h-10 bg-blue-500 rounded flex items-center justify-center"><Lock className="text-white w-6 h-6" /></div></div>
                </div>
              </div>

              <h3 className="text-xl md:text-2xl font-black mb-4 text-slate-800 relative z-10">{features[3].title}</h3>
              <p className="text-slate-600 leading-relaxed font-medium relative z-10">{features[3].desc}</p>
            </motion.div>

            {/* 5. Instant Alerts */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="p-8 md:p-10 rounded-3xl bg-white/60 backdrop-blur-xl border-2 border-white shadow-[0_8px_32px_0_rgba(150,180,250,0.15)] hover:shadow-[0_8px_32px_0_rgba(150,180,250,0.3)] hover:-translate-y-1 transition-all duration-300 flex flex-col items-center group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-t from-white/80 to-transparent"></div>

              <div className="relative w-36 h-36 mb-8 flex justify-center items-center group-hover:scale-105 transition-transform duration-500 z-10">
                <div className="absolute inset-0 bg-blue-300 blur-2xl opacity-40"></div>
                {/* 3D Representation */}
                <div className="relative">
                  <div className="bg-white rounded-3xl shadow-2xl border-4 border-blue-100 p-8">
                    <AlertTriangle className="w-16 h-16 text-blue-500" strokeWidth={2.5} />
                  </div>
                </div>
              </div>

              <h3 className="text-xl md:text-2xl font-black mb-4 text-slate-800 relative z-10">{features[4].title}</h3>
              <p className="text-slate-600 leading-relaxed font-medium relative z-10">{features[4].desc}</p>
            </motion.div>

            {/* 6. Compliance-Ready */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: 0.6, duration: 0.5 }}
              className="p-8 md:p-10 rounded-3xl bg-white/60 backdrop-blur-xl border-2 border-white shadow-[0_8px_32px_0_rgba(150,180,250,0.15)] hover:shadow-[0_8px_32px_0_rgba(150,180,250,0.3)] hover:-translate-y-1 transition-all duration-300 flex flex-col items-center group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-t from-white/80 to-transparent"></div>

              <div className="relative w-44 h-36 mb-8 flex justify-center items-center group-hover:scale-105 transition-transform duration-500 z-10 mt-6">
                <div className="absolute inset-0 bg-blue-300 blur-2xl opacity-40"></div>
                {/* 3D Representation */}
                <div className="relative w-full h-full flex items-center justify-center">
                  <div className="absolute right-4 top-2 bg-gradient-to-br from-blue-100 to-white w-20 h-24 rounded shadow-xl border-2 border-white opacity-90 transform rotate-12 flex flex-col items-center pt-2 gap-1 text-blue-300"><div className="w-12 h-2 bg-blue-200"></div><div className="w-12 h-2 bg-blue-200"></div><div className="w-12 h-2 bg-blue-200"></div></div>
                  <div className="absolute left-8 top-0 bg-gradient-to-b from-blue-100 to-blue-200 w-24 h-28 rounded border-4 border-white shadow-2xl z-10 pt-4 flex flex-col gap-2 p-2">
                    <div className="flex gap-2"><CheckCircle className="w-4 h-4 text-blue-500" /><div className="w-10 h-2 bg-white mt-1"></div></div>
                    <div className="flex gap-2"><CheckCircle className="w-4 h-4 text-blue-500" /><div className="w-10 h-2 bg-white mt-1"></div></div>
                    <div className="flex gap-2"><CheckCircle className="w-4 h-4 text-blue-500" /><div className="w-10 h-2 bg-white mt-1"></div></div>
                  </div>
                  <Shield className="w-20 h-20 text-blue-500 drop-shadow-2xl absolute -top-12 z-20 left-10" fill="currentColor" stroke="white" strokeWidth={1} />
                  <div className="absolute -top-6 left-16 z-30 pt-[3px] pr-[1px]"><Shield className="w-6 h-6 text-white" fill="white" /></div>
                </div>
              </div>

              <h3 className="text-xl md:text-2xl font-black mb-4 text-slate-800 relative z-10">{features[5].title}</h3>
              <p className="text-slate-600 leading-relaxed font-medium relative z-10">{features[5].desc}</p>
            </motion.div>

          </div>
        </div>
      </section>

      {/* 4. SECURITY ARCHITECTURE */}
      <section id="architecture" className="py-24 relative bg-slate-900 text-white overflow-hidden rounded-[2.5rem] mx-6 md:mx-12 lg:mx-24 my-10 shadow-2xl">
        <div className="absolute left-0 top-0 w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="w-full  mx-auto px-8 md:px-16 lg:px-20 relative z-10 flex flex-col items-center text-center">
          <div className="max-w-4xl mb-16">
            <h2 className="text-4xl md:text-5xl font-black mb-6">Security <span className="text-blue-400">Architecture</span></h2>
            <p className="text-slate-300 text-xl font-medium">A multi-layered defense system connecting your devices to our global intelligence cloud.</p>
          </div>

          <div className="max-w-4xl w-full flex flex-col items-center gap-6">
            {[
              { icon: <Cloud />, name: "Cloud Intelligence", desc: "Global Threat Analysis & Reporting" },
              { icon: <Cpu />, name: "Control Engine", desc: "Policy Enforcement & MDM Sync" },
              { icon: <Eye />, name: "Monitoring Layer", desc: "Real-time Feed & Anomaly Detection" },
              { icon: <Smartphone />, name: "Device Layer", desc: "Cameras, Smartphones, IoT Endpoints" },
            ].map((layer, idx) => (
              <div key={idx} className="w-full flex justify-center">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.15 }}
                  className="w-full md:w-3/4 p-6 md:p-8 rounded-[2rem] bg-white/5 border border-white/10 flex flex-col sm:flex-row items-center sm:text-left text-center gap-6 hover:bg-white/10 hover:border-blue-500/50 transition-all font-medium"
                >
                  <div className="w-20 h-20 shrink-0 bg-blue-600/20 rounded-2xl flex items-center justify-center text-blue-400 font-black border border-blue-500/30">
                    {React.cloneElement(layer.icon, { className: "w-10 h-10" })}
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold mb-2">{layer.name}</h3>
                    <p className="text-slate-400 text-lg">{layer.desc}</p>
                  </div>
                </motion.div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. PERFORMANCE MONITORING */}
      <section className="py-20 bg-white border-y border-slate-100">
        <div className="w-full  mx-auto px-6 md:px-12 lg:px-16">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
            {[
              { label: "Uptime guarantee", value: "99.9%" },
              { label: "Devices Monitored", value: "10,000+" },
              { label: "Active Monitoring", value: "24/7" },
              { label: "Alert Response Time", value: "<1s" },
            ].map((stat, i) => (
              <div key={i} className="text-center py-6 flex flex-col items-center">
                <div className="text-6xl font-black text-slate-900 mb-6 tracking-tight">{stat.value}</div>
                <div className="text-blue-600 font-bold uppercase tracking-widest text-sm md:text-base">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. HOW IT WORKS TIMELINE */}
      <section className="py-32 relative bg-slate-50 flex flex-col items-center overflow-hidden">
        <div className="w-full  mx-auto px-6 md:px-12 lg:px-16 flex flex-col items-center">
          <div className="mb-24 max-w-3xl text-center">
            <h2 className="text-4xl md:text-5xl font-black mb-6 text-slate-900">How It <span className="text-blue-600">Works</span></h2>
            <p className="text-slate-600 text-xl md:text-2xl font-medium">From deployment to active monitoring in a streamlined, frictionless process.</p>
          </div>

          <div className="relative w-full max-w-4xl mx-auto flex flex-col items-center">
            <div className="absolute left-6 md:left-1/2 top-4 bottom-4 w-1.5 bg-gradient-to-b from-blue-200 via-indigo-200 to-transparent md:-translate-x-1/2 hidden sm:block"></div>

            {[
              { title: "Device Enrollment", desc: "Auto-provision devices via Zero-Touch or MDM profiles instantly." },
              { title: "Policy Configuration", desc: "Define geofences, time-based restrictions, and rigorous camera usage rules." },
              { title: "Camera Monitoring", desc: "Continuous state monitoring for unauthorized camera activation across the fleet." },
              { title: "Alert & Reporting", desc: "Instantly flag policy breaches to the central security console for rapid response." },
              { title: "Compliance Audit Logs", desc: "Generate immutable logs ready for automatic enterprise compliance reporting." }
            ].map((step, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                className={`relative flex flex-col sm:flex-row items-center w-full mb-16 ${idx % 2 === 0 ? 'sm:flex-row-reverse' : ''}`}
              >
                <div className="w-full sm:w-1/2"></div>

                {/* Timeline Dot */}
                <div className="hidden sm:flex absolute left-1/2 -translate-x-1/2 w-12 h-12 rounded-full bg-white border-4 border-blue-600 shadow-xl items-center justify-center text-blue-600 font-bold z-10">
                  {idx + 1}
                </div>

                <div className="w-full sm:w-1/2 flex justify-center">
                  <div className={`w-full max-w-md p-8 md:p-10 rounded-[2.5rem] bg-white border border-slate-200 shadow-xl hover:-translate-y-2 transition-transform duration-500 text-center ${idx % 2 === 0 ? 'sm:text-left sm:ml-12' : 'sm:text-right sm:mr-12'}`}>
                    <h3 className="text-sm font-black text-blue-600 mb-3 uppercase tracking-widest bg-blue-50 inline-block px-4 py-1.5 rounded-full">Step 0{idx + 1}</h3>
                    <h4 className="text-2xl font-bold mb-4 text-slate-900 mt-2">{step.title}</h4>
                    <p className="text-slate-600 leading-relaxed text-lg">{step.desc}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* DASHBOARD SHOWCASE */}
      <section className="py-24 relative overflow-hidden bg-white">
        <div className="w-full mx-auto px-6 md:px-12 lg:px-16 flex flex-col items-center text-center">
          <div className="max-w-4xl mb-16">
            <h2 className="text-4xl md:text-5xl font-black mb-6 text-slate-800">The <span className="text-blue-600">Command Center</span></h2>
            <p className="text-slate-600 text-xl font-medium">Experience the power of centralized management with our intuitive, feature-rich dashboard.</p>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="w-full max-w-6xl p-4 md:p-8 bg-slate-100 rounded-[3rem] border border-white shadow-[0_50px_100px_-20px_rgba(59,130,246,0.15)]"
          >
            <DashboardPreview />
          </motion.div>
        </div>
      </section>

      {/* 7. INDUSTRIES WE SERVE */}
      <section id="industries" className="py-32 relative overflow-hidden bg-gradient-to-b from-[#f4f9ff] via-white to-[#eef6ff]">
        {/* Abstract Background Vectors imitating the requested image */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden flex items-center justify-center">
          {/* Top Left Decoration */}
          <div className="absolute top-[-5%] left-[-5%] w-[500px] h-[500px] bg-blue-200/40 rounded-full blur-[100px]"></div>
          {/* Bottom Right Decoration */}
          <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-indigo-200/30 rounded-full blur-[120px]"></div>
          {/* Center ambient glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-white/80 rounded-full blur-[100px]"></div>

          {/* Sparkles / Stars */}
          <div className="absolute top-[20%] left-[15%] w-2 h-2 rounded-full bg-white shadow-[0_0_15px_3px_rgba(255,255,255,1)] animate-pulse"></div>
          <div className="absolute top-[10%] right-[30%] w-1.5 h-1.5 rounded-full bg-blue-300 shadow-[0_0_10px_2px_rgba(147,197,253,0.8)] animate-[pulse_3s_ease-in-out_infinite]"></div>
          <div className="absolute top-[40%] right-[10%] w-3 h-3 rounded-full bg-white shadow-[0_0_20px_5px_rgba(255,255,255,1)] animate-[pulse_4s_ease-in-out_infinite]"></div>
          <div className="absolute bottom-[25%] left-[25%] w-2 h-2 rounded-full bg-white shadow-[0_0_15px_3px_rgba(255,255,255,1)] animate-[pulse_2s_ease-in-out_infinite]"></div>
          <div className="absolute bottom-[20%] right-[40%] w-1.5 h-1.5 rounded-full bg-blue-400 shadow-[0_0_10px_2px_rgba(59,130,246,0.6)] animate-pulse"></div>

          {/* Subdued Gear SVG Decoration (Bottom Left) */}
          <svg className="absolute bottom-[-5%] left-[-2%] w-[400px] h-[400px] text-blue-300/10 animate-[spin_60s_linear_infinite]" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19.14,12.94c0.04-0.3,0.06-0.61,0.06-0.94c0-0.32-0.02-0.64-0.06-0.94l2.03-1.58c0.18-0.14,0.23-0.41,0.12-0.61 l-1.92-3.32c-0.12-0.22-0.37-0.29-0.59-0.22l-2.39,0.96c-0.5-0.38-1.03-0.7-1.62-0.94L14.4,2.81c-0.04-0.24-0.24-0.41-0.48-0.41 h-3.84c-0.24,0-0.43,0.17-0.47,0.41L9.25,5.35C8.66,5.59,8.12,5.92,7.63,6.29L5.24,5.33c-0.22-0.08-0.47,0-0.59,0.22L2.73,8.87 C2.62,9.08,2.66,9.34,2.86,9.48l2.03,1.58C4.84,11.36,4.8,11.69,4.8,12s0.02,0.64,0.06,0.94l-2.03,1.58 c-0.18,0.14-0.23,0.41-0.12,0.61l1.92,3.32c0.12,0.22,0.37,0.29,0.59,0.22l2.39-0.96c0.5,0.38,1.03,0.7,1.62,0.94l0.36,2.54 c0.05,0.24,0.24,0.41,0.48,0.41h3.84c0.24,0,0.43-0.17,0.47-0.41l0.36-2.54c0.59-0.24,1.13-0.56,1.62-0.94l2.39,0.96 c0.22,0.08,0.47,0,0.59-0.22l1.92-3.32c0.12-0.22,0.07-0.49-0.12-0.61L19.14,12.94z M12,15.6c-1.98,0-3.6-1.62-3.6-3.6 s1.62-3.6,3.6-3.6s3.6,1.62,3.6,3.6S13.98,15.6,12,15.6z" />
          </svg>

          {/* Floating Circle (Top Right) */}
          <div className="absolute top-[10%] right-[5%] w-32 h-32 rounded-full border-[10px] border-blue-200/20 blur-[2px]"></div>
        </div>

        <div className="w-full mx-auto px-6 md:px-12 lg:px-16 flex flex-col items-center text-center relative z-10">
          <div className="mb-20">
            <h2 className="text-4xl md:text-5xl lg:text-[3.5rem] font-bold mb-6 text-slate-800 tracking-tight">
              Industries We <span className="text-blue-600 font-black">Serve</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8 w-full max-w-6xl">
            {industries.map((industry, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="flex flex-col items-center justify-center py-10 px-8 rounded-3xl bg-white/70 backdrop-blur-md border-2 border-white/80 cursor-pointer group text-center relative overflow-hidden transition-all duration-500 hover:-translate-y-2 hover:bg-white"
                style={{
                  boxShadow: '0 25px 50px -12px rgba(100, 150, 255, 0.2), 0 0 0 1px rgba(255, 255, 255, 1) inset'
                }}
              >
                {/* Glow effect inside card on hover */}
                <div className="absolute inset-0 bg-gradient-to-b from-blue-50/0 to-blue-100/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                <div className="relative text-blue-500/90 mb-5 group-hover:scale-110 transition-all duration-500 z-10">
                  <div className="absolute inset-0 bg-blue-400 blur-xl opacity-0 group-hover:opacity-30 transition-opacity duration-500"></div>
                  {React.cloneElement(industry.icon, {
                    strokeWidth: 1.5,
                    className: "w-16 h-16 md:w-[72px] md:h-[72px] drop-shadow-[0_8px_8px_rgba(59,130,246,0.3)] relative z-10"
                  })}
                </div>
                <h3 className="font-bold text-[1.35rem] text-slate-800 relative z-10 group-hover:text-blue-700 transition-colors duration-300 tracking-tight">
                  {industry.name}
                </h3>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 8. TESTIMONIALS SLIDER */}
      <section className="py-32 relative bg-slate-50 border-y border-slate-200 flex justify-center text-center overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full overflow-hidden pointer-events-none">
          <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-blue-100/50 blur-[120px]"></div>
          <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-indigo-100/50 blur-[120px]"></div>
        </div>

        <div className="w-full mx-auto flex flex-col items-center text-center relative z-10 overflow-hidden">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-xs font-bold uppercase tracking-widest mb-8">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
            Trusted Globally
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-black mb-16 max-w-4xl leading-tight text-slate-900 px-6">
            Securing the world's leading <span className="text-blue-600">enterprise environments.</span>
          </h2>

          <div className="flex overflow-x-auto snap-x snap-mandatory gap-6 md:gap-8 w-full px-6 md:px-12 lg:px-16 pb-16 [&::-webkit-scrollbar]:hidden" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            {[
              {
                quote: "PIL completely transformed how we handle on-premise device restrictions. The MDM integration is flawless and reporting fulfills compliance audits perfectly.",
                name: "Sarah Jenkins",
                role: "CISO",
                company: "Fortune 500 Manufacturing",
                image: "https://randomuser.me/api/portraits/women/44.jpg"
              },
              {
                quote: "We deployed PIL across 15,000 devices globally. The centralized camera control and anomaly detection gave us visibility we didn't even know was possible.",
                name: "David Chen",
                role: "VP of IT Infrastructure",
                company: "Global Financial Services",
                image: "https://randomuser.me/api/portraits/men/32.jpg"
              },
              {
                quote: "The ability to enforce geofenced camera policies within our secure R&D facilities has completely eliminated our visual data exfiltration risks.",
                name: "Marcus Thorne",
                role: "Director of Physical Security",
                company: "Leading Tech Innovator",
                image: "https://randomuser.me/api/portraits/men/86.jpg"
              },
              {
                quote: "The proactive alerts have saved us from countless potential physical data breaches. It's an indispensable part of our zero-trust architecture.",
                name: "Elena Rodriguez",
                role: "Head of Operations",
                company: "Defense Contractor",
                image: "https://randomuser.me/api/portraits/women/68.jpg"
              },
              {
                quote: "Deployment was seamless and integration with our existing SIEM took minutes. Absolute game-changer for strict compliance auditing.",
                name: "James Wilson",
                role: "Compliance Officer",
                company: "Healthcare Solutions",
                image: "https://randomuser.me/api/portraits/men/22.jpg"
              }
            ].map((testimonial, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: idx * 0.1, duration: 0.5 }}
                className="flex-shrink-0 w-[90%] sm:w-[80%] md:w-[calc(50%-16px)] lg:w-[calc(33.333%-22px)] snap-center flex flex-col text-left p-8 md:p-10 rounded-[2rem] bg-white border border-slate-200 hover:border-blue-300 hover:-translate-y-3 hover:shadow-2xl hover:shadow-blue-200 relative group overflow-hidden cursor-grab active:cursor-grabbing transition-all duration-500"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full blur-[50px] opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                <div className="flex text-yellow-400 mb-8 gap-1.5 relative z-10">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M12 .587l3.668 7.568 8.332 1.151-6.064 5.828 1.48 8.279-7.416-3.967-7.417 3.967 1.481-8.279-6.064-5.828 8.332-1.151z" /></svg>
                  ))}
                </div>

                <div className="text-blue-100 mb-6 relative z-10 group-hover:text-blue-200 transition-colors duration-300">
                  <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24"><path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" /></svg>
                </div>

                <p className="text-lg md:text-xl font-medium text-slate-700 mb-10 flex-grow leading-relaxed relative z-10">
                  "{testimonial.quote}"
                </p>

                <div className="flex items-center gap-4 border-t border-slate-100 pt-6 mt-auto relative z-10">
                  <img src={testimonial.image} alt={testimonial.name} className="w-14 h-14 rounded-full border-2 border-slate-100 group-hover:border-blue-500 transition-colors object-cover shadow-sm" />
                  <div>
                    <div className="font-bold text-slate-900 text-lg">{testimonial.name}</div>
                    <div className="text-blue-600 text-sm font-bold">{testimonial.role}</div>
                    <div className="text-slate-500 text-xs uppercase tracking-wider mt-1">{testimonial.company}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Faux Slider Indicators */}
          <div className="flex gap-3 justify-center items-center opacity-80 mt-4">
            <div className="w-10 h-2 rounded-full bg-blue-600 shadow-sm shadow-blue-300"></div>
            <div className="w-3 h-2 rounded-full bg-slate-300"></div>
            <div className="w-3 h-2 rounded-full bg-slate-300"></div>
            <div className="hidden md:block w-3 h-2 rounded-full bg-slate-300"></div>
            <div className="hidden lg:block w-3 h-2 rounded-full bg-slate-300"></div>
          </div>
        </div>
      </section>

      {/* 9. CONTACT US */}
      <section id="request-demo" className="py-24 relative overflow-hidden bg-gradient-to-br from-[#eaf4ff] via-white to-[#e0efff]">

        {/* Magical Background Elements */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden flex items-center justify-center">
          {/* Glowing Ambient Orbs */}
          <div className="absolute top-[10%] left-[20%] w-[600px] h-[600px] bg-blue-300/20 rounded-full blur-[120px]"></div>
          <div className="absolute bottom-[0%] right-[10%] w-[700px] h-[700px] bg-indigo-300/20 rounded-full blur-[150px]"></div>

          {/* Swirling lines (represented via SVGs/CSS sweeps) */}
          <div className="absolute top-[20%] right-[15%] w-[800px] h-[800px] border-[2px] border-white/40 rounded-full opacity-50 blur-[1px]"></div>
          <div className="absolute top-[25%] right-[10%] w-[700px] h-[700px] border-[4px] border-blue-200/30 rounded-full opacity-40 blur-[2px]"></div>

          {/* Sparkles */}
          <div className="absolute top-[30%] left-[40%] w-2 h-2 rounded-full bg-white shadow-[0_0_15px_3px_rgba(255,255,255,1)] animate-pulse"></div>
          <div className="absolute top-[15%] right-[45%] w-1.5 h-1.5 rounded-full bg-blue-300 shadow-[0_0_10px_2px_rgba(147,197,253,1)] animate-[pulse_3s_ease-in-out_infinite]"></div>
          <div className="absolute bottom-[30%] right-[25%] w-3 h-3 rounded-full bg-white shadow-[0_0_20px_5px_rgba(255,255,255,1)] animate-[pulse_4s_ease-in-out_infinite]"></div>
          <div className="absolute top-[50%] left-[10%] w-2 h-2 rounded-full bg-white shadow-[0_0_15px_3px_rgba(255,255,255,1)] animate-[pulse_2s_ease-in-out_infinite]"></div>
          <div className="absolute bottom-[10%] right-[40%] w-1.5 h-1.5 rounded-full bg-blue-400 shadow-[0_0_10px_2px_rgba(59,130,246,1)] animate-pulse"></div>

          {/* Floating Security Icons (Abstracted SVG shapes matching the image) */}
          <div className="absolute top-[15%] right-[30%] opacity-80 animate-[bounce_6s_infinite]">
            <Shield className="w-16 h-16 text-blue-400 drop-shadow-xl" fill="currentColor" stroke="white" strokeWidth="1" />
          </div>
          <div className="absolute bottom-[20%] left-[15%] opacity-70 animate-[bounce_8s_infinite]">
            <Lock className="w-20 h-20 text-indigo-400 drop-shadow-xl" fill="currentColor" stroke="white" strokeWidth="1" />
          </div>
          <div className="absolute top-[40%] right-[8%] opacity-60 animate-[bounce_7s_infinite]">
            <LockKeyhole className="w-14 h-14 text-blue-300 drop-shadow-xl" fill="currentColor" stroke="white" strokeWidth="1" />
          </div>
        </div>

        <div className="w-full mx-auto px-6 md:px-12 lg:px-16 flex flex-col lg:flex-row items-center justify-between gap-16 relative z-10">

          {/* Left Side Content */}
          <div className="w-full lg:w-1/2 flex flex-col items-center lg:items-start text-center lg:text-left z-20">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black mb-6 text-slate-800 leading-[1.15] tracking-tight drop-shadow-sm">
              Ready to fortify your <br className="hidden md:block" />
              <span className="text-blue-600">infrastructure?</span>
            </h2>
            <p className="text-lg md:text-xl text-slate-700 mb-10 font-medium max-w-lg leading-relaxed drop-shadow-sm">
              Speak with our certified security experts to customize a deployment architecture for your organization.
            </p>

            <div className="space-y-4 w-full flex flex-col items-center lg:items-start max-w-lg">
              {[
                "Live Interactive Demo of PIL Platform",
                "Comprehensive Security Architecture Review",
                "Enterprise Compliance Strategy Alignment"
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-4 text-slate-800 text-[1.05rem] font-bold bg-white/70 backdrop-blur-md px-6 py-4 rounded-full border border-white shadow-[0_8px_16px_-6px_rgba(100,150,250,0.15)] w-full justify-start transition-transform hover:-translate-y-1 hover:bg-white duration-300">
                  <div className="w-6 h-6 rounded-full border-2 border-blue-500 flex items-center justify-center shrink-0">
                    <CheckCircle className="w-4 h-4 text-blue-600 shrink-0" strokeWidth={3} />
                  </div>
                  {item}
                </div>
              ))}
            </div>
          </div>

          {/* Right Side Form (Glassmorphism & Large overlapping shield) */}
          <div className="w-full lg:w-5/12 max-w-lg relative mt-16 lg:mt-0 z-20">

            {/* Massive Overlapping Shield (Like the Image) */}
            <div className="absolute -top-16 -right-10 md:right-4 z-30 drop-shadow-[0_20px_20px_rgba(59,130,246,0.4)] animate-[bounce_4s_infinite]">
              <div className="relative">
                <Shield className="w-32 h-32 md:w-40 md:h-40 text-blue-500" fill="currentColor" stroke="white" strokeWidth="1" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <CheckCircle className="w-12 h-12 md:w-16 md:h-16 text-white" fill="white" stroke="#3b82f6" strokeWidth={2} />
                </div>
              </div>
            </div>

            {/* Glowing Backdrop behind the form */}
            <div className="absolute inset-0 bg-blue-300 rounded-[2.5rem] blur-2xl opacity-20 translate-y-4 shadow-xl"></div>

            {/* Premium Glass Form Container */}
            <form onSubmit={handleSubmit} className="relative w-full p-8 md:p-12 rounded-[2.5rem] bg-white/80 backdrop-blur-2xl border-2 border-white/90 shadow-[0_25px_50px_-12px_rgba(100,150,255,0.25)] text-left flex flex-col gap-6">

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="text-xs font-black text-slate-800 mb-2 block uppercase tracking-widest opacity-80">Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full bg-white/60 border border-blue-100/80 rounded-2xl px-5 py-4 text-base text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-inner placeholder:text-slate-400"
                    placeholder="John Doe"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-black text-slate-800 mb-2 block uppercase tracking-widest opacity-80">Company</label>
                  <input
                    type="text"
                    name="company"
                    value={formData.company}
                    onChange={handleInputChange}
                    className="w-full bg-white/60 border border-blue-100/80 rounded-2xl px-5 py-4 text-base text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-inner placeholder:text-slate-400"
                    placeholder="Acme Corp"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-black text-slate-800 mb-2 block uppercase tracking-widest opacity-80">Enterprise Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full bg-white/60 border border-blue-100/80 rounded-2xl px-5 py-4 text-base text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-inner placeholder:text-slate-400"
                  placeholder="name@company.com"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-black text-slate-800 mb-2 block uppercase tracking-widest opacity-80">Project Details</label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  rows="4"
                  className="w-full bg-white/60 border border-blue-100/80 rounded-2xl px-5 py-4 text-base text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-inner resize-none placeholder:text-slate-400"
                  placeholder="Briefly describe your requirements..."
                ></textarea>
              </div>

              <div className="flex items-center gap-4 mt-2">
                <input
                  type="checkbox"
                  id="demo"
                  name="requestDemo"
                  checked={formData.requestDemo}
                  onChange={handleInputChange}
                  className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 transition-all cursor-pointer shadow-sm"
                />
                <label htmlFor="demo" className="text-sm font-bold text-slate-700 leading-none cursor-pointer hover:text-blue-600 transition-colors">I would like to request a live technical demo.</label>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 mt-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-2xl font-black text-lg transition-all shadow-[0_10px_20px_-10px_rgba(37,99,235,0.6)] hover:shadow-[0_15px_25px_-10px_rgba(37,99,235,0.8)] hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Submitting..." : "Submit Request"}
              </button>
            </form>

          </div>
        </div>
      </section>

      {/* 10. FOOTER */}
      <footer className="bg-white border-t border-slate-200 pt-20 pb-10">
        <div className="w-full  mx-auto px-6 md:px-12 lg:px-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
            <div className="col-span-1 md:col-span-1 text-left">
              <div className="flex items-center gap-3 mb-6">
                <img src={pidliteLogo} alt="PIL Logo" className="h-8 w-auto" />
                <span className="text-2xl font-black tracking-tight text-slate-900">PIL</span>
              </div>
              <p className="text-slate-600 text-sm leading-relaxed max-w-xs font-medium">
                Enterprise-grade security and camera intelligence platform. Monitor, restrict, and control with absolute confidence.
              </p>
            </div>

            <div className="text-left">
              <h4 className="font-bold text-slate-900 mb-6 uppercase tracking-wider text-sm">Platform</h4>
              <ul className="flex flex-col gap-4 text-sm text-slate-600 font-medium">
                <li><a href="#" className="hover:text-blue-600 transition-colors">MDM Integration</a></li>
                <li><a href="#" className="hover:text-blue-600 transition-colors">Real-Time Alerts</a></li>
                <li><a href="#" className="hover:text-blue-600 transition-colors">Compliance Audits</a></li>
                <li><a href="#" className="hover:text-blue-600 transition-colors">Analytics Dashboard</a></li>
              </ul>
            </div>

            <div className="text-left">
              <h4 className="font-bold text-slate-900 mb-6 uppercase tracking-wider text-sm">Company</h4>
              <ul className="flex flex-col gap-4 text-sm text-slate-600 font-medium">
                <li><a href="#" className="hover:text-blue-600 transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-blue-600 transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-blue-600 transition-colors">Security Policy</a></li>
                <li><a href="#" className="hover:text-blue-600 transition-colors">Contact</a></li>
              </ul>
            </div>

            <div className="text-left">
              <h4 className="font-bold text-slate-900 mb-6 uppercase tracking-wider text-sm">Legal</h4>
              <ul className="flex flex-col gap-4 text-sm text-slate-600 font-medium">
                <li><a href="/privacypolicy" className="hover:text-blue-600 transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-blue-600 transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-blue-600 transition-colors">Cookie Policy</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-slate-200 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-slate-500 text-sm font-medium">
              © {new Date().getFullYear()} Proactive Intelligence Platform. All rights reserved.
            </p>
            <div className="flex items-center gap-6 text-slate-400">
              <a href="#" className="hover:text-blue-600 hover:scale-110 transition-all"><Globe size={24} /></a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
