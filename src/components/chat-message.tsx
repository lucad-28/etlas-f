import { Card } from "@/components/ui/card";
import { CodeDisplay } from "@/components/code-display";
import { Message } from "@/types/models/message";

export function ChatMessage({ message }: { message: Message }) {
  const isUser = message.role === "user";
  let code = message.role === "ai" ? message.content.content_code : null;
  let language = "";
  if (code) {
    const match = code.match(/%([^%]*?)%/);
    if (match && match[1]) {
      language = match[1].trim();
      code = code.replace(/%[^%]*?%/g, "").trim();
    }
  }

  return (
    <div className={`flex mb-4 ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`${
          message.role === "ai" && message.content.content_code
            ? "flex flex-col gap-4 w-full"
            : "max-w-[80%]"
        }`}
      >
        <Card
          className={`p-4 ${
            isUser
              ? "bg-primary text-primary-foreground"
              : message.role === "ai" && message.content.content_code
              ? "max-w-[80%] border-0 shadow-none"
              : "w-full border-0 shadow-none"
          }`}
        >
          <div className="whitespace-pre-wrap">
            {message.role === "user"
              ? message.content.content
              : message.content.content_analysis}
          </div>
        </Card>

        {code && (
          <div className="w-full flex items-center justify-center">
            <div className="mt-2 md:mt-0 md:w-[500px]">
              <CodeDisplay
                code={code}
                language={language}
              />
            </div>
          </div>
        )}

        {message.role === "ai" && message.content.content_comment && (
          <Card className="p-4 mt-2 bg-muted">
            <div className="text-sm text-black">
              {message.content.content_comment}
            </div>
          </Card>
        )}

      </div>
    </div>
  );
}
