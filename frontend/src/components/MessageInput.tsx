import React, { useState } from "react";

export function MessageInput({ onSend }: { onSend: (text: string) => void }) {
  const [text, setText] = useState("");
  const submit = () => {
    if (!text.trim()) return;
    onSend(text.trim());
    setText("");
  };
  return (
    <div className="flex gap-2">
      <input
        aria-label="Message"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => { if (e.key === "Enter") submit(); }}
        className="flex-1 p-2 border rounded"
        placeholder="Type a message..."
      />
      <button onClick={submit} className="px-4 py-2 bg-blue-600 text-white rounded">Send</button>
    </div>
  );
}
