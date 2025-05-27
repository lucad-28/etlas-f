"use client";

import type React from "react";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { SendHorizonal, LoaderCircle } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { useSession } from "next-auth/react";
import { useCreateMessage } from "@/stores/useCreateMessage";
import { toastVariables } from "@/components/ToastVariables";
import { Chat } from "@/types/models/chat";
import { MultiScheme, Scheme } from "@/types/models/scheme";

export default function Home() {
  const { data: session } = useSession();
  const [message, setMessage] = useState("");
  const [scheme, setScheme] = useState("");
  const [schemes, setSchemes] = useState<Scheme[]>([]);
  const [creatingChat, setCreatingChat] = useState(false);
  const [fetchingSchemes, setFetchingSchemes] = useState(false);
  const setNewMessage = useCreateMessage((state) => state.setNewMessage);
  const router = useRouter();

  // Fetch schemes on component mount
  useEffect(() => {
    const fetchSchemes = async () => {
      if (!session) {
        console.warn("No session found, skipping scheme fetch");
        return;
      }
      try {
        setFetchingSchemes(true);
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_ETLAS_API_URL}/schemes/by`,
          {
            headers: {
              "Content-Type": "application/json",
            },
            method: "POST",
            body: JSON.stringify({
              user_id: session.user.id,
            }),
          }
        );

        if (!res.ok) {
          console.error("Failed to fetch schemes");
          return;
        }
        const data = (await res.json()) as MultiScheme;
        setSchemes(data.data || []);
      } catch (error) {
        console.error("Error fetching schemes:", error);
        toastVariables.error("Failed to load schemes. Please try again later.");
      } finally {
        setFetchingSchemes(false);
      }
    };

    fetchSchemes();
  }, []);

  if (!session) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      setCreatingChat(true);
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_ETLAS_API_URL}/chats/`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              scheme_id: scheme === "" ? null : scheme,
              user_id: session.user.id,
            }),
          }
        );

        if (!res.ok) {
          throw new Error("Failed to create chat");
        }

        const data = (await res.json()) as Chat;

        setNewMessage({
          input: message,
          chat_id: data.id,
        });

        router.push(`/chat/${data.id}`);
      } catch (error) {
        console.error("Error creating chat:", error);
        toastVariables.error("Failed to create chat. Please try again later.");
      } finally {
        setCreatingChat(false);
      }
    }
  };

  return (
    <div className="h-full flex flex-col items-center justify-center p-4">
      <h1 className="text-3xl font-medium mb-4">Bienvenido a Etlas</h1>
      <Card className="w-full max-w-2xl rounded-2xl shadow-lg">
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex space-x-2 mt-4">
              <Textarea
                value={message}
                disabled={creatingChat}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your message here..."
                className="max-h-[20vh]"
              />
            </div>
            <div className="flex space-x-2 justify-between items-center">
              <div className="w-fit">
                <Select value={scheme} onValueChange={setScheme}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a scheme " />
                  </SelectTrigger>
                  {fetchingSchemes ? (
                    <SelectContent>
                      <SelectItem
                        value="loading"
                        disabled
                        className="flex items-center justify-center"
                      >
                        <LoaderCircle className="h-4 w-4 animate-spin" />
                      </SelectItem>
                    </SelectContent>
                  ) : (
                    <SelectContent>
                      {schemes.map((s) => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  )}
                </Select>
              </div>

              <Button
                type="submit"
                disabled={creatingChat}
                variant="default"
                size="icon"
              >
                {creatingChat ? (
                  <LoaderCircle className="h-4 w-4 animate-spin" />
                ) : (
                  <SendHorizonal className="h-4 w-4" />
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
