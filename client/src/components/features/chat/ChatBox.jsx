import { useState } from "react";
import { Send } from "lucide-react";
import { Button, Input } from "../../ui";
import MessageList from "./MessageList";

export default function ChatBox({ messages = [], currentUserId, onSend }) {
  const [body, setBody] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!body.trim()) return;
    onSend?.(body.trim());
    setBody("");
  };

  return (
    <section className="flex h-[520px] flex-col rounded-[14px] border border-[#D9D0C2] bg-[#F2EDE4]">
      <div className="flex-1 overflow-y-auto p-4">
        <MessageList messages={messages} currentUserId={currentUserId} />
      </div>
      <form onSubmit={handleSubmit} className="flex gap-2 border-t border-[#D9D0C2] bg-white p-3">
        <Input value={body} onChange={(event) => setBody(event.target.value)} placeholder="Write a message..." className="flex-1" />
        <Button type="submit" icon={Send}>Send</Button>
      </form>
    </section>
  );
}
