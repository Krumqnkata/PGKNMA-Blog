import type { Area } from 'react-easy-crop';

const degreesToRadians = (degrees: number) => degrees * (Math.PI / 180);

const rotatedBounds = (width: number, height: number, rotation: number) => {
  const radians = degreesToRadians(rotation);
  return {
    width: Math.abs(Math.cos(radians) * width) + Math.abs(Math.sin(radians) * height),
    height: Math.abs(Math.sin(radians) * width) + Math.abs(Math.cos(radians) * height),
  };
};

const loadImage = (source: string) => new Promise<HTMLImageElement>((resolve, reject) => {
  const image = new Image();
  image.onload = () => resolve(image);
  image.onerror = () => reject(new Error('Снимката не може да бъде отворена.'));
  image.src = source;
});

const canvasToBlob = (canvas: HTMLCanvasElement) => new Promise<Blob>((resolve, reject) => {
  canvas.toBlob((blob) => {
    if (blob) {
      resolve(blob);
    } else {
      reject(new Error('Изрязаната снимка не може да бъде създадена.'));
    }
  }, 'image/webp', 0.9);
});

export async function cropAvatarToWebp(
  source: string,
  crop: Area,
  rotation: number,
  outputSize: number,
): Promise<Blob> {
  const image = await loadImage(source);
  const bounds = rotatedBounds(image.naturalWidth, image.naturalHeight, rotation);
  const workCanvas = document.createElement('canvas');
  workCanvas.width = Math.ceil(bounds.width);
  workCanvas.height = Math.ceil(bounds.height);
  const context = workCanvas.getContext('2d');
  if (!context) throw new Error('Браузърът не поддържа изрязване на изображения.');

  context.translate(workCanvas.width / 2, workCanvas.height / 2);
  context.rotate(degreesToRadians(rotation));
  context.translate(-image.naturalWidth / 2, -image.naturalHeight / 2);
  context.drawImage(image, 0, 0);

  const outputCanvas = document.createElement('canvas');
  outputCanvas.width = outputSize;
  outputCanvas.height = outputSize;
  const outputContext = outputCanvas.getContext('2d');
  if (!outputContext) throw new Error('Браузърът не поддържа изрязване на изображения.');
  outputContext.imageSmoothingEnabled = true;
  outputContext.imageSmoothingQuality = 'high';
  outputContext.drawImage(
    workCanvas,
    crop.x,
    crop.y,
    crop.width,
    crop.height,
    0,
    0,
    outputSize,
    outputSize,
  );

  return canvasToBlob(outputCanvas);
}
