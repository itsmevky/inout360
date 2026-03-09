import React, { useState } from 'react';
import WebView from './WebView';

const TABS = [
    { id: 'login', title: 'QR Login', url: 'https://pidiliteapp.ajivainfotech.com/qr-login', icon: 'login' },
    { id: 'scan', title: 'QR Scan', url: 'https://pidiliteapp.ajivainfotech.com/qr', icon: 'qr_code_scanner' },
    { id: 'login-qr', title: 'Login QR', url: 'https://pidiliteapp.ajivainfotech.com/LoginQr', icon: 'input' },
    { id: 'logout-qr', title: 'Logout QR', url: 'https://pidiliteapp.ajivainfotech.com/LogoutQr', icon: 'output' },
];

const QRApp = () => {
    const [activeTab, setActiveTab] = useState(TABS[0]);

    return (
        <div className="fixed inset-0 flex flex-col w-full h-full overflow-hidden bg-[#f4f7fa] font-sans">
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

            {/* Bottom Bar for Tablet */}
            <nav className="h-24 bg-white border-t border-gray-200 flex items-center justify-around px-8 shadow-[0_-4px_10px_rgba(0,0,0,0.05)] z-20">
                {TABS.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab)}
                        className={`flex flex-col items-center justify-center flex-1 h-full gap-2 transition-all p-2 rounded-xl active:bg-gray-50 ${activeTab.id === tab.id ? 'text-blue-600' : 'text-gray-400'
                            }`}
                    >
                        <span className={`material-symbols-rounded block ${activeTab.id === tab.id ? 'text-4xl' : 'text-4xl'}`}>
                            {tab.icon}
                        </span>
                        <span className={`text-base font-bold ${activeTab.id === tab.id ? 'text-blue-600' : ''}`}>
                            {tab.title}
                        </span>
                    </button>
                ))}
            </nav>
        </div>
    );
};

export default QRApp;
