
import React from 'react';
import type { BrowserInfo } from '../services/BrowserService';

interface BrowserBlockerProps {
  info: BrowserInfo;
}

const BrowserBlocker: React.FC<BrowserBlockerProps> = ({ info }) => {
  return (
    <div className=" flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-2xl overflow-hidden border border-red-200">
        <div className="bg-red-600 p-6 flex items-center gap-4 text-white">
          <i className="fas fa-exclamation-triangle text-3xl"></i>
          <h1 className="text-xl font-bold uppercase tracking-tight">Access Restricted</h1>
        </div>

        <div className="p-8">
          <div className="mb-6 text-gray-600">
            <p className="mb-4">This assessment requires a secure environment that is only verified for <strong>Google Chrome</strong>.</p>

            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-6">
              <h2 className="text-sm font-semibold text-gray-500 uppercase mb-2">Current Browser Detected</h2>
              <div className="flex items-center gap-3">
                <i className={`fas ${info.name === 'Unknown' ? 'fa-question-circle' : 'fa-globe'} text-gray-400`}></i>
                <span className="font-medium text-gray-800">{info.name} (v{info.version})</span>
              </div>
            </div>

            <h2 className="text-sm font-semibold text-gray-800 mb-2">Why am I seeing this?</h2>
            <p className="text-sm mb-4 leading-relaxed">
              To ensure test integrity and prevent unauthorized browser extensions or features, we strictly enforce the use of Google Chrome for this high-stakes assessment.
            </p>

            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
              <h2 className="text-sm font-semibold text-blue-800 mb-2">Instructions to Proceed:</h2>
              <ol className="text-xs text-blue-700 list-decimal list-inside space-y-1">
                <li>Download and install <strong>Google Chrome</strong> if you haven't already.</li>
                <li>Copy the test URL from your invitation.</li>
                <li>Paste and open the URL in a new Google Chrome window.</li>
              </ol>
            </div>
          </div>

          <button
            onClick={() => window.location.reload()}
            className="w-full bg-gray-800 hover:bg-black text-white py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
          >
            <i className="fas fa-sync-alt text-sm"></i>
            Retry Detection
          </button>
        </div>

        <div className="px-8 py-4 bg-gray-50 border-t border-gray-100 text-center">
          <a
            href="https://www.google.com/chrome/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-blue-600 hover:underline font-medium"
          >
            Download Google Chrome <i className="fas fa-external-link-alt ml-1"></i>
          </a>
        </div>
      </div>
    </div>
  );
};

export default BrowserBlocker;
