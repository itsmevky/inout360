import React, { useState } from 'react';
import WebView from './WebView';

const TABS = [
    { id: 'login', title: 'QR Login', url: 'https://pidiliteapp.ajivainfotech.com/qr-login', icon: 'login' },
    { id: 'scan', title: 'QR Scan', url: 'https://pidiliteapp.ajivainfotech.com/qr', icon: 'qr_code_scanner' },
    { id: 'login-qr', title: 'Login QR', url: 'https://pidiliteapp.ajivainfotech.com/LoginQr', icon: 'login' },
    { id: 'logout-qr', title: 'Logout QR', url: 'https://pidiliteapp.ajivainfotech.com/LogoutQr', icon: 'logout' },
];

const QRApp = () => {
    const [activeTab, setActiveTab] = useState(TABS[0]);

    return (
        <div className="fixed inset-0 flex flex-col w-full h-full overflow-hidden bg-white font-sans">
            {/* WebView Container */}
            <div className="flex-grow w-full relative">
                {TABS.map((tab) => (
                    <div
                        key={tab.id}
                        className={`absolute inset-0 w-full h-full transition-opacity duration-300 ${activeTab.id === tab.id ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
                            }`}
                    >
                        <WebView url={tab.url} allowPermission="camera" />
                    </div>
                ))}
            </div>

            {/* Optimized Tablet Bottom Navigation */}
            <nav className="h-32 bg-white border-t border-gray-100 flex items-center justify-around px-8 shadow-[0_-10px_40px_rgba(0,0,0,0.08)] z-20 pb-4">
                {TABS.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab)}
                        className={`flex flex-col items-center justify-center flex-1 h-full gap-3 transition-all p-4 rounded-3xl ${activeTab.id === tab.id
                                ? 'text-blue-600 bg-blue-50/40'
                                : 'text-gray-400 active:bg-gray-50'
                            }`}
                    >
                        <span
                            className="material-symbols-rounded block text-5xl"
                            style={{ fontVariationSettings: activeTab.id === tab.id ? "'FILL' 1" : "'FILL' 0" }}
                        >
                            {tab.icon}
                        </span>
                        <span className={`text-xl font-bold tracking-tight ${activeTab.id === tab.id ? 'text-blue-700' : 'text-gray-500'}`}>
                            {tab.title}
                        </span>
                    </button>
                ))}
            </nav>
        </div>
    );
};

export default QRApp;
