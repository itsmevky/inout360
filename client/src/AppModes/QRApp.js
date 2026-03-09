import React from 'react';
import WebView from './WebView';

const QRApp = () => {
    return (
        <div className="fixed inset-0 flex w-full h-full overflow-hidden bg-black font-sans">
            <div className="flex-grow h-full w-full relative z-0">
                <WebView url="/qr?mode=app" allowPermission="camera" />
            </div>
        </div>
    );
};

export default QRApp;
