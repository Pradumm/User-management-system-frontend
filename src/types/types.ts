
export const EventType = {
    BROWSER_CHECK: 'BROWSER_CHECK',
    ACCESS_DENIED: 'ACCESS_DENIED',
    FULLSCREEN_ENTER: 'FULLSCREEN_ENTER',
    FULLSCREEN_EXIT: 'FULLSCREEN_EXIT',
    TAB_BLUR: 'TAB_BLUR',
    TAB_FOCUS: 'TAB_FOCUS',
    COPY_ATTEMPT: 'COPY_ATTEMPT',
    PASTE_ATTEMPT: 'PASTE_ATTEMPT',
    CUT_ATTEMPT: 'CUT_ATTEMPT',
    TIMER_TICK: 'TIMER_TICK',
    TIMER_EXPIRED: 'TIMER_EXPIRED',
    TEST_START: 'TEST_START',
    TEST_SUBMIT: 'TEST_SUBMIT',
    OFFLINE: 'OFFLINE',
    ONLINE: 'ONLINE'
} as const;

export type EventType = typeof EventType[keyof typeof EventType];

export interface AssessmentLog {
    id: string;
    type: EventType;
    timestamp: number;
    attemptId: string;
    questionId?: string;
    metadata: {
        browserName?: string;
        browserVersion?: string;
        reason?: string;
        focusState?: 'focused' | 'blurred';
        fullscreenState?: 'enabled' | 'disabled';
        [key: string]: any;
    };
}

export type QuestionType = 'multiple-choice' | 'short-answer' | 'essay';

export interface Question {
    id: string;
    type: QuestionType;
    text: string;
    options?: string[]; // Required for multiple-choice
    correctIndex?: number; // Required for multiple-choice
    placeholder?: string; // Optional for text types
}
