import { describe } from "vitest";

// When running through Caddy proxy, use localhost:8080
// RUN_URL is for page/client requests, BASE_URL is for API requests through /api prefix
const RUN_URL = process.env.RUN_URL || "http://localhost:8080";
const BASE_URL = process.env.API_URL || "http://localhost:8080/api";

// --- Page Navigation Helper (for HTML page tests) ---
interface PageResult {
  page: {
    content: () => Promise<string>;
  };
  res: {
    status: () => number;
    headers: () => Record<string, string>;
  };
}

async function createPageNavigator(url: string): Promise<PageResult> {
  // Send browser-like headers to get HTML instead of JSON
  const response = await fetch(url, {
    headers: {
      Accept:
        "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
      "User-Agent":
        "Mozilla/5.0 (compatible; ViTest/1.0; +http://vitest.dev/)",
    },
  });
  const content = await response.text();
  const headers: Record<string, string> = {};
  response.headers.forEach((value, key) => {
    headers[key] = value;
  });

  return {
    page: {
      content: async () => content,
    },
    res: {
      status: () => response.status,
      headers: () => headers,
    },
  };
}

// --- API Types ---
export interface Course {
  uuid: string;
  name: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
  materials?: Material[];
  quizzes?: Quiz[];
  feed?: FeedItem[];
}

export interface Material {
  uuid: string;
  type: "file" | "url";
  name: string;
  description?: string;
  fileUrl?: string;
  mimeType?: string;
  sizeBytes?: number;
  url?: string;
  faviconUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Quiz {
  uuid: string;
  title: string;
  questions: Question[];
  attemptsCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export type Question = SingleChoiceQuestion | MultipleChoiceQuestion;

export interface SingleChoiceQuestion {
  uuid?: string;
  type: "singleChoice";
  question: string;
  options: string[];
  correctIndex: number;
}

export interface MultipleChoiceQuestion {
  uuid?: string;
  type: "multipleChoice";
  question: string;
  options: string[];
  correctIndices: number[];
}

export interface QuizAnswer {
  uuid: string;
  selectedIndex?: number;
  selectedIndices?: number[];
}

export interface QuizSubmitRequest {
  answers: QuizAnswer[];
}

export interface QuizSubmitResponse {
  quizUuid: string;
  score: number;
  maxScore: number;
  correctPerQuestion: boolean[];
  submittedAt: string;
}

export interface FeedItem {
  uuid: string;
  type: "manual" | "system";
  message: string;
  edited?: boolean;
  createdAt: string;
  updatedAt?: string;
}

// --- API Request Helpers ---
export async function apiRequest<T>(
  method: string,
  endpoint: string,
  body?: any
) {
  const headers: Record<string, string> = {};

  let requestBody = body;

  if (body instanceof FormData) {
    // Let fetch handle Content-Type for FormData (it adds boundary)
  } else if (body) {
    headers["Content-Type"] = "application/json";
    requestBody = JSON.stringify(body);
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    method,
    headers,
    body: requestBody,
  });

  const data = response.status !== 204 ? await response.json() : null;
  return { data: data as T, response };
}

export async function apiGet<T>(endpoint: string) {
  return apiRequest<T>("GET", endpoint);
}

export async function apiPost<T>(endpoint: string, body: any) {
  return apiRequest<T>("POST", endpoint, body);
}

export async function apiPut<T>(endpoint: string, body: any) {
  return apiRequest<T>("PUT", endpoint, body);
}

export async function apiDelete(endpoint: string) {
  return apiRequest("DELETE", endpoint);
}

// --- Phase Test Wrapper ---
interface PhaseContext {
  page: (url: string) => Promise<PageResult>;
}

export function phase(
  phaseNumber: number,
  testFn: ((context: PhaseContext) => void) | (() => void)
) {
  const context: PhaseContext = {
    page: createPageNavigator,
  };

  describe(`Phase ${phaseNumber}`, () => {
    // Call testFn with context if it expects parameters, otherwise call without
    if (testFn.length > 0) {
      (testFn as (context: PhaseContext) => void)(context);
    } else {
      (testFn as () => void)();
    }
  });
}

export { RUN_URL, BASE_URL };
