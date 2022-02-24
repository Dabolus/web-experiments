import { useCallback, useEffect, useState } from 'preact/hooks';

export interface UseCameraValue {
  hasGivenConsent: boolean | undefined;
  stream: MediaStream | undefined;
  startCamera(constraints?: MediaTrackConstraints): Promise<MediaStream>;
  stopCamera(): Promise<void>;
}

const endMediaStreamTrack = (track: MediaStreamTrack): Promise<void> =>
  new Promise<void>(resolve => {
    track.addEventListener('ended', () => resolve());
    track.stop();
  });

const useCamera = (): UseCameraValue => {
  const [hasGivenConsent, setHasGivenConsent] = useState<boolean | undefined>(
    undefined,
  );
  const [stream, setStream] = useState<MediaStream | undefined>(undefined);

  useEffect(() => {
    navigator.mediaDevices
      .enumerateDevices()
      .then(devices =>
        setHasGivenConsent(
          devices.some(({ label, kind }) => label && kind === 'videoinput'),
        ),
      );
  }, []);

  const startCamera = useCallback<UseCameraValue['startCamera']>(
    async constraints => {
      const videoStream = await navigator.mediaDevices.getUserMedia({
        video: constraints || true,
      });

      setStream(videoStream);

      return videoStream;
    },
    [],
  );

  const stopCamera = useCallback<UseCameraValue['stopCamera']>(async () => {
    if (!stream) {
      return;
    }

    await Promise.all(
      stream.getTracks().map(track => endMediaStreamTrack(track)),
    );

    setStream(undefined);
  }, [stream]);

  return { hasGivenConsent, stream, startCamera, stopCamera };
};

export default useCamera;
