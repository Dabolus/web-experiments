import { FunctionalComponent, h, Fragment, JSX } from 'preact';
import { useEffect, useRef } from 'preact/hooks';
import { Link, Redirect } from 'wouter-preact';
import EUDCC from '../components/EUDCC';
import ArrowBackIcon from '../components/icons/ArrowBack';
import useCamera from '../hooks/useCamera';
import useEUDCC from '../hooks/useEUDCC';
import classes from './Reader.module.scss';
import commonClasses from '../common/styles.module.scss';
import Spinner from '../components/Spinner';

const Reader: FunctionalComponent = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const { hasGivenConsent, startCamera, stopCamera } = useCamera();
  const { read, output } = useEUDCC();

  useEffect(() => {
    if (output) {
      stopCamera();
    }
  }, [output, stopCamera]);

  useEffect(() => {
    const detectQr = async (): Promise<void> => {
      if (!hasGivenConsent || !videoRef.current) {
        return;
      }

      const { current: video } = videoRef;
      const stream = await startCamera({ facingMode: 'environment' });
      video.srcObject = stream;

      await read(video);
    };

    detectQr();
  }, [hasGivenConsent, read, startCamera]);

  if (hasGivenConsent === false) {
    return <Redirect to="/" />;
  }

  const getPageContent = (): JSX.Element => {
    if (!hasGivenConsent) {
      return (
        <div className={classes.center}>
          <Spinner />
        </div>
      );
    }

    return output ? (
      <EUDCC value={output} />
    ) : (
      <main className={classes.camera}>
        {/* Overlay */}
        <div />
        {/* Actual camera */}
        <video ref={videoRef} autoPlay muted playsInline />
      </main>
    );
  };

  return (
    <>
      <header className={commonClasses.header}>
        <Link href="/">
          <a>
            <ArrowBackIcon />
          </a>
        </Link>
        <h1>Back to home page</h1>
      </header>

      {getPageContent()}
    </>
  );
};

export default Reader;
