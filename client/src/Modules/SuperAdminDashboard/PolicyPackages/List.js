import React, { useState, useEffect } from "react";
import { getData, postData } from "../../../Helpers/api";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ShieldAlert, 
  Camera, 
  PlusCircle, 
  Trash2, 
  ShieldCheck, 
  Activity, 
  RefreshCcw,
  Zap,
  Info
} from "lucide-react";

/**
 * PolicyPackagesList Component - v2 (Premium Edition)
 * Manages camera and restricted package whitelists with an interactive, animated interface.
 */
const PolicyPackagesList = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [config, setConfig] = useState({
    cameraPackages: [],
    restrictedPackages: [],
    version: 0,
    updatedAt: null,
  });

  const [newCameraPkg, setNewCameraPkg] = useState("");
  const [newRestrictedPkg, setNewRestrictedPkg] = useState("");
  const [newRevokePkg, setNewRevokePkg] = useState("");
  const [mode, setMode] = useState("merge");

  const fetchConfig = async () => {
    setLoading(true);
    try {
      const res = await getData("/device/admin/policy-packages");
      if (res?.success) {
        setConfig(res.data);
      }
    } catch (error) {
      console.error("Failed to fetch policy packages:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  const handleSave = async () => {
    if (!newCameraPkg && !newRestrictedPkg && !newRevokePkg && mode === "merge") {
      toast.info("Please enter at least one package name to merge or revoke.");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        mode,
        cameraPackages: newCameraPkg ? newCameraPkg.split(",").map(p => p.trim()).filter(p => p) : [],
        restrictedPackages: newRestrictedPkg ? newRestrictedPkg.split(",").map(p => p.trim()).filter(p => p) : [],
        removedPackages: newRevokePkg ? newRevokePkg.split(",").map(p => p.trim()).filter(p => p) : [],
      };

      const res = await postData("/device/admin/policy-packages", payload);
      if (res?.success) {
        toast.success("Policy packages successfully synchronized!");
        setConfig(res.data);
        setNewCameraPkg("");
        setNewRestrictedPkg("");
        setNewRevokePkg("");
      }
    } catch (error) {
      console.error("Update failed:", error);
    } finally {
      setSaving(false);
    }
  };

  const removePackage = async (type, pkgName) => {
    // Elegant toast confirmation instead of window.confirm if possible, but keeping it safe
    if (!window.confirm(`Are you sure you want to remove ${pkgName}?`)) return;

    setSaving(true);
    try {
      const payload = {
        mode: "merge", // Use merge so we don't accidentally wipe everything else
        cameraPackages: [],
        restrictedPackages: [],
        removedPackages: [pkgName]
      };

      const res = await postData("/device/admin/policy-packages", payload);
      if (res?.success) {
        toast.success(`Broadcasting removal of ${pkgName} to all devices...`);
        setConfig(res.data);
      }
    } catch (error) {
      console.error("Remove failed:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleDeletePolicy = async () => {
    if (!window.confirm("CRITICAL: Are you sure you want to PERMANENTLY CLEAR all policy packages? This will reset the whitelist on all devices.")) return;

    setSaving(true);
    try {
      await getData("/device/admin/policy-packages", {}, "DELETE");
      toast.success("All policy packages have been cleared.");
      setConfig({
        cameraPackages: [],
        restrictedPackages: [],
        removedPackages: [],
        version: 0,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
       console.error("Delete failed:", error);
       toast.error("Failed to clear policy packages.");
    } finally {
       setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50/50">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="p-3 bg-white rounded-full shadow-lg"
        >
          <RefreshCcw className="text-blue-600 h-8 w-8" />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-8 min-h-screen">
      {/* Header Section */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row justify-between items-start md:items-center p-6 bg-gradient-to-r from-blue-700 to-indigo-800 rounded-3xl shadow-xl text-white overflow-hidden relative"
      >
        <div className="z-10">
          <div className="flex items-center gap-3 mb-2">
            <ShieldCheck className="h-8 w-8 text-blue-200" />
            <h1 className="text-3xl font-extrabold tracking-tight">Security Policy Engine</h1>
          </div>
          <p className="text-blue-100 max-w-xl text-lg font-medium opacity-90">
            Control application whitelists and device restrictions across the PIL mobile ecosystem.
          </p>
        </div>
        
        <div className="mt-6 md:mt-0 z-10 flex gap-4">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20">
            <div className="flex items-center gap-4">
              <div className="text-center">
                <p className="text-[10px] uppercase tracking-widest text-blue-200 font-bold mb-1">Revision</p>
                <p className="text-2xl font-black">{config.version}</p>
              </div>
              <div className="h-10 w-px bg-white/20"></div>
              <div>
                <p className="text-[10px] uppercase tracking-widest text-blue-200 font-bold mb-1">Last Deployment</p>
                <p className="text-sm font-bold">{config.updatedAt ? new Date(config.updatedAt).toLocaleString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Pending'}</p>
              </div>
            </div>
          </div>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleDeletePolicy}
            className="p-4 bg-red-500/20 hover:bg-red-500/40 rounded-2xl border border-red-500/30 text-white transition-all flex items-center justify-center group"
            title="Clear All Policy Packages"
          >
            <Trash2 className="h-6 w-6 group-hover:text-red-200 transition-colors" />
          </motion.button>
        </div>

        {/* Decorative background circle */}
        <div className="absolute -right-20 -top-20 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Management Form */}
        <div className="lg:col-span-4 space-y-6">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white p-8 rounded-[2rem] shadow-2xl shadow-blue-900/5 border border-gray-100 sticky top-8"
          >
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2 bg-blue-100 rounded-xl text-blue-600">
                <PlusCircle className="h-6 w-6" />
              </div>
              <h2 className="text-xl font-bold text-gray-800">Provision Packages</h2>
            </div>
            
            <div className="space-y-6">
              {/* Sync Mode Toggle */}
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Sync Strategy</label>
                <div className="grid grid-cols-2 gap-2 p-1.5 bg-gray-100 rounded-2xl">
                  <button 
                    onClick={() => setMode("merge")}
                    className={`flex items-center justify-center gap-2 py-3 text-sm font-bold rounded-xl transition-all duration-300 ${mode === "merge" ? "bg-white shadow-md text-blue-600 scale-[1.02]" : "text-gray-500 hover:bg-gray-200/50"}`}
                  >
                    <Activity className="h-4 w-4" />
                    Merge
                  </button>
                  <button 
                    onClick={() => setMode("replace")}
                    className={`flex items-center justify-center gap-2 py-3 text-sm font-bold rounded-xl transition-all duration-300 ${mode === "replace" ? "bg-white shadow-md text-orange-600 scale-[1.02]" : "text-gray-500 hover:bg-gray-200/50"}`}
                  >
                    <RefreshCcw className="h-4 w-4" />
                    Replace
                  </button>
                </div>
                <div className="mt-3 flex items-start gap-2 px-1">
                  <Info className="h-3 w-3 text-gray-400 mt-0.5" />
                  <p className="text-[11px] text-gray-500 font-medium italic leading-relaxed">
                    {mode === "merge" 
                      ? "Cumulative update: Only adds new packages to the existing global registry." 
                      : "Destructive update: Fully overwrites existing registry with the new lists below."}
                  </p>
                </div>
              </div>

              {/* Input Fields */}
              <div className="space-y-4">
                <div className="group">
                  <label className="flex items-center gap-2 text-xs font-bold text-gray-700 uppercase tracking-widest mb-2 transition-colors group-focus-within:text-blue-600">
                    <Camera className="h-3 w-3" />
                    Camera Apps
                  </label>
                  <textarea 
                    value={newCameraPkg}
                    onChange={(e) => setNewCameraPkg(e.target.value)}
                    placeholder="e.g. com.android.camera, com.oppo.camera"
                    className="w-full h-32 p-4 text-sm border-2 border-gray-100 bg-gray-50 rounded-2xl focus:border-blue-500 focus:bg-white outline-none transition-all resize-none shadow-sm placeholder:text-gray-300"
                  />
                </div>

                <div className="group">
                  <label className="flex items-center gap-2 text-xs font-bold text-gray-700 uppercase tracking-widest mb-2 transition-colors group-focus-within:text-orange-600">
                    <ShieldAlert className="h-3 w-3" />
                    Restricted Apps
                  </label>
                  <textarea 
                    value={newRestrictedPkg}
                    onChange={(e) => setNewRestrictedPkg(e.target.value)}
                    placeholder="e.g. com.whatsapp, com.facebook.katana"
                    className="w-full h-32 p-4 text-sm border-2 border-gray-100 bg-gray-50 rounded-2xl focus:border-orange-500 focus:bg-white outline-none transition-all resize-none shadow-sm placeholder:text-gray-300"
                  />
                </div>

                <div className="group">
                  <label className="flex items-center gap-2 text-xs font-bold text-gray-700 uppercase tracking-widest mb-2 transition-colors group-focus-within:text-red-600">
                    <Trash2 className="h-3 w-3" />
                    Revoke/Remove Apps
                  </label>
                  <textarea 
                    value={newRevokePkg}
                    onChange={(e) => setNewRevokePkg(e.target.value)}
                    placeholder="Remove from devices (comma separated)"
                    className="w-full h-32 p-4 text-sm border-2 border-red-50 bg-red-50/30 rounded-2xl focus:border-red-500 focus:bg-white outline-none transition-all resize-none shadow-sm placeholder:text-red-200"
                  />
                  <p className="mt-2 text-[10px] text-red-400 font-medium italic">
                    Added to global 'removed' list to force-clean from device memory.
                  </p>
                </div>
              </div>

              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSave}
                disabled={saving}
                className={`w-full py-4 rounded-2xl font-black text-sm uppercase tracking-widest text-white shadow-xl transition-all flex items-center justify-center gap-3 ${saving ? "bg-gray-300 cursor-not-allowed" : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:shadow-blue-200"}`}
              >
                {saving ? (
                  <RefreshCcw className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    <Zap className="h-5 w-5" />
                    Secure Deploy
                  </>
                )}
              </motion.button>
            </div>
          </motion.div>
        </div>

        {/* Right Column: Registry Visualization */}
        <div className="lg:col-span-8 space-y-8">
          {/* Camera Packages Grid */}
          <motion.div 
             initial={{ opacity: 0, scale: 0.95 }}
             animate={{ opacity: 1, scale: 1 }}
             transition={{ delay: 0.3 }}
             className="bg-white rounded-[2.5rem] shadow-2xl shadow-gray-200/50 border border-gray-100 overflow-hidden"
          >
            <div className="px-8 py-6 border-b border-gray-50 flex justify-between items-center bg-gray-50/30">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-600 text-white rounded-2xl shadow-lg shadow-blue-200">
                  <Camera className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-gray-800">Authorized Camera Apps</h3>
                  <p className="text-xs text-gray-500 font-bold uppercase tracking-tighter mt-0.5">Global Whitelist Registry</p>
                </div>
              </div>
              <div className="px-4 py-1.5 bg-blue-100 rounded-full text-blue-700 text-xs font-black">
                {config.cameraPackages.length} ASSETS
              </div>
            </div>
            
            <div className="p-8">
              <AnimatePresence mode="popLayout">
                {config.cameraPackages.length === 0 ? (
                  <motion.div 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }} 
                    className="flex flex-col items-center justify-center py-12 text-center"
                  >
                    <div className="bg-gray-50 p-6 rounded-full mb-4">
                      <Camera className="h-10 w-10 text-gray-300" />
                    </div>
                    <p className="text-gray-400 font-bold max-w-xs">No authorized camera packages found in the global registry.</p>
                  </motion.div>
                ) : (
                  <motion.div className="flex flex-wrap gap-3">
                    {config.cameraPackages.map((pkg) => (
                      <motion.div 
                        layout
                        key={pkg}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.5 }}
                        className="group flex items-center gap-3 bg-white border border-gray-200 pl-4 pr-2 py-2 rounded-2xl hover:border-blue-400 hover:shadow-lg hover:shadow-blue-100/50 transition-all cursor-default"
                      >
                        <span className="text-xs font-black text-gray-800 tracking-tight">{pkg}</span>
                        <div className="h-4 w-px bg-gray-100 group-hover:bg-blue-200 transition-colors"></div>
                        <button 
                           onClick={() => removePackage("camera", pkg)}
                           className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                           title="Revoke Permission"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Restricted Packages Grid */}
          <motion.div 
             initial={{ opacity: 0, scale: 0.95 }}
             animate={{ opacity: 1, scale: 1 }}
             transition={{ delay: 0.4 }}
             className="bg-white rounded-[2.5rem] shadow-2xl shadow-gray-200/50 border border-gray-100 overflow-hidden"
          >
            <div className="px-8 py-6 border-b border-gray-50 flex justify-between items-center bg-gray-50/30">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-indigo-700 text-white rounded-2xl shadow-lg shadow-indigo-200">
                  <ShieldAlert className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-gray-800">Restricted Application Layer</h3>
                  <p className="text-xs text-gray-500 font-bold uppercase tracking-tighter mt-0.5">Global Ban/Restriction Index</p>
                </div>
              </div>
              <div className="px-4 py-1.5 bg-indigo-100 rounded-full text-indigo-700 text-xs font-black">
                {config.restrictedPackages.length} POLICIES
              </div>
            </div>
            
            <div className="p-8">
              <AnimatePresence mode="popLayout">
                {config.restrictedPackages.length === 0 ? (
                  <motion.div 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }} 
                    className="flex flex-col items-center justify-center py-12 text-center"
                  >
                    <div className="bg-gray-50 p-6 rounded-full mb-4">
                      <ShieldAlert className="h-10 w-10 text-gray-300" />
                    </div>
                    <p className="text-gray-400 font-bold max-w-xs">No restrictions active. All applications are permitted by default.</p>
                  </motion.div>
                ) : (
                  <motion.div className="flex flex-wrap gap-3">
                    {config.restrictedPackages.map((pkg) => (
                      <motion.div 
                        layout
                        key={pkg}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.5 }}
                        className="group flex items-center gap-3 bg-white border border-gray-200 pl-4 pr-2 py-2 rounded-2xl hover:border-indigo-400 hover:shadow-lg hover:shadow-indigo-100/50 transition-all cursor-default"
                      >
                        <span className="text-xs font-black text-gray-800 tracking-tight">{pkg}</span>
                        <div className="h-4 w-px bg-gray-100 group-hover:bg-indigo-200 transition-colors"></div>
                        <button 
                          onClick={() => removePackage("restricted", pkg)}
                          className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                          title="Revoke Restriction"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* New: Marked for Removal Visualization */}
          {config.removedPackages && config.removedPackages.length > 0 && (
            <motion.div 
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               className="bg-red-50 rounded-[2.5rem] shadow-xl shadow-red-100/50 border border-red-100 overflow-hidden"
            >
              <div className="px-8 py-6 border-b border-red-100 flex justify-between items-center bg-red-100/30">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-red-600 text-white rounded-2xl shadow-lg shadow-red-200">
                    <Trash2 className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-red-900">Marked for Removal</h3>
                    <p className="text-xs text-red-500 font-bold uppercase tracking-tighter mt-0.5">Pending Sync with Devices</p>
                  </div>
                </div>
                <div className="px-4 py-1.5 bg-red-200 rounded-full text-red-700 text-xs font-black">
                  {config.removedPackages.length} PENDING
                </div>
              </div>
              
              <div className="p-8">
                <div className="flex flex-wrap gap-3">
                  {config.removedPackages.map((pkg) => (
                    <div 
                      key={pkg}
                      className="flex items-center gap-3 bg-white/60 border border-red-200 px-4 py-2 rounded-2xl text-red-700 opacity-80"
                    >
                      <span className="text-xs font-bold tracking-tight">{pkg}</span>
                    </div>
                  ))}
                </div>
                <p className="mt-4 text-[11px] text-red-400 font-medium italic">
                  Note: These packages will be removed from devices upon their next policy synchronization.
                </p>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PolicyPackagesList;
