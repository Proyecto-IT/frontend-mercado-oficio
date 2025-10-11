import { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { Send, ArrowLeft, Phone, Video, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";

interface Message {
  id: string;
  content: string;
  senderId: string;
  senderName: string;
  timestamp: Date;
  isOwn: boolean;
}

interface WorkerInfo {
  id: string;
  name: string;
  service: string;
  avatar?: string;
  isOnline: boolean;
}

const Chat = () => {
  const { workerId } = useParams();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [worker, setWorker] = useState<WorkerInfo | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Mock data - replace with actual API calls
  useEffect(() => {
    // Simulated worker data
    setWorker({
      id: workerId || "1",
      name: "Carlos Mendoza",
      service: "Carpintería",
      avatar: "",
      isOnline: true
    });

    // Simulated messages
    setMessages([
      {
        id: "1",
        content: "Hola! Vi que necesitas ayuda con carpintería. ¿En qué puedo ayudarte?",
        senderId: workerId || "1",
        senderName: "Carlos Mendoza",
        timestamp: new Date(Date.now() - 3600000),
        isOwn: false
      },
      {
        id: "2",
        content: "Hola Carlos! Necesito que me hagas un mueble a medida para mi sala.",
        senderId: "current-user",
        senderName: "Tú",
        timestamp: new Date(Date.now() - 3500000),
        isOwn: true
      },
      {
        id: "3",
        content: "Perfecto! ¿Podrías enviarme las medidas y una foto del espacio donde iría?",
        senderId: workerId || "1",
        senderName: "Carlos Mendoza",
        timestamp: new Date(Date.now() - 3400000),
        isOwn: false
      }
    ]);
  }, [workerId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    const message: Message = {
      id: Date.now().toString(),
      content: newMessage,
      senderId: "current-user",
      senderName: "Tú",
      timestamp: new Date(),
      isOwn: true
    };

    setMessages(prev => [...prev, message]);
    setNewMessage("");

    // Here you would send the message to your backend
    console.log("Sending message:", message);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!worker) {
    return <div>Cargando...</div>;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="border-b bg-card shadow-sm">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link to="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4" />
                </Button>
              </Link>
              
              <Avatar className="w-10 h-10">
                <AvatarImage src={worker.avatar} alt={worker.name} />
                <AvatarFallback>{worker.name.split(" ").map(n => n[0]).join("")}</AvatarFallback>
              </Avatar>
              
              <div>
                <h2 className="font-semibold text-card-foreground">{worker.name}</h2>
                <p className="text-sm text-muted-foreground">
                  {worker.service} • {worker.isOnline ? "En línea" : "Desconectado"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm">
                <Phone className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <Video className="w-4 h-4" />
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>Ver perfil</DropdownMenuItem>
                  <DropdownMenuItem>Reportar usuario</DropdownMenuItem>
                  <DropdownMenuItem className="text-destructive">
                    Bloquear usuario
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="container mx-auto max-w-4xl space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.isOwn ? "justify-end" : "justify-start"}`}
            >
              <div className={`flex gap-2 max-w-xs md:max-w-md ${message.isOwn ? "flex-row-reverse" : "flex-row"}`}>
                {!message.isOwn && (
                  <Avatar className="w-8 h-8 flex-shrink-0">
                    <AvatarImage src={worker.avatar} alt={worker.name} />
                    <AvatarFallback className="text-xs">
                      {worker.name.split(" ").map(n => n[0]).join("")}
                    </AvatarFallback>
                  </Avatar>
                )}
                
                <div className={`space-y-1 ${message.isOwn ? "items-end" : "items-start"} flex flex-col`}>
                  <div
                    className={`rounded-lg px-3 py-2 ${
                      message.isOwn
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-card-foreground"
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {message.timestamp.toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </span>
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Message Input */}
      <div className="border-t bg-card p-4">
        <div className="container mx-auto max-w-4xl">
          <div className="flex gap-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Escribe un mensaje..."
              className="flex-1"
            />
            <Button 
              onClick={handleSendMessage}
              disabled={!newMessage.trim()}
              className="bg-primary hover:bg-primary/90"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;