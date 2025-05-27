export interface Chat {
  id: string;
  name_chat: string;
  created_at: Date;
}

export interface ChatCreate extends Pick<Chat, "name_chat"> {}

export interface ChatUpdate extends Partial<Pick<ChatCreate, "name_chat">> {
  id: string;
}

export interface MultiChat {
  total: number;
  limit: number;
  offset: number;
  pages: number;
  data: Chat[];
}
