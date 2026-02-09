
import React, { useState, useEffect, useCallback } from 'react';

import BrowserBlocker from '../components/BrowserBlocker';
import SecureTest from '../components/SecureTest';
import AuditLogView from '../components/AuditLogView';
import { EventType } from '../types/types';
import { detectBrowser, type BrowserInfo } from '../services/BrowserService';
import { logEvent, resetLogger } from '../services/LoggerService';

type AppState = 'DETECTING' | 'BLOCKED' | 'SETUP' | 'TESTING' | 'COMPLETED';

const SecureTestApp: React.FC = () => {
    const [appState, setAppState] = useState<AppState>('DETECTING');
    const [browserInfo, setBrowserInfo] = useState<BrowserInfo | null>(null);

    const performBrowserCheck = useCallback(() => {
        const info = detectBrowser();
        setBrowserInfo(info);

        logEvent(EventType.BROWSER_CHECK, {
            browserName: info.name,
            browserVersion: info.version
        });

        if (!info.isChrome) {
            logEvent(EventType.ACCESS_DENIED, { reason: 'Unsupported browser type' });
            setAppState('BLOCKED');
        } else {
            setAppState('SETUP');
        }
    }, []);

    useEffect(() => {
        performBrowserCheck();
    }, [performBrowserCheck]);

    const startTest = () => {
        logEvent(EventType.TEST_START);
        setAppState('TESTING');
    };

    const completeTest = () => {
        setAppState('COMPLETED');
    };

    const handleReset = () => {
        resetLogger();
        setAppState('DETECTING');
        setTimeout(() => {
            performBrowserCheck();
        }, 500);
    };

    if (appState === 'DETECTING') {
        return (
            <div className="flex items-center justify-center bg-gray-900 text-white">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto mb-6"></div>
                    <h1 className="text-xl font-bold animate-pulse">Running Security Verification...</h1>
                    <p className="text-gray-500 mt-2 text-sm">Verifying environment integrity</p>
                </div>
            </div>
        );
    }

    if (appState === 'BLOCKED' && browserInfo) {
        return <BrowserBlocker info={browserInfo} />;
    }

    if (appState === 'SETUP') {
        return (
            <div className="h-full  flex items-center justify-center p-4 animate-in fade-in zoom-in-95 duration-500">
                <div className="max-w-2xl w-full bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-200">
                    <div className="p-10 text-center">
                        <div className="w-20 h-20 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                            <i className="fas fa-shield-alt text-4xl"></i>
                        </div>
                        <h1 className="text-3xl font-black text-gray-900 mb-4">Secure Assessment Environment</h1>
                        <p className="text-gray-600 mb-8 leading-relaxed">
                            You are about to begin a high-stakes assessment. For security and integrity purposes, this test will monitor your browser behavior, including tab switches, full-screen exits, and clipboard activity.
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left mb-8">
                            <div className="bg-gray-50 p-4 rounded-xl flex gap-3">
                                <i className="fas fa-check-circle text-green-500 mt-1"></i>
                                <span className="text-sm font-medium text-gray-700">Google Chrome Verified</span>
                            </div>
                            <div className="bg-gray-50 p-4 rounded-xl flex gap-3">
                                <i className="fas fa-check-circle text-green-500 mt-1"></i>
                                <span className="text-sm font-medium text-gray-700">Audit Logging Ready</span>
                            </div>
                            <div className="bg-gray-50 p-4 rounded-xl flex gap-3">
                                <i className="fas fa-check-circle text-green-500 mt-1"></i>
                                <span className="text-sm font-medium text-gray-700">Network Sync Active</span>
                            </div>
                            <div className="bg-gray-50 p-4 rounded-xl flex gap-3">
                                <i className="fas fa-check-circle text-green-500 mt-1"></i>
                                <span className="text-sm font-medium text-gray-700">Locked Down Context</span>
                            </div>
                        </div>

                        <button
                            onClick={startTest}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-2xl shadow-xl transition-all active:scale-95 text-lg"
                        >
                            Confirm and Enter Secure Test
                        </button>
                        <p className="mt-4 text-xs text-gray-400">By proceeding, you consent to the collection of security audit events.</p>
                    </div>
                </div>
            </div>
        );
    }

    if (appState === 'TESTING') {
        return <SecureTest onComplete={completeTest} />;
    }

    if (appState === 'COMPLETED') {
        return <AuditLogView onReset={handleReset} />;
    }

    return null;
};

export default SecureTestApp;
