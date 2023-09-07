import { FunctionalComponent, h, Fragment } from 'preact';
import { useEffect } from 'preact/hooks';
import { useLocation } from 'wouter-preact';
import { logEvent } from '../firebase';
import QRCodeIcon from '../components/icons/QRCode';
import useCamera from '../hooks/useCamera';
import classes from './Home.module.scss';
import commonClasses from '../common/styles.module.scss';

const Home: FunctionalComponent = () => {
  const [, setLocation] = useLocation();
  const { startCamera } = useCamera();

  useEffect(() => {
    logEvent('page_view', {
      page_title: 'EUDCC Reader - Home',
      page_location: window.location.href,
    });
  }, []);

  const startReader = async (): Promise<void> => {
    await startCamera({ facingMode: 'environment' });
    setLocation('/read');
  };

  return (
    <>
      <header className={commonClasses.header}>
        <h1>EUDCC Reader</h1>
      </header>
      <main className={classes.content}>
        <section className={commonClasses.card}>
          <h2>
            Read an <strong>EUDCC</strong>
          </h2>
          <button onClick={startReader} className={classes.startReaderButton}>
            <QRCodeIcon />
            Scan a QR Code
          </button>
        </section>
      </main>
    </>
  );
};

export default Home;
