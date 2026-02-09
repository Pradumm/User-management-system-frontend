
import React from 'react';
import { getAllLogs, getAttemptId } from '../services/LoggerService';
import { EventType } from '../types/types';


interface AuditLogViewProps {
  onReset: () => void;
}

const AuditLogView: React.FC<AuditLogViewProps> = ({ onReset }) => {
  const logs = getAllLogs();

  const getEventIcon = (type: EventType) => {
    switch (type) {
      case EventType.BROWSER_CHECK: return 'fa-globe text-blue-500';
      case EventType.ACCESS_DENIED: return 'fa-ban text-red-500';
      case EventType.FULLSCREEN_EXIT: return 'fa-compress text-orange-500';
      case EventType.TAB_BLUR: return 'fa-eye-slash text-orange-500';
      case EventType.COPY_ATTEMPT:
      case EventType.PASTE_ATTEMPT: return 'fa-clipboard-list text-red-600';
      case EventType.TEST_SUBMIT: return 'fa-check-circle text-green-600';
      default: return 'fa-dot-circle text-gray-400';
    }
  };

  return (
    <div className="  px-4 animate-in fade-in duration-500">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-block p-3 bg-green-100 text-green-600 rounded-full mb-4">
            <i className="fas fa-cloud-upload-alt text-3xl"></i>
          </div>
          <h1 className="text-4xl font-black text-gray-900 mb-2">Assessment Submitted</h1>
          <p className="text-gray-500 text-lg">Your response and security audit trail have been securely transmitted.</p>
        </div>

        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-200">
          <div className="p-8 bg-gray-900 text-white flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold">Audit Event Trail</h2>
              <p className="text-gray-400 text-sm">Attempt: <span className="font-mono">{getAttemptId()}</span></p>
            </div>
            <div className="text-right">
              <p className="text-xs font-bold uppercase text-gray-500">Log Status</p>
              <div className="flex items-center gap-2 text-green-400 font-bold">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                </span>
                IMMUTABLE
              </div>
            </div>
          </div>

          <div className="p-0 max-h-[500px] overflow-y-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-50 sticky top-0 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Time</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Event Type</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {logs.slice().reverse().map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-mono text-gray-500">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <i className={`fas ${getEventIcon(log.type)} w-5 text-center`}></i>
                        <span className="font-bold text-gray-700 text-sm">{log.type.replace('_', ' ')}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-500 font-medium">
                      {log.metadata.reason || 
                       log.metadata.browserName || 
                       (log.metadata.focusState && `Focus: ${log.metadata.focusState}`) ||
                       (log.questionId && `Question: ${log.questionId}`) ||
                       "System Event"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="p-8 bg-gray-50 border-t border-gray-200 text-center">
            <button 
              onClick={onReset}
              className="px-8 py-4 bg-white border border-gray-300 rounded-xl font-bold text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-all shadow-sm active:scale-95 flex items-center justify-center gap-2 mx-auto"
            >
              <i className="fas fa-redo-alt"></i>
              Start New Attempt
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuditLogView;
