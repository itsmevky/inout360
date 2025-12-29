// src/Modules/Notifications/NotificationsPage.js
import React, { useEffect, useState } from "react";
import { getData } from "../../Helpers/api";
import {
    FaCamera,
    FaCameraRetro,
    FaVideo,
    FaMobileAlt,
    FaTrashAlt,
} from "react-icons/fa";

const iconMap = {
    CAMERA_ON: <FaCamera />,
    TAKE_PICTURE: <FaCameraRetro />,
    VIDEO: <FaVideo />,
    APP_INSTALL: <FaMobileAlt />,
    APP_UNINSTALL: <FaTrashAlt />,
};

/* ================= DUMMY NOTIFICATIONS ================= */
const dummyNotifications = [
    {
        _id: "1",
        type: "CAMERA_ON",
        employeeName: "Rohit Sharma",
        employeeId: "EMP001",
        deviceId: "DEV-AX92",
        message: "Camera was turned ON",
        createdAt: new Date(),
    },
    {
        _id: "2",
        type: "TAKE_PICTURE",
        employeeName: "Anjali Verma",
        employeeId: "EMP014",
        deviceId: "DEV-BX77",
        message: "Screenshot captured",
        createdAt: new Date(Date.now() - 1000 * 60 * 10),
    },
    {
        _id: "3",
        type: "VIDEO",
        employeeName: "Suresh Kumar",
        employeeId: "EMP032",
        deviceId: "DEV-CZ21",
        message: "Video recording started",
        createdAt: new Date(Date.now() - 1000 * 60 * 25),
    },
    {
        _id: "4",
        type: "APP_INSTALL",
        employeeName: "Neha Singh",
        employeeId: "EMP008",
        deviceId: "DEV-DT11",
        message: "New app installed on device",
        createdAt: new Date(Date.now() - 1000 * 60 * 60),
    },
    {
        _id: "5",
        type: "APP_UNINSTALL",
        employeeName: "Amit Patel",
        employeeId: "EMP019",
        deviceId: "DEV-ER99",
        message: "App uninstalled from device",
        createdAt: new Date(Date.now() - 1000 * 60 * 120),
    },
];

const NotificationsPage = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        try {
            const res = await getData("/notifications"); // backend API

            if (Array.isArray(res) && res.length > 0) {
                setNotifications(res);
            } else {
                // fallback to dummy
                setNotifications(dummyNotifications);
            }
        } catch (err) {
            console.error("Failed to load notifications, showing dummy data");
            setNotifications(dummyNotifications);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <div className="notification-page">
                {/* <h2 className="notification-title flex items-center gap-2">
                    <svg
                        fill="#22374e"
                        width={28}
                        height={28}
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 640 640"
                    >
                        <path d="M320 64C302.3 64 288 78.3 288 96L288 99.2C215 114 160 178.6 160 256L160 277.7C160 325.8 143.6 372.5 113.6 410.1L103.8 422.3C98.7 428.6 96 436.4 96 444.5C96 464.1 111.9 480 131.5 480L508.4 480C528 480 543.9 464.1 543.9 444.5C543.9 436.4 541.2 428.6 536.1 422.3L526.3 410.1C496.4 372.5 480 325.8 480 277.7L480 256C480 178.6 425 114 352 99.2L352 96C352 78.3 337.7 64 320 64zM258 528C265.1 555.6 290.2 576 320 576C349.8 576 374.9 555.6 382 528L258 528z" />
                    </svg>
                    Activity Notifications
                </h2> */}

                <div className="bg-white p-4 py-6 !mb-5 rounded-lg text-gray-700 font-semibold text-xl notification-heading-title-box">
                    <span className="mr-2 flex items-center gap-4 space-x-2 notification-titel">
                        <svg
                            fill="#22374e"
                            width={28}
                            height={28}
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 640 640"
                        >
                            <path d="M320 64C302.3 64 288 78.3 288 96L288 99.2C215 114 160 178.6 160 256L160 277.7C160 325.8 143.6 372.5 113.6 410.1L103.8 422.3C98.7 428.6 96 436.4 96 444.5C96 464.1 111.9 480 131.5 480L508.4 480C528 480 543.9 464.1 543.9 444.5C543.9 436.4 541.2 428.6 536.1 422.3L526.3 410.1C496.4 372.5 480 325.8 480 277.7L480 256C480 178.6 425 114 352 99.2L352 96C352 78.3 337.7 64 320 64zM258 528C265.1 555.6 290.2 576 320 576C349.8 576 374.9 555.6 382 528L258 528z" />
                        </svg> Activity Notifications</span>
                </div>

                {loading && (
                    <p className="notification-loading">Loading notifications...</p>
                )}

                {!loading && notifications.length === 0 && (
                    <p className="notification-empty">No notifications found</p>
                )}

                <div className="notification-list">
                    {notifications.map((n) => (
                        <div key={n._id} className="notification-card">
                            <div className="notification-icon">
                                {iconMap[n.type] || "🔔"}
                            </div>

                            <div className="notification-content">
                                <p className="notification-message">
                                    <strong>{n.employeeName}</strong> — {n.message}
                                </p>

                                <p className="notification-meta">
                                    Emp ID: {n.employeeId} | Device: {n.deviceId}
                                </p>

                                <p className="notification-time">
                                    {new Date(n.createdAt).toLocaleString()}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default NotificationsPage;
