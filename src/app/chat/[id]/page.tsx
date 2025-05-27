"use client";

import type React from "react";

import { useState, useRef, useEffect } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { LoaderCircle, SendHorizonal } from "lucide-react";
import { ChatMessage } from "@/components/chat-message";
import { Message, MessageCreate, MultiMessage } from "@/types/models/message";
import { useSession } from "next-auth/react";
import { toastVariables } from "@/components/ToastVariables";
import { useCreateMessage } from "@/stores/useCreateMessage";
import { useRouter } from "next/navigation";
import { MultiScheme, Scheme } from "@/types/models/scheme";
import { MessageSkeleton } from "@/components/MessageSkeleton";

export default function ChatPage() {
  const params = useParams();
  const chatId = params.id as string;
  const [input, setInput] = useState("");
  const { data: session } = useSession();
  const [messages, setMessages] = useState<Message[]>([]);
  const [schemeChat, setSchemeChat] = useState<Scheme | undefined>();
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [loadingScheme, setLoadingScheme] = useState(true);
  const chat_id = useCreateMessage((state) => state.chat_id);
  const storeInput = useCreateMessage((state) => state.input);
  const clearNewMessage = useCreateMessage((state) => state.clearNewMessage);
  const [processing, setProcessing] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Simulate fetching chat history from an API
    const fetchChatHistory = async () => {
      if (chat_id || storeInput) {
        setLoadingHistory(false);
        return;
      }

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_ETLAS_API_URL}/messages/by`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            chat_id: chatId,
          }),
        }
      );

      try {
        if (!res.ok) {
          throw new Error("Failed API request to fetch chat history");
        }

        const data = (await res.json()) as MultiMessage;
        console.log("Chat history fetched successfully:", data);
        setMessages(
          data.data.sort((a, b) => {
            return (
              new Date(a.created_at).getTime() -
              new Date(b.created_at).getTime()
            );
          })
        );
        setLoadingHistory(false);
        console.log(`Fetching chat history for chat ID: ${chatId}`);
      } catch (error) {
        console.error("Error fetching chat history:", error);
        toastVariables.error("Failed to fetch chat history");
        setLoadingHistory(false);
        return;
      }
    };

    const fetchSchemeChat = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_ETLAS_API_URL}/schemes/by`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              chat_id: chatId,
            }),
          }
        );
        if (!res.ok) {
          console.error("Failed to fetch scheme chat");
          toastVariables.error("Failed to fetch scheme chat");
          return;
        }
        const data = (await res.json()) as MultiScheme;
        console.log("Scheme chat fetched successfully:", data);
        setSchemeChat(data.data.length > 0 ? data.data[0] : undefined);
        setLoadingScheme(false);
      } catch (error) {
        console.error("Error fetching scheme chat:", error);
        toastVariables.error("Failed to fetch scheme chat");
        setLoadingScheme(false);
        return;
      }
    };

    const fetchAll = async () => {
      try {
        await fetchChatHistory();
        await fetchSchemeChat();
      } catch (error) {
        console.error("Error fetching chat data:", error);
        toastVariables.error(
          "Failed to fetch chat data. Please try again later."
        );
      }
    };

    fetchAll();
  }, [chatId]);

  useEffect(() => {
    const initializeChat = async () => {
      setMessages([
        {
          id: Date.now().toString(),
          created_at: new Date(),
          role: "user",
          content: {
            content: storeInput,
          },
        },
      ]);

      setProcessing(true);

      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_ETLAS_API_URL}/messages/`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              chat_id,
              role: "user",
              content: {
                content: storeInput,
              },
            }),
          }
        );
        clearNewMessage();

        if (!res.ok) {
          console.error("Failed to send initial message");
          toastVariables.error("Failed to send initial message");
          return;
        }

        const data = (await res.json()) as Message;
        setMessages((prev) => [...prev, data]);
        setProcessing(false);
      } catch (error) {
        console.error("Error initializing chat:", error);
        setProcessing(false);
        router.replace("/");
        toastVariables.error(
          "Failed to initialize chat. Please try again later."
        );
        return;
      }
    };

    if (storeInput && chat_id === chatId) {
      console.log(
        " --------- Initializing chat with stored input:",
        storeInput
      );
      initializeChat();
    }
  }, [chatId]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  if (!session) {
    return null;
  }
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      setProcessing(true);
      const newMessage: MessageCreate = {
        chat_id: chatId,
        role: "user",
        content: {
          content: input,
        },
      };

      setMessages([
        ...messages,
        {
          id: Date.now().toString(),
          created_at: new Date(),
          role: "user",
          content: newMessage.content,
        },
      ]);

      setInput("");

      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_ETLAS_API_URL}/messages/`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(newMessage),
          }
        );

        if (!res.ok) {
          throw new Error("Failed to send message");
        }
        const data = (await res.json()) as Message;

        setMessages((prev) => [...prev, data]);
        setProcessing(false);
      } catch (error) {
        console.error("Error sending message:", error);
        setProcessing(false);
        toastVariables.error("Failed to send message. Please try again later.");
        return;
      }
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-3xl mx-auto">
          {loadingHistory ? (
            <>
              <MessageSkeleton isUser={true} lines={3} />
              <MessageSkeleton isUser={false} lines={3} />
            </>
          ) : (
            messages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="w-full p-2">
        <div className="max-w-2xl bg-muted mx-auto p-4 rounded-lg shadow-md">
          <form
            onSubmit={handleSubmit}
            className="flex space-x-2 items-center justify-center"
          >
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message here..."
              className="max-h-[20vh] bg-white"
            />
            <Button
              disabled={processing}
              type="submit"
              variant="default"
              size="icon"
            >
              {processing ? (
                <LoaderCircle className="h-4 w-4 animate-spin" />
              ) : (
                <SendHorizonal className="h-4 w-4" />
              )}
            </Button>
          </form>
          <span className="text-sm text-gray-500 mt-3 ml-4">
            {loadingScheme ? (
              <div
                className={`h-4 w-[50%] rounded animate-pulse bg-gray-300`}
              />
            ) : schemeChat ? (
              <span>
                Scheme: <strong>{schemeChat.title}</strong>
              </span>
            ) : (
              "No scheme selected for this chat."
            )}
          </span>
        </div>
      </div>
    </div>
  );
}
