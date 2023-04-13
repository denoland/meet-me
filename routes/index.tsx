import { Head, Link } from "aleph/react";

export default function Index() {
  return (
    <div className="screen index">
      <Head>
        <title>Wallet</title>
        <meta name="description" content="gled-labs." />
      </Head>
      <p className="logo">
        <img src="./assets/logo.svg" width="75" height="75" title="Aleph.js" />
      </p>
      <h1>
        The Wallet.
      </h1>
      
      <nav>
        <Link
          role="button"
          to="/app">
          Wallet
        </Link>
      </nav>
    </div>
  );
}
