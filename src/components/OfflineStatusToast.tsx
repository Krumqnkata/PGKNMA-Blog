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
      // Automatically hide the green "back online" toast after 2 seconds
      const timer = setTimeout(() => {
        setShowStatus(false);
      }, 2000);
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
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[200] w-[calc(100%-2rem)] max-w-sm animate-in fade-in slide-in-from-top-4 duration-500 ease-out">
      {statusType === "offline" ? (
        <div className="relative overflow-hidden rounded-2xl border border-red-500/20 bg-red-950/40 p-4 text-red-100 shadow-2xl backdrop-blur-xl transition-all hover:bg-red-950/50">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-500/20">
                <WifiOff className="h-5 w-5 text-red-400 animate-pulse" />
                <span className="absolute inset-0 rounded-full border border-red-400/30 animate-ping-slow"></span>
              </div>
              <div className="flex flex-col gap-0.5">
                <h5 className="text-sm font-bold tracking-tight text-white">Офлайн режим</h5>
                <p className="text-[11px] font-medium text-red-200/70 leading-tight">
                  Няма връзка с интернет. Можете да разглеждате кеширано съдържание, но гласуването, коментирането и изпращането на форми са временно недостъпни.
                </p>
              </div>
            </div>
            <button 
              onClick={() => setShowStatus(false)} 
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/5 text-red-300 transition-all hover:bg-white/10 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-950/40 p-4 text-emerald-100 shadow-2xl backdrop-blur-xl transition-all">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-500/20">
              <Wifi className="h-5 w-5 text-emerald-400 animate-bounce" />
            </div>
            <div className="flex flex-col gap-0.5">
              <h5 className="text-sm font-bold tracking-tight text-white">Връзката е възстановена!</h5>
              <p className="text-[11px] font-medium text-emerald-200/70">
                Отново сте онлайн. Данните се синхронизират...
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OfflineStatusToast;
