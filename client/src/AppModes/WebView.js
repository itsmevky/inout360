import React from 'react';

const WebView = ({ url, allowPermission = "camera; microphone; geolocation" }) => {
    return (
        <div className="w-full h-full">
            <iframe
                src={url}
                title="Web View"
                className="w-full h-full border-none"
                style={{ width: '100%', height: '100%', border: 'none' }}
                allow={allowPermission}
            />
        </div>
    );
};

export default WebView;
