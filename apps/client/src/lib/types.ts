export type UUID = string;

//summary courses
export type CoursesSummary = {
    uuid: UUID,
    name: string,
    description: string,
    createdAt: string,
    updatedAt: string

  }
//materials

export interface FileMaterial {
  uuid: UUID;
  type: "file";
  name: string;
  description: string;
  fileUrl: string;
  mimeType: string;
  sizeBytes: number;
}

export interface UrlMaterial {
  uuid: UUID;
  type: "url";
  name: string;
  description: string;
  url: string;
  faviconUrl: string;
}

export type Material = FileMaterial | UrlMaterial;

//quiz questions

export interface SingleChoiceQuestion {
  uuid: UUID;
  type: "singleChoice";
  question: string;
  options: string[];
  correctIndex: number;
}

export interface MultipleChoiceQuestion {
  uuid: UUID;
  type: "multipleChoice";
  question: string;
  options: string[];
  correctIndices: number[];
}

export type QuizQuestion =
  | SingleChoiceQuestion
  | MultipleChoiceQuestion;

//quiz

export interface Quiz {
  uuid: UUID;
  title: string;
  attemptsCount: number;
  questions: QuizQuestion[];
}

//feed

export interface ManualFeedItem {
  uuid: UUID;
  type: "manual";
  message: string;
  edited: boolean;
  createdAt: string; // ISO date
  updatedAt: string; // ISO date
}

export type FeedItem = ManualFeedItem;

//root

export interface Course {
  uuid: UUID;
  name: string;
  description: string;
  materials: Material[];
  quizzes: Quiz[];
  feed: FeedItem[];
}
