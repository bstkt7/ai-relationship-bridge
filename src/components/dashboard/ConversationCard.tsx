import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Share2, Copy, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";

interface Conversation {
  id: string;
  partner1_message: string;
  partner2_message: string;
  ai_recommendation: string | null;
  emotion_analysis: any;
  created_at: string;
}

interface ConversationCardProps {
  conversation: Conversation;
}

const ConversationCard = ({ conversation }: ConversationCardProps) => {
  const { toast } = useToast();
  const [showShare, setShowShare] = useState(false);
  const [shareUrl, setShareUrl] = useState("");

  // SSR-safe получение URL
  useEffect(() => {
    if (typeof window !== "undefined") {
      setShareUrl(`${window.location.origin}/conversation/${conversation.id}`);
    }
  }, [conversation.id]);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Скопировано!",
        description: "Ссылка скопирована в буфер обмена",
      });
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось скопировать ссылку",
        variant: "destructive",
      });
    }
  };

  const shareConversation = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Рекомендация от BridgeAI",
          text: "Посмотрите эту рекомендацию от AI для пар",
          url: shareUrl,
        });
      } catch (error) {
        console.log("Share cancelled or failed:", error);
      }
    } else {
      copyToClipboard(shareUrl);
    }
  };

  // Формат даты
  const formattedDate = new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(conversation.created_at));

  return (
    <div className="border rounded-lg p-4 space-y-3">
      {conversation.ai_recommendation ? (
        <div className="bg-sky-50 p-4 rounded-lg">
          <div className="flex items-start justify-between mb-2">
            <h4 className="font-semibold text-primary">Рекомендация AI:</h4>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowShare(!showShare)}
              className="h-8 w-8 p-0"
            >
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-sm leading-relaxed">
            {conversation.ai_recommendation}
          </p>

          <AnimatePresence>
            {showShare && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="mt-3 p-3 bg-card rounded border space-y-2"
              >
                <p className="text-xs text-muted-foreground">
                  Поделиться рекомендацией:
                </p>
                <div className="flex gap-2">
                  <Input value={shareUrl} readOnly className="text-xs" />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(shareUrl)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={shareConversation}>
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ) : (
        <div className="bg-yellow-50 p-4 rounded-lg">
          <p className="text-sm text-yellow-800">
            {!conversation.partner1_message && !conversation.partner2_message
              ? "Ожидание сообщений от обоих партнеров..."
              : !conversation.ai_recommendation
              ? "AI анализирует ваши сообщения, подождите..."
              : ""}
          </p>
        </div>
      )}

      <div className="text-xs text-muted-foreground">{formattedDate}</div>
    </div>
  );
};

export default ConversationCard;
