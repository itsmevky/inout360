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
        <div className="fixed inset-0 flex w-full h-full overflow-hidden bg-black font-sans">

            {/* 1. Full Screen WebView Area */}
            <div className="flex-grow h-full w-full relative z-0">
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

            {/* 2. Sleek Floating Sidebar (Left) */}
            {/* This doesn't push the content, it floats on top with a glass effect */}
            <div className="fixed left-4 top-1/2 -translate-y-1/2 flex flex-col items-center gap-4 p-3 bg-white/80 backdrop-blur-md rounded-full shadow-2xl z-30 border border-white/20">
                {TABS.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab)}
                        className={`group relative flex items-center justify-center w-14 h-14 rounded-full transition-all duration-300 ${activeTab.id === tab.id
                                ? 'bg-blue-600 text-white shadow-lg'
                                : 'text-gray-500 hover:bg-white hover:text-blue-600'
                            }`}
                    >
                        <span className="material-symbols-rounded text-3xl font-light">
                            {tab.icon}
                        </span>

                        {/* Tooltip on hover/active to show what the tab is */}
                        <span className={`absolute left-20 px-4 py-2 bg-gray-900 text-white text-sm font-bold rounded-xl whitespace-nowrap opacity-0 pointer-events-none transition-opacity duration-200 group-hover:opacity-100 shadow-xl`}>
                            {tab.title}
                            <div className="absolute top-1/2 -left-1 -translate-y-1/2 border-8 border-transparent border-r-gray-900" />
                        </span>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default QRApp;
