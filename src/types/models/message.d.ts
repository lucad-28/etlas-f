import { Attachment } from "./attachment";

export interface ContentAi {
  content_analysis?: string;
  content_comment?: string;
  content_code?: string;
  content_executable_code?: string;
}

export interface ContentUser {
  content?: string;
}

export interface MessageAi {
  id: string;
  role: "ai";
  content: ContentAi;
  created_at: Date;
  attachments?: Attachment[];
}

export interface MessageUser {
  id: string;
  role: "user";
  content: ContentUser;
  created_at: Date;
  attachments?: Attachment[];
}

export type Message = MessageAi | MessageUser;

export interface MessageCreate {
  role: "user";
  content: ContentUser;
  attachments?: Attachment[];
  chat_id?: string;
}

export interface MultiMessage {
  total: number;
  limit: number;
  offset: number;
  pages: number;
  data: Message[];
}
