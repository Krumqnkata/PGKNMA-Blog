import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Square, Volume2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface AudioReaderProps {
  content: string;
  title: string;
}

const AudioReader: React.FC<AudioReaderProps> = ({ content, title }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [rate, setRate] = useState(1);
  const [voice, setVoice] = useState<SpeechSynthesisVoice | null>(null);
  const [supported, setSupported] = useState(true);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const cleanMarkdown = (text: string) => {
    return text
      .replace(/!\[.*?\]\(.*?\)/g, '')
      .replace(/\[(.*?)\]\(.*?\)/g, '$1')
      .replace(/#{1,6}\s?/g, '')
      .replace(/(\*\*|__)(.*?)\1/g, '$2')
      .replace(/(\*|_)(.*?)\1/g, '$2')
      .replace(/`{3}[\s\S]*?``{3}/g, '')
      .replace(/`(.+?)`/g, '$1')
      .replace(/>\s?/g, '')
      .replace(/- \s?/g, '')
      .replace(/\d+\.\s?/g, '')
      .replace(/\n+/g, ' ')
      .trim();
  };

  const fullText = `${title}. ${cleanMarkdown(content)}`;

  useEffect(() => {
    if (!('speechSynthesis' in window)) {
      setSupported(false);
      return;
    }

    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      const bgVoice = voices.find(v => v.lang.includes('bg'));
      setVoice(bgVoice || voices[0] || null);
    };

    loadVoices();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }

    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  if (!supported) return null;

  const handlePlay = () => {
    if (isPaused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
      setIsPlaying(true);
      return;
    }

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(fullText);
    if (voice) utterance.voice = voice;
    utterance.rate = rate;
    utterance.lang = 'bg-BG';

    utterance.onend = () => {
      setIsPlaying(false);
      setIsPaused(false);
    };

    utterance.onerror = () => {
      setIsPlaying(false);
      setIsPaused(false);
    };

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
    setIsPlaying(true);
  };

  const handlePause = () => {
    window.speechSynthesis.pause();
    setIsPaused(true);
    setIsPlaying(false);
  };

  const handleStop = () => {
    window.speechSynthesis.cancel();
    setIsPlaying(false);
    setIsPaused(false);
  };

  const handleRateChange = (value: string) => {
    const newRate = parseFloat(value);
    setRate(newRate);
    if (utteranceRef.current) {
      utteranceRef.current.rate = newRate;
    }
  };

  return (
    <Card className="mb-8 border-primary/20 bg-primary/5 overflow-hidden">
      <CardContent className="p-4">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              {!isPlaying || isPaused ? (
                <Button size="icon" onClick={handlePlay} className="rounded-full h-10 w-10 shadow-md hover:scale-105 transition-transform" title="Пусни">
                  <Play className="h-5 w-5 fill-current" />
                </Button>
              ) : (
                <Button size="icon" variant="outline" onClick={handlePause} className="rounded-full h-10 w-10 border-primary text-primary hover:bg-primary/10 shadow-md hover:scale-105 transition-transform" title="Пауза">
                  <Pause className="h-5 w-5 fill-current" />
                </Button>
              )}
              <Button size="icon" variant="ghost" onClick={handleStop} className="rounded-full h-10 w-10 text-muted-foreground hover:text-destructive" disabled={!isPlaying && !isPaused} title="Спри">
                <Square className="h-5 w-5 fill-current" />
              </Button>
            </div>

            <Select value={rate.toString()} onValueChange={handleRateChange}>
              <SelectTrigger className="w-[100px] h-10">
                <SelectValue placeholder="1x" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0.75">0.75x</SelectItem>
                <SelectItem value="1">1x</SelectItem>
                <SelectItem value="1.25">1.25x</SelectItem>
                <SelectItem value="1.5">1.5x</SelectItem>
                <SelectItem value="2">2x</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between text-muted-foreground pt-2 border-t border-primary/10">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <Volume2 className="h-4 w-4" />
                <span className="text-sm font-medium">Аудио прочитане</span>
              </div>
              <span className="text-[10px] text-muted-foreground/70">
                *Наличността на български глас зависи от настройките на вашето устройство.
              </span>
            </div>
            {isPlaying && (
              <Badge variant="secondary" className="animate-pulse bg-primary/20 text-primary border-none text-xs">
                Слушане...
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AudioReader;
