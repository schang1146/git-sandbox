import type { NextPage } from 'next';
import dynamic from 'next/dynamic';
import Head from 'next/head';
import styles from '../styles/index.module.css';

const TerminalComponent = dynamic(() => import('../components/terminal'), {
  ssr: false,
});

const Home: NextPage = () => {
  return (
    <div className={styles.container}>
      <Head>
        <title>Git Sandbox</title>
        <meta name='description' content='Git sandbox' />
        <link rel='icon' href='/favicon.ico' />
      </Head>

      <main className={styles.main}>
        <TerminalComponent />
      </main>
    </div>
  );
};

export default Home;
