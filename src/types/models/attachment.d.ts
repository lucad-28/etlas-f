export interface Attachment {
  id: string;
  url: string;
  filename: string;
  created_at: Date;
}
export interface AttachmentCreate
  extends Pick<Attachment, "url" | "filename"> {}
export interface AttachmentUpdate extends Partial<AttachmentCreate> {
  id: string;
}
export interface MultiAttachment {
  total: number;
  limit: number;
  offset: number;
  pages: number;
  data: Attachment[];
}