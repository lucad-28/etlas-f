export interface Scheme {
  id: string;
  title: string;
  content: string;
  attachment_url?: string;
  created_at: Date;
}

export interface SchemeCreate
  extends Pick<Scheme, "title" | "content" | "attachment_url"> {
    user_id: string;
  }

export interface SchemeUpdate extends Partial<SchemeCreate> {
  id: string;
}

export interface MultiScheme {
  total: number;
  limit: number;
  offset: number;
  pages: number;
  data: Scheme[];
}
