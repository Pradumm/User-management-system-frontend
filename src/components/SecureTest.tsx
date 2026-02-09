
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { message } from 'antd';
import { logEvent, submitAssessment, getAttemptId, subscribeToSyncStatus, type SyncStatus, } from '../services/LoggerService';
import { EventType, type AssessmentLog, type Question } from '../types/types';

const MOCK_QUESTIONS: Question[] = [
  {
    id: 'Q1',
    type: 'multiple-choice',
    text: 'What is the primary purpose of browser enforcement in secure testing?',
    options: [
      'To increase page load speed',
      'To ensure a controlled, fair environment for all candidates',
      'To force users to buy specific software',
      'To track user browsing history'
    ],
    correctIndex: 1
  },
  {
    id: 'Q2',
    type: 'short-answer',
    text: 'In one or two words, what is the term for a user moving focus away from the test window?',
    placeholder: 'Enter your answer here...'
  },
  {
    id: 'Q3',
    type: 'multiple-choice',
    text: 'Which event should definitely be logged during a secure test?',
    options: [
      'Mouse movement distance',
      'Screen resolution changes',
      'Tab focus/blur events',
      'Operating system version'
    ],
    correctIndex: 2
  },
  {
    id: 'Q4',
    type: 'essay',
    text: 'Explain why full-screen enforcement is critical for maintaining the integrity of an online assessment.',
    placeholder: 'Write your explanation here (at least 50 words recommended)...'
  },
  {
    id: 'Q5',
    type: 'multiple-choice',
    text: 'What does "immutability post-submission" mean for audit logs?',
    options: [
      'Logs can be edited by candidates',
      'Logs are deleted immediately after the test',
      'Logs cannot be modified once the test is finished',
      'Logs are only visible to the candidate'
    ],
    correctIndex: 2
  }
];

const SecureTest: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | number>>({});
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showWarning, setShowWarning] = useState<string | null>(null);
  const [liveEvents, setLiveEvents] = useState<AssessmentLog[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('idle');
  const [timeLeft, setTimeLeft] = useState(900);

  const assessmentRef = useRef<HTMLDivElement>(null);
  const consoleEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unsubscribe = subscribeToSyncStatus((status) => setSyncStatus(status));
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (consoleEndRef.current) {
      consoleEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [liveEvents]);

  const addLiveEvent = (type: EventType, metadata: any) => {
    const newLog: AssessmentLog = {
      id: `LIVE-${Date.now()}`,
      type,
      timestamp: Date.now(),
      attemptId: getAttemptId(),
      metadata
    };
    setLiveEvents(prev => [...prev, newLog].slice(-50));
    logEvent(type, metadata);
  };

  const enterFullscreen = () => {
    const elem = document.documentElement;
    if (elem.requestFullscreen) {
      elem.requestFullscreen().catch(err => console.error(err));
    }
  };

  const handleFullscreenChange = useCallback(() => {
    const enabled = !!document.fullscreenElement;
    setIsFullscreen(enabled);
    addLiveEvent(enabled ? EventType.FULLSCREEN_ENTER : EventType.FULLSCREEN_EXIT, {
      fullscreenState: enabled ? 'enabled' : 'disabled'
    });
    if (!enabled) setShowWarning("Full-screen mode is required to continue.");
    else setShowWarning(null);
  }, []);

  const handleVisibilityChange = useCallback(() => {
    const hidden = document.hidden;
    addLiveEvent(hidden ? EventType.TAB_BLUR : EventType.TAB_FOCUS, {
      focusState: hidden ? 'blurred' : 'focused'
    });
    if (hidden) setShowWarning("Unauthorized Window Switch Detected.");
  }, []);

  const handleClipboard = useCallback((e: Event) => {
    e.preventDefault();
    const type = e.type === 'copy' ? EventType.COPY_ATTEMPT :
      e.type === 'paste' ? EventType.PASTE_ATTEMPT : EventType.CUT_ATTEMPT;

    addLiveEvent(type, { reason: `Attempted ${e.type}` });

    message.error({
      content: `Security Policy: ${e.type.toUpperCase()} is restricted in this environment.`,
      duration: 3,
      style: { marginTop: '20px' }
    });
  }, []);

  useEffect(() => {
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    document.addEventListener('copy', handleClipboard);
    document.addEventListener('paste', handleClipboard);
    document.addEventListener('cut', handleClipboard);
    const timer = setInterval(() => setTimeLeft(prev => prev > 0 ? prev - 1 : 0), 1000);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.removeEventListener('copy', handleClipboard);
      document.removeEventListener('paste', handleClipboard);
      document.removeEventListener('cut', handleClipboard);
      clearInterval(timer);
    };
  }, [handleFullscreenChange, handleVisibilityChange, handleClipboard]);

  const handleSubmit = async () => {
    if (!window.confirm("Are you sure you want to submit your assessment?")) return;

    setIsSubmitting(true);
    try {
      addLiveEvent(EventType.TEST_SUBMIT, { status: 'finalizing' });
      await submitAssessment(answers);
      onComplete();
    } catch (err) {
      message.error("Submission Error: The secure server could not be reached.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentQuestion = MOCK_QUESTIONS[currentQuestionIndex];

  return (
    <div ref={assessmentRef} className="p-6 flex flex-col items-center">
      {(!isFullscreen || showWarning) && (
        <div className="fixed inset-0 z-50 bg-black/95 flex flex-col items-center justify-center p-6 text-center backdrop-blur-sm">
          <div className="bg-white p-10 rounded-3xl max-w-md border-t-8 border-red-600 shadow-2xl animate-in fade-in zoom-in duration-300">
            <div className="w-20 h-20 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <i className="fas fa-user-shield text-4xl"></i>
            </div>
            <h2 className="text-2xl font-black text-gray-900 mb-2">Security Breach Prevention</h2>
            <p className="text-gray-600 mb-8 font-medium leading-relaxed">{showWarning || "This environment requires full-screen lockdown."}</p>
            <button onClick={enterFullscreen} className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 rounded-2xl shadow-xl transition-all active:scale-95">
              Restore Secure Session
            </button>
          </div>
        </div>
      )}

      <div className="w-full max-w-7xl flex flex-col lg:flex-row gap-6 h-full">
        <div className="flex-1 flex flex-col">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 mb-6 flex justify-between items-center sticky top-0 z-10">
            <div className="flex items-center gap-4">
              <div className="bg-blue-600 text-white p-3 rounded-xl shadow-lg shadow-blue-200"><i className="fas fa-file-signature text-xl"></i></div>
              <div>
                <h1 className="font-black text-gray-900 tracking-tight text-sm md:text-lg">System Security Assessment</h1>
                <p className="text-[10px] text-gray-400 font-mono tracking-tighter uppercase">{getAttemptId()}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 md:gap-8">
              <div className={`flex flex-col items-end ${timeLeft < 60 ? 'text-red-600 animate-pulse' : 'text-gray-500'}`}>
                <span className="text-[8px] md:text-[10px] font-black uppercase tracking-widest mb-1">Time Remaining</span>
                <span className="text-lg md:text-2xl font-mono font-black">{Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}</span>
              </div>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="bg-green-600 hover:bg-green-700 text-white px-4 md:px-8 py-2 md:py-3 rounded-xl font-black transition-all shadow-lg shadow-green-100 active:scale-95 disabled:opacity-50 text-sm md:text-base"
              >
                {isSubmitting ? '...' : 'Finish Test'}
              </button>
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-200 flex-1 flex flex-col">
            <div className="bg-gray-50/50 px-8 py-4 border-b border-gray-100 flex justify-between items-center">
              <div className="flex gap-1">
                {MOCK_QUESTIONS.map((_, i) => (
                  <div key={i} className={`h-1.5 w-6 md:w-8 rounded-full ${i === currentQuestionIndex ? 'bg-blue-600' : answers[MOCK_QUESTIONS[i].id] !== undefined ? 'bg-green-400' : 'bg-gray-200'}`}></div>
                ))}
              </div>
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Step {currentQuestionIndex + 1} of {MOCK_QUESTIONS.length}</span>
            </div>

            <div className="p-8 md:p-12 flex-1">
              <h2 className="text-xl md:text-3xl font-black text-gray-900 mb-8 md:10 leading-tight tracking-tight">{currentQuestion.text}</h2>

              <div className="space-y-3 md:space-y-4">
                {currentQuestion.type === 'multiple-choice' && currentQuestion.options?.map((opt, idx) => (
                  <label key={idx} className={`group flex items-center p-4 md:p-6 rounded-2xl border-2 transition-all cursor-pointer ${answers[currentQuestion.id] === idx ? 'border-blue-600 bg-blue-50/50 shadow-md shadow-blue-50' : 'border-gray-100 hover:border-gray-300 bg-white'}`}>
                    <input type="radio" className="hidden" name={currentQuestion.id} checked={answers[currentQuestion.id] === idx} onChange={() => setAnswers({ ...answers, [currentQuestion.id]: idx })} />
                    <div className={`w-5 h-5 md:w-6 md:h-6 rounded-full border-2 mr-4 flex items-center justify-center ${answers[currentQuestion.id] === idx ? 'border-blue-600 bg-blue-600' : 'border-gray-300'}`}>
                      {answers[currentQuestion.id] === idx && <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-white rounded-full"></div>}
                    </div>
                    <span className={`text-sm md:text-lg font-bold ${answers[currentQuestion.id] === idx ? 'text-blue-900' : 'text-gray-700'}`}>{opt}</span>
                  </label>
                ))}

                {(currentQuestion.type === 'short-answer' || currentQuestion.type === 'essay') && (
                  <textarea
                    className="w-full p-4 md:p-8 border-2 border-gray-100 rounded-2xl text-sm md:text-lg font-medium focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition-all outline-none bg-gray-50/30"
                    placeholder={currentQuestion.placeholder}
                    rows={currentQuestion.type === 'essay' ? 8 : 3}
                    value={(answers[currentQuestion.id] as string) || ''}
                    onChange={(e) => setAnswers({ ...answers, [currentQuestion.id]: e.target.value })}
                  />
                )}
              </div>
            </div>

            <div className="bg-gray-50/80 p-6 md:p-8 flex justify-between border-t border-gray-100 items-center">
              <button
                disabled={currentQuestionIndex === 0}
                onClick={() => setCurrentQuestionIndex(prev => prev - 1)}
                className="px-4 md:px-8 py-3 rounded-xl font-bold text-gray-500 hover:text-gray-900 disabled:opacity-30 transition-colors text-sm"
              >
                <i className="fas fa-chevron-left mr-2"></i> Previous
              </button>
              <button
                disabled={currentQuestionIndex === MOCK_QUESTIONS.length - 1}
                onClick={() => setCurrentQuestionIndex(prev => prev + 1)}
                className="bg-gray-900 text-white px-6 md:px-10 py-3 rounded-xl font-bold hover:bg-black transition-all shadow-xl active:scale-95 disabled:opacity-30 text-sm"
              >
                Next <i className="fas fa-chevron-right ml-2 text-[10px]"></i>
              </button>
            </div>
          </div>
        </div>

        <div className="w-full lg:w-80 flex flex-col">
          <div className="bg-gray-950 text-white rounded-3xl shadow-2xl border border-gray-800 overflow-hidden flex flex-col max-h-[60vh]">

            {/* HEADER */}
            <div className="p-5 bg-gray-700 flex items-center justify-between border-b border-gray-800">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
                  Live Security Console
                </h3>
              </div>
              <i className="fas fa-terminal text-[10px] text-gray-600" />
            </div>

            {/* LOG AREA (SCROLLABLE) */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4 font-mono text-[10px] scroll-smooth">
              {liveEvents.length === 0 && (
                <p className="text-gray-600 italic">
                  Environment secure. Monitoring active...
                </p>
              )}

              {liveEvents.map(event => (
                <div
                  key={event.id}
                  className="p-3 rounded-xl border bg-gray-900/50 border-gray-800 animate-in slide-in-from-bottom-2 duration-300"
                >
                  <div className="flex justify-between mb-2 opacity-50">
                    <span className="font-bold text-blue-400 tracking-wider">
                      [{event.type}]
                    </span>
                    <span>
                      {new Date(event.timestamp).toLocaleTimeString([], {
                        hour12: false,
                        second: '2-digit',
                      })}
                    </span>
                  </div>

                  <p className="text-gray-300 leading-relaxed uppercase">
                    {event.metadata.reason ||
                      event.metadata.focusState ||
                      'EVENT_CAPTURE'}
                  </p>
                </div>
              ))}

              <div ref={consoleEndRef} />
            </div>

            {/* FOOTER */}
            <div className="p-5 bg-gray-900/50 border-t border-gray-800 flex flex-col gap-2">
              <div className="flex justify-between items-center text-[10px]">
                <span className="text-gray-500 uppercase font-black tracking-widest">
                  Database Sync
                </span>

                {syncStatus === 'syncing' && (
                  <span className="text-amber-500 flex items-center gap-1 font-bold">
                    <i className="fas fa-sync fa-spin" /> SYNCING
                  </span>
                )}

                {syncStatus === 'synced' && (
                  <span className="text-green-500 flex items-center gap-1 font-bold">
                    <i className="fas fa-cloud-check" /> PROTECTED
                  </span>
                )}

                {syncStatus === 'failed' && (
                  <span className="text-red-500 flex items-center gap-1 font-bold">
                    <i className="fas fa-wifi-slash" /> OFFLINE
                  </span>
                )}

                {syncStatus === 'idle' && (
                  <span className="text-gray-600">IDLE</span>
                )}
              </div>

              <div className="h-1 bg-gray-800 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 ${syncStatus === 'syncing'
                      ? 'w-2/3 bg-amber-500 animate-pulse'
                      : syncStatus === 'synced'
                        ? 'w-full bg-green-500'
                        : syncStatus === 'failed'
                          ? 'w-1/3 bg-red-500'
                          : 'w-0'
                    }`}
                />
              </div>

              <p className="text-[8px] text-gray-600 text-center uppercase mt-1">
                Audit Trail Real-time Push Active
              </p>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default SecureTest;
