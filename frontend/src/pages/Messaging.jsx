import { useState, useEffect } from "react";
import { Input } from "./components/input";
import { Button } from "./components/button";
import Api from "./api";

export function Messaging() {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [recipientId, setRecipientId] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await Api.getMessages();
        setMessages(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch messages", error);
        setLoading(false);
      }
    };
    fetchMessages();
  }, []);

  const handleSendMessage = async () => {
    try {
      await Api.sendMessage({ recipient: recipientId, content: newMessage });
      setNewMessage("");
      const response = await Api.getMessages();
      setMessages(response.data);
    } catch (error) {
      console.error("Failed to send message", error);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="p-6">
      <h2 className="text-3xl font-bold mb-6">Messages</h2>
      <div className="space-y-4 mb-6">
        {messages.map((msg) => (
          <div key={msg.id} className="border p-4 rounded">
            <p>
              <strong>From:</strong> {msg.sender.username}
            </p>
            <p>
              <strong>To:</strong> {msg.recipient.username}
            </p>
            <p>{msg.content}</p>
            <p className="text-sm text-slate-500">
              {new Date(msg.timestamp).toLocaleString()}
            </p>
          </div>
        ))}
      </div>
      <div className="space-y-4">
        <Input
          type="text"
          value={recipientId}
          onChange={(e) => setRecipientId(e.target.value)}
          placeholder="Recipient ID"
        />
        <Input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type your message"
        />
        <Button onClick={handleSendMessage}>Send</Button>
      </div>
    </div>
  );
}

export default Messaging;
