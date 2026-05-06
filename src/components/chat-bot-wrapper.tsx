"use client";

import { useState } from "react";
import AIChatBot, { AIChatBotTrigger } from "./ai-chat-bot";

export default function ChatBotWrapper() {
  const [isChatOpen, setIsChatOpen] = useState(false);

  return (
    <>
      {!isChatOpen && (
        <AIChatBotTrigger onClick={() => setIsChatOpen(true)} />
      )}
      <AIChatBot
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
      />
    </>
  );
}
