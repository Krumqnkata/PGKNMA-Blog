import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { WifiOff, Wifi, X } from "lucide-react";

export const OfflineStatusToast: React.FC = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showStatus, setShowStatus] = useState(false);
  const [statusType, setStatusType] = useState<"online" | "offline">("online");

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setStatusType("online");
      setShowStatus(true);
      // Automatically hide the green "back online" toast after 3 seconds
      const timer = setTimeout(() => {
        setShowStatus(false);
      }, 3000);
      return () => clearTimeout(timer);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setStatusType("offline");
      setShowStatus(true);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (!showStatus) return null;

  return (
    <div className="fixed top-6 left-6 right-6 z-[100] mx-auto max-w-sm animate-in fade-in slide-in-from-top-4 duration-300">
      {statusType === "offline" ? (
        <Card className="border-red-500/20 bg-red-950/90 text-red-200 shadow-xl backdrop-blur-md">
          <CardContent className="p-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <WifiOff className="h-5 w-5 text-red-400 shrink-0 animate-pulse" />
              <div className="space-y-0.5">
                <h5 className="text-sm font-bold tracking-tight">Нямате интернет връзка</h5>
                <p className="text-xs text-red-300/80 leading-snug">
                  Преминахте в офлайн режим. Сайтът ще зареди кешираното съдържание.
                </p>
              </div>
            </div>
            <button 
              onClick={() => setShowStatus(false)} 
              className="text-red-400 hover:text-red-200 transition-colors p-1 rounded-md hover:bg-red-900/50 shrink-0"
            >
              <X className="h-4 w-4" />
            </button>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-emerald-500/20 bg-emerald-950/95 text-emerald-200 shadow-xl backdrop-blur-md">
          <CardContent className="p-4 flex items-center gap-3">
            <Wifi className="h-5 w-5 text-emerald-400 shrink-0 animate-bounce" />
            <div className="space-y-0.5">
              <h5 className="text-sm font-bold tracking-tight">Връзката е възстановена</h5>
              <p className="text-xs text-emerald-300/80 leading-snug">
                Отново сте онлайн! Данните ще се обновят автоматично.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default OfflineStatusToast;
