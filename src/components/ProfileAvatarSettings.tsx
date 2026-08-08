import { useEffect, useRef, useState } from 'react';
import Cropper, { type Area, type Point } from 'react-easy-crop';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Camera, ImagePlus, Loader2, RotateCcw, Sparkles, UserRound } from 'lucide-react';

import UserAvatar from '@/components/UserAvatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Slider } from '@/components/ui/slider';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import {
  getCurrentProfile,
  resetProfileAvatar,
  selectProfileAvatarPreset,
  uploadProfileAvatar,
  type AvatarUpdateResponse,
  type CurrentProfileResponse,
} from '@/lib/api';
import { cropAvatarToWebp } from '@/lib/crop-avatar';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { QueryEmptyState, QueryErrorState } from '@/components/query/QueryStates';

const DEFAULT_MAX_BYTES = 5 * 1024 * 1024;
const DEFAULT_OUTPUT_SIZE = 512;
const DEFAULT_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

const formatMegabytes = (bytes: number) => `${Math.round(bytes / 1024 / 1024)} MB`;

const ProfileAvatarSettings = () => {
  const { user, updateUser } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const inputRef = useRef<HTMLInputElement>(null);
  const [cropSource, setCropSource] = useState<string | null>(null);
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedArea, setCroppedArea] = useState<Area | null>(null);

  const profileQuery = useQuery({
    queryKey: ['current-profile'],
    queryFn: getCurrentProfile,
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    if (profileQuery.data?.user) updateUser(profileQuery.data.user);
  }, [profileQuery.data?.user, updateUser]);

  useEffect(() => () => {
    if (cropSource) URL.revokeObjectURL(cropSource);
  }, [cropSource]);

  const options = profileQuery.data?.avatar_options;
  const maxBytes = options?.max_upload_bytes || DEFAULT_MAX_BYTES;
  const outputSize = options?.output_size || DEFAULT_OUTPUT_SIZE;
  const allowedTypes = options?.allowed_mime_types || DEFAULT_TYPES;

  const closeCropper = () => {
    setCropSource(null);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setRotation(0);
    setCroppedArea(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  const applyResponse = (response: AvatarUpdateResponse, message: string) => {
    updateUser(response.user);
    queryClient.setQueryData<CurrentProfileResponse>(
      ['current-profile'],
      (current) => current ? { ...current, user: response.user } : current,
    );
    toast({ title: 'Готово', description: message });
  };

  const uploadMutation = useMutation({
    mutationFn: uploadProfileAvatar,
    onSuccess: (response) => {
        applyResponse(response, 'Новата профилна снимка е запазена.');
      closeCropper();
    },
    onError: (error: Error) => toast({
      title: 'Снимката не е запазена',
      description: error.message,
      variant: 'destructive',
    }),
  });

  const presetMutation = useMutation({
    mutationFn: selectProfileAvatarPreset,
    onSuccess: (response) => applyResponse(response, 'Готовият аватар е избран.'),
    onError: (error: Error) => toast({
      title: 'Аватарът не е променен',
      description: error.message,
      variant: 'destructive',
    }),
  });

  const resetMutation = useMutation({
    mutationFn: resetProfileAvatar,
    onSuccess: (response) => applyResponse(response, 'Профилът отново използва инициали.'),
    onError: (error: Error) => toast({
      title: 'Аватарът не е премахнат',
      description: error.message,
      variant: 'destructive',
    }),
  });

  const busy = uploadMutation.isPending || presetMutation.isPending || resetMutation.isPending;

  const handleFile = (file?: File) => {
    if (!file) return;
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: 'Неподдържан формат',
        description: 'Изберете JPEG, PNG или WebP изображение.',
        variant: 'destructive',
      });
      if (inputRef.current) inputRef.current.value = '';
      return;
    }
    if (file.size > maxBytes) {
      toast({
        title: 'Файлът е прекалено голям',
        description: `Максималният размер е ${formatMegabytes(maxBytes)}.`,
        variant: 'destructive',
      });
      if (inputRef.current) inputRef.current.value = '';
      return;
    }
    setCropSource(URL.createObjectURL(file));
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setRotation(0);
    setCroppedArea(null);
  };

  const saveCrop = async () => {
    if (!cropSource || !croppedArea) return;
    try {
      const blob = await cropAvatarToWebp(
        cropSource,
        croppedArea,
        rotation,
        outputSize,
      );
      const file = new File(
        [blob],
        `profile-avatar-${Date.now()}.webp`,
        { type: blob.type || 'image/webp' },
      );
      uploadMutation.mutate(file);
    } catch (error) {
      toast({
        title: 'Снимката не може да бъде изрязана',
        description: error instanceof Error ? error.message : 'Опитайте с друг файл.',
        variant: 'destructive',
      });
    }
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-gradient-to-br from-primary/10 via-background to-pink-500/10">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
          <UserAvatar
            username={user?.username}
            avatarUrl={user?.avatar_url}
            className="h-24 w-24 border-4 border-background shadow-lg"
          />
          <div className="min-w-0 flex-1">
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Профилна снимка
            </CardTitle>
            <CardDescription className="mt-2 max-w-2xl">
              Изберете собствена снимка, готов училищен аватар или останете с инициали.
              Аватарът се вижда публично до вашите коментари и публикации.
            </CardDescription>
            <div className="mt-4 flex flex-wrap gap-2">
              <input
                ref={inputRef}
                type="file"
                accept={allowedTypes.join(',')}
                className="sr-only"
                onChange={(event) => handleFile(event.target.files?.[0])}
              />
              <Button type="button" onClick={() => inputRef.current?.click()} disabled={busy}>
                <ImagePlus className="mr-2 h-4 w-4" />
                Качи снимка
              </Button>
              <Button
                type="button"
                variant="outline"
                disabled={busy || user?.avatar_source === 'initials'}
                onClick={() => resetMutation.mutate()}
              >
                {resetMutation.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <UserRound className="mr-2 h-4 w-4" />
                )}
                Използвай инициали
              </Button>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              JPEG, PNG или WebP, до {formatMegabytes(maxBytes)}. Оригиналът не се запазва.
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-6">
        <div className="mb-3 flex items-center gap-2">
          <Camera className="h-4 w-4 text-primary" />
          <h3 className="font-semibold">Готови училищни аватари</h3>
        </div>
        {profileQuery.isLoading ? (
          <div role="status" aria-label="Зареждане на готовите аватари" className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6">
            {[1, 2, 3, 4, 5, 6].map((item) => <Skeleton key={item} className="aspect-square rounded-xl" />)}
          </div>
        ) : profileQuery.isError ? (
          <QueryErrorState message={profileQuery.error instanceof Error ? profileQuery.error.message : 'Готовите аватари не могат да бъдат заредени.'} onRetry={() => void profileQuery.refetch()} />
        ) : !options?.presets.length ? (
          <QueryEmptyState title="Няма готови аватари" description="Все още можете да качите собствена снимка или да използвате инициали." />
        ) : (
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6">
            {options?.presets.map((preset) => {
              const selected = user?.avatar_source === 'preset' && user.avatar_preset === preset.id;
              return (
                <button
                  key={preset.id}
                  type="button"
                  aria-label={`Избери аватар ${preset.label}`}
                  aria-pressed={selected}
                  disabled={busy}
                  onClick={() => presetMutation.mutate(preset.id)}
                  className={cn(
                    'group rounded-xl border bg-card p-2 text-center transition hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-60',
                    selected && 'border-primary ring-2 ring-primary',
                  )}
                >
                  <img
                    src={preset.url}
                    alt=""
                    className="mx-auto aspect-square w-full max-w-20 rounded-lg"
                    loading="lazy"
                  />
                  <span className="mt-1 block truncate text-xs font-medium">{preset.label}</span>
                </button>
              );
            })}
          </div>
        )}
      </CardContent>

      <Dialog open={Boolean(cropSource)} onOpenChange={(open) => !open && closeCropper()}>
        <DialogContent
          className="max-h-[95vh] w-[calc(100%_-_1rem)] max-w-xl overflow-y-auto"
          style={{ animationName: 'none' }}
        >
          <DialogHeader>
            <DialogTitle>Изрежете профилната снимка</DialogTitle>
            <DialogDescription>
              Преместете снимката, увеличете я и я завъртете. Запазва се само квадратният преглед.
            </DialogDescription>
          </DialogHeader>
          <div className="relative h-[min(55vh,420px)] min-h-64 overflow-hidden rounded-xl bg-slate-950">
            {cropSource ? (
              <Cropper
                image={cropSource}
                crop={crop}
                zoom={zoom}
                rotation={rotation}
                aspect={1}
                cropShape="round"
                showGrid={false}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onRotationChange={setRotation}
                onCropComplete={(_, pixels) => setCroppedArea(pixels)}
              />
            ) : null}
          </div>
          <div className="space-y-4">
            <label className="block space-y-2 text-sm font-medium">
              <span>Увеличение</span>
              <Slider
                value={[zoom]}
                min={1}
                max={3}
                step={0.01}
                onValueChange={([value]) => setZoom(value)}
              />
            </label>
            <label className="block space-y-2 text-sm font-medium">
              <span>Завъртане: {rotation}°</span>
              <div className="flex items-center gap-3">
                <Slider
                  value={[rotation]}
                  min={-180}
                  max={180}
                  step={1}
                  onValueChange={([value]) => setRotation(value)}
                />
                <Button
                  type="button"
                  size="icon"
                  variant="outline"
                  aria-label="Завърти на 90 градуса"
                  onClick={() => setRotation((value) => (
                    value >= 90 ? value - 270 : value + 90
                  ))}
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
              </div>
            </label>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={closeCropper} disabled={uploadMutation.isPending}>
              Отказ
            </Button>
            <Button type="button" onClick={() => void saveCrop()} disabled={!croppedArea || uploadMutation.isPending}>
              {uploadMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Запази снимката
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default ProfileAvatarSettings;
