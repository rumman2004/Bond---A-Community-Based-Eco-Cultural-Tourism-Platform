import { Avatar } from "../../ui";
import { formatDateTime } from "../../../utils/dateUtils";

export default function MessageList({ messages = [], currentUserId }) {
  return (
    <div className="space-y-4">
      {messages.map((message) => {
        const mine = message.senderId === currentUserId;
        return (
          <div key={message.id} className={`flex gap-3 ${mine ? "justify-end" : ""}`}>
            {!mine && <Avatar name={message.senderName} size="sm" />}
            <div className={`max-w-[75%] rounded-[14px] px-4 py-3 ${mine ? "bg-[#1C3D2E] text-white" : "bg-white text-[#1A2820]"}`}>
              <p className="text-sm">{message.body}</p>
              <p className={`mt-1 text-[11px] ${mine ? "text-white/60" : "text-[#7A9285]"}`}>{message.createdAt ? formatDateTime(message.createdAt) : "Now"}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
