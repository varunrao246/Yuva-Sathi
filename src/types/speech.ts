/**
 * Ambient type definitions for Web Speech API (SpeechRecognition).
 * Standardizes browser differences across Chrome, Edge, Safari without unsafe 'any' casts.
 */

export interface ISpeechRecognitionResult {
  readonly length: number;
  [index: number]: {
    readonly transcript: string;
    readonly confidence: number;
  };
}

export interface ISpeechRecognitionResultList {
  readonly length: number;
  [index: number]: ISpeechRecognitionResult;
}

export interface ISpeechRecognitionEvent {
  readonly resultIndex: number;
  readonly results: ISpeechRecognitionResultList;
}

export interface ISpeechRecognitionErrorEvent {
  readonly error: string;
  readonly message?: string;
}

export interface ISpeechRecognition extends EventTarget {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  continuous: boolean;
  onstart: (() => void) | null;
  onresult: ((event: ISpeechRecognitionEvent) => void) | null;
  onerror: ((event: ISpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
}

export interface IWindowWithSpeech extends Window {
  SpeechRecognition?: new () => ISpeechRecognition;
  webkitSpeechRecognition?: new () => ISpeechRecognition;
}
