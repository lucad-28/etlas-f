"use client";
import React, { useEffect } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { SquareChartGantt } from "lucide-react";

export default function Page() {
  const { data: session } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (session) {
      router.replace("/");
    }
  }, [session]);

  const onLogin = async () => {
    try {
      await signIn("google", {
        redirect: true,
      });
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen bg-background">
      <div className="w-full flex flex-row items-center justify-between pt-20 px-8">
        <div className="flex flex-row items-center gap-2">
          <SquareChartGantt size={32} />
          <h1 className="text-2xl font-bold">etlas</h1>
        </div>
      </div>

      <div className="w-full fixed h-1/2 flex flex-col items-center justify-center gap-2 px-10">
        <h2 className="text-3xl font-bold">Welcome</h2>
        <span className="w-full text-center text-lg text-wrap">
          Let{"'"}s keep it up
        </span>
        <Button
          variant={"default"}
          className="font-semibold text-sm"
          onClick={onLogin}
        >
          Begin
        </Button>
      </div>
    </div>
  );
}
