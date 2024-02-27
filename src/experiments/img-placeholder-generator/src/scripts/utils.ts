export const drawFileToCanvas = (file: File, canvas: HTMLCanvasElement) =>
  new Promise<void>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const image = new Image();
      image.src = reader.result as string;
      image.onload = () => {
        canvas.width = image.width;
        canvas.height = image.height;
        canvas.getContext('2d')!.drawImage(image, 0, 0);
        resolve();
      };
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
