"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, MessageSquare, TableProperties, LogOut } from "lucide-react";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { useSession, signOut } from "next-auth/react";
import { supabase } from "@/lib/supabase";
import { Chat, MultiChat } from "@/types/models/chat";
import { NoiseType } from "@/types/noise";
import { Noise } from "@/components/Noise";
import { AnimatedText } from "@/components/AnimatedText";

export function Sidebar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const router = useRouter();
  const [noise, setNoise] = useState<NoiseType | undefined>();
  const [chatHistory, setChatHistory] = useState<Chat[]>([]);

  useEffect(() => {
    if (!session?.user?.id) {
      console.error("Session or user ID is not available");
      return;
    }

    console.log("Setting up Supabase listener for user:", session.user.id);

    const fetchChatHistory = async () => {
      try {
        console.log("Fetching chat history...");
        const res = await fetch(`${process.env.NEXT_PUBLIC_ETLAS_API_URL}/chats/by`, {
          headers: {
            "Content-Type": "application/json",
          },
          method: "POST",
          body: JSON.stringify({
            user_id: session.user.id,
          }),
        });

        if (!res.ok) {
          console.error("Failed to fetch chat history, status:", res.status);
          return;
        }

        const data = (await res.json()) as MultiChat;
        console.log(
          "Chat history fetched successfully:",
          data.data?.length,
          "chats"
        );

        const sortedChats = (data.data || []).sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );

        setChatHistory(sortedChats);
      } catch (error) {
        console.error("Error fetching chat history:", error);
        setNoise({
          type: "error",
          message: "Failed to load chat history. Please try again later.",
        });
      }
    };

    fetchChatHistory();

    const channelName = `chat-changes-${session.user.id}`;
    console.log("Creating channel:", channelName);

    const subscription = supabase
      .channel(channelName)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "chats",
          filter: `userid=eq.${session.user.id}`,
        },
        (payload) => {
          console.log("🔥 REALTIME EVENT RECEIVED:", {
            eventType: payload.eventType,
            table: payload.table,
            new: payload.new,
            old: payload.old,
            timestamp: new Date().toISOString(),
          });

          switch (payload.eventType) {
            case "INSERT":
              console.log("Processing INSERT event");
              setChatHistory((prev) => {
                console.log("Current chat history length:", prev.length);
                const exists = prev.some((chat) => chat.id === payload.new.id);
                if (exists) {
                  console.log("Chat already exists, skipping");
                  return prev;
                }

                const newChat = {
                  id: payload.new.id,
                  name_chat: payload.new.namechat,
                  created_at: new Date(payload.new.createdat),
                };

                console.log("Adding new chat:", newChat);
                const updatedHistory = [newChat, ...prev].sort(
                  (a, b) =>
                    new Date(b.created_at).getTime() -
                    new Date(a.created_at).getTime()
                );
                console.log("New chat history length:", updatedHistory.length);
                return updatedHistory;
              });
              break;

            case "UPDATE":
              console.log("Processing UPDATE event");
              setChatHistory((prev) =>
                prev.map((chat) => {
                  if (chat.id === payload.new.id) {
                    console.log("Updating chat:", chat.id);
                    return {
                      ...chat,
                      name_chat: payload.new.namechat || chat.name_chat,
                      created_at: new Date(
                        payload.new.createdat || chat.created_at
                      ),
                    };
                  }
                  return chat;
                })
              );
              break;

            case "DELETE":
              console.log("Processing DELETE event");
              setChatHistory((prev) => {
                const filtered = prev.filter(
                  (chat) => chat.id !== payload.old.id
                );
                console.log("Removed chat, new length:", filtered.length);
                return filtered;
              });
              break;

            default:
              console.warn("Unknown event type");
          }
        }
      )
      .subscribe((status, err) => {
        console.log("📡 Subscription status changed:", {
          status,
          error: err,
          timestamp: new Date().toISOString(),
        });

        switch (status) {
          case "SUBSCRIBED":
            console.log("✅ Successfully subscribed to realtime changes");
            break;
          case "CHANNEL_ERROR":
            console.error("❌ Channel error:", err);
            // Reintentar después de 5 segundos
            setTimeout(() => {
              console.log("🔄 Retrying subscription...");
              fetchChatHistory();
            }, 5000);
            break;
          case "TIMED_OUT":
            console.error("⏰ Subscription timed out");
            break;
          case "CLOSED":
            console.log("🔒 Channel closed");
            break;
          default:
            console.log("📊 Status:", status);
        }
      });

    // Test manual para verificar que la función funciona
    console.log("Subscription object:", subscription);

    return () => {
      console.log("🧹 Cleaning up subscription:", channelName);
      if (subscription) {
        supabase.removeChannel(subscription);
        console.log("✅ Subscription cleaned up");
      }
    };
  }, [session?.user?.id]);

  if (!session) return null; // Ensure session is available before rendering
  const createNewChat = () => {
    router.push("/");
  };

  const handleLogout = () => {
    signOut({ callbackUrl: "/" });
  };

  if (noise && noise.styleType === "page") {
    return <Noise noise={noise} />;
  }

  return (
    <div className="w-64 bg-sidebar h-full flex flex-col border-r">
      {noise && <Noise noise={noise} />}
      <div className="p-4">
        <Button
          onClick={createNewChat}
          className="w-full justify-start"
          variant="default"
        >
          <div className="mr-2 bg-white rounded-full p-1">
            <Plus className="h-4 w-4 text-primary font-extrabold" />
          </div>
          Create chat
        </Button>
      </div>

      <div className="px-4 py-2">
        <Button variant="ghost" className="w-full justify-start" asChild>
          <Link href="/schemes">
            <TableProperties className="mr-2 h-4 w-4" />
            Schemas
          </Link>
        </Button>
      </div>

      <div className="px-4 py-2 text-sm font-medium">Chat History</div>

      <ScrollArea className="flex-1">
        <div className="px-2">
          {chatHistory.map((chat) => (
            <Button
              key={chat.id}
              variant={pathname === `/chat/${chat.id}` ? "secondary" : "ghost"}
              className="w-full justify-start mb-1 text-left overflow-hidden"
              asChild
            >
              <Link href={`/chat/${chat.id}`}>
                <MessageSquare className="mr-2 h-4 w-4 shrink-0" />
                {chat.name_chat ? (
                  <span className="truncate">{chat.name_chat}</span>
                ) : (
                  <AnimatedText
                    isLoading={true}
                    className="text-secondary-foreground"
                  >
                    Untitled
                  </AnimatedText>
                )}
              </Link>
            </Button>
          ))}
        </div>
      </ScrollArea>

      <div className="px-4 py-2 mt-auto">
        <div className="p-2 mt-auto flex flex-row items-center bg-muted rounded-lg relative overflow-hidden group hover:pr-12 transition-all duration-300">
          <Avatar className="">
            {session?.user?.image && session.user.name ? (
              <AvatarImage src={session.user.image} alt={session.user.name} />
            ) : (
              <AvatarImage src={"images/avatar-default.svg"} alt={"user"} />
            )}
          </Avatar>
          <div className="ml-2 flex flex-col">
            {session?.user?.name && (
              <span className="sm:block ml-2 font-medium mr-2 text-xs">
                {session.user.name}
              </span>
            )}
            {session?.user?.email && (
              <span className="sm:block ml-2 text-secondary-foreground font-light mr-2 text-xs">
                {session.user.email}
              </span>
            )}
          </div>

          {/* Botón de logout con gradiente */}
          <div
            className="absolute right-0 top-0 h-full w-24
                     bg-gradient-to-l from-red-800 via-red-700 to-transparent 
                     opacity-0 group-hover:opacity-100 
                     transform translate-x-full group-hover:translate-x-0 
                     transition-all duration-300 ease-in-out
                     flex items-center justify-center
                     hover:from-red-700 hover:via-red-600
                     hover:scale-110 cursor-pointer"
            onClick={handleLogout}
            aria-label="Logout"
          >
            <LogOut className="h-5 w-5 text-white font-bold" />
          </div>
        </div>
      </div>
    </div>
  );
}
