import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, useScroll, useSpring } from "framer-motion";
import {
  Shield, Lock, Activity, Smartphone, ArrowRight, Globe, ChevronLeft,
  Mail, FileText, CheckCircle
} from "lucide-react";
import pidliteLogo from "../Images/PIL.png";

const PrivacyPolicy = () => {
  const navigate = useNavigate();
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const fadeInUp = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }
  };

  const sections = [
    {
      title: "Scope",
      icon: <Globe className="text-blue-600" />,
      content: "This policy applies to the PIL (Policy-Driven Information Lock) mobile app, web dashboard, and backend services used to manage employee device access and workplace compliance."
    },
    {
      title: "Data we collect",
      icon: <Activity className="text-blue-600" />,
      list: [
        "Account details: name, employee ID, role, and contact info.",
        "Device identifiers: device ID, model, OS version, app version.",
        "Access events: login/logout time, QR usage, device status.",
        "Location status: entry/exit location and device location (if enabled).",
        "Security metadata: policy state, camera/app restrictions, audit logs."
      ]
    },
    {
      title: "Why we collect it",
      icon: <Shield className="text-blue-600" />,
      list: [
        "Verify employee identity and device ownership.",
        "Enforce workplace security policies automatically.",
        "Maintain attendance and access logs.",
        "Detect abnormal or unauthorized device activity.",
        "Support audits and compliance reporting."
      ]
    },
    {
      title: "How the system works",
      icon: <Smartphone className="text-blue-600" />,
      content: "PIL enables location-based security controls within company premises. When a user enters a protected zone, the app applies policy rules such as camera restriction, blocked apps, or kiosk mode. When a user exits, normal device access can be restored based on policy settings."
    },
    {
      title: "Security & Sharing",
      icon: <Lock className="text-blue-600" />,
      content: "We protect data using encryption in transit, access controls, and audit logging. We do not sell personal data. Data may be shared with your organization strictly to deliver the service."
    }
  ];

  return (
    <div className="min-h-screen bg-[#fafbff] font-sans selection:bg-blue-100 selection:text-blue-900 text-slate-900 antialiased w-full flex flex-col items-center">
      {/* Progress Bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-blue-600 z-[60] origin-left"
        style={{ scaleX }}
      />

      {/* Header/Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/70 backdrop-blur-xl border-b border-slate-200/60 shadow-sm w-full">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => navigate("/")}
          >
            <img src={pidliteLogo} alt="PIL Logo" className="h-10 w-auto group-hover:scale-110 transition-transform duration-300" />
          </motion.div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-48 pb-32 relative overflow-hidden w-full flex flex-col items-center">
        {/* Background Decals */}
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-blue-100/40 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 opacity-60"></div>
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-indigo-50/40 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2 opacity-50"></div>

        <div className="max-w-5xl w-full px-6 relative z-10 flex flex-col items-center text-center">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            className="flex flex-col items-center"
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 text-blue-600 text-xs font-black uppercase tracking-[0.2em] mb-8 shadow-sm border border-blue-100/50">
              <FileText className="w-3.5 h-3.5" /> Privacy Management
            </span>
            <h1 className="text-5xl md:text-7xl font-black text-slate-900 mb-8 tracking-tighter leading-[0.95]">
              Device security with clear, <br />
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">human rules.</span>
            </h1>
            <p className="text-xl md:text-2xl text-slate-500 font-medium leading-relaxed max-w-3xl mx-auto">
              Transparent, robust, and designed for enterprise safety. Here's how PIL manages and protects your digital workspace data.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4 mt-12">
              <div className="px-6 py-2.5 bg-white rounded-full border border-slate-200 shadow-sm flex items-center gap-2.5">
                <span className="w-2 h-2 rounded-full bg-green-500"></span>
                <span className="text-sm font-black text-slate-700 uppercase tracking-widest">Active</span>
              </div>
              <div className="flex items-center gap-6 text-sm text-slate-400 font-bold uppercase tracking-wider">
                <span>v2.0 Revision</span>
                <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                <span>March 01, 2026</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Content Section */}
      <section className="pb-32 relative w-full flex flex-col items-center">
        <div className="max-w-6xl w-full px-6 flex flex-col items-center">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 w-full">
            {sections.map((section, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6, delay: idx * 0.05 }}
                className={`p-10 rounded-[3rem] bg-white border border-slate-200/60 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_20px_40px_-10px_rgba(59,130,246,0.12)] hover:-translate-y-2 transition-all duration-500 relative overflow-hidden group ${idx === 0 || idx === 3 ? 'md:col-span-12' : 'md:col-span-6'
                  }`}
              >
                {/* Accent line on top */}
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                <div className="flex flex-col md:flex-row md:items-center gap-6 mb-8 text-left">
                  <div className="w-16 h-16 rounded-[1.5rem] bg-blue-50 flex items-center justify-center shrink-0 border border-blue-100 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-500">
                    {React.cloneElement(section.icon, { size: 32 })}
                  </div>
                  <div>
                    <h3 className="text-3xl font-black text-slate-900 tracking-tighter">
                      {section.title}
                    </h3>
                    <p className="text-blue-500 text-xs font-black uppercase tracking-[0.2em] mt-1">Management Policy</p>
                  </div>
                </div>

                {section.content && (
                  <p className="text-slate-600 leading-relaxed font-medium text-xl md:text-2xl max-w-4xl text-left">
                    {section.content}
                  </p>
                )}

                {section.list && (
                  <div className="grid grid-cols-1 gap-4 text-left">
                    {section.list.map((item, i) => (
                      <div key={i} className="flex items-start gap-4 p-4 rounded-2xl border border-slate-50 bg-slate-50/30 group/item hover:bg-white hover:border-blue-100 hover:shadow-sm transition-all duration-300">
                        <CheckCircle className="w-6 h-6 text-blue-400 mt-0.5 shrink-0 group-hover/item:text-blue-600 transition-colors" />
                        <span className="text-slate-600 font-bold leading-relaxed text-lg">{item}</span>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            ))}

            {/* Contact Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="md:col-span-12 p-16 rounded-[4rem] bg-slate-900 text-white shadow-3xl relative overflow-hidden group mt-12 w-full"
            >
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none group-hover:scale-125 transition-transform duration-1000"></div>

              <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-12">
                <div className="text-center md:text-left max-w-2xl">
                  <div className="inline-flex items-center gap-2 text-blue-400 font-black uppercase tracking-[0.3em] text-xs mb-6">
                    <Mail className="w-4 h-4" /> Global Support
                  </div>
                  <h3 className="text-4xl md:text-6xl font-black mb-6 tracking-tighter leading-none">Need more clarity?</h3>
                  <p className="text-slate-400 text-lg md:text-xl font-medium leading-relaxed">
                    Our compliance team is ready to answer specific questions about device logs, storage, or your privacy rights.
                  </p>
                </div>

                <a
                  href="mailto:info@ajivainfotech.com"
                  className="shrink-0 flex items-center justify-center gap-4 px-10 py-6 bg-blue-600 text-white rounded-3xl font-black text-xl hover:bg-blue-500 transition-all shadow-[0_20px_40px_-10px_rgba(37,99,235,0.4)] hover:shadow-[0_25px_50px_-12px_rgba(37,99,235,0.6)] hover:-translate-y-2 group/btn uppercase tracking-widest"
                >
                  Contact Support
                  <ArrowRight className="w-6 h-6 group-hover/btn:translate-x-2 transition-transform" />
                </a>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Simplified Footer */}
      <footer className="bg-white border-t border-slate-200 py-20 w-full flex flex-col items-center">
        <div className="max-w-7xl w-full px-6 flex flex-col items-center gap-12">
          <div className="flex items-center gap-3 grayscale hover:grayscale-0 transition-all duration-500">
            <img src={pidliteLogo} alt="PIL Logo" className="h-10 w-auto" />
          </div>

          <div className="flex flex-wrap justify-center gap-x-12 gap-y-4 text-sm font-black text-slate-400 uppercase tracking-widest">
            <a href="/" className="hover:text-blue-600 transition-colors">Security</a>
            <a href="/" className="hover:text-blue-600 transition-colors">Terms</a>
            <a href="/" className="hover:text-blue-600 transition-colors">System</a>
          </div>

          <p className="text-slate-400 text-sm font-bold tracking-tight text-center">
            © {new Date().getFullYear()} PIL • Policy-Driven Information Lock. <br className="md:hidden" />
            Engineered by <span className="text-slate-900">AjivaInfotech Pvt Ltd</span>.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default PrivacyPolicy;
