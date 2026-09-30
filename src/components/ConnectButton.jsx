import { useState } from "react";

const ConnectButton = ({ account, connectWallet, disconnectWallet }) => {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const handleClick = async () => {
    setBusy(true);
    setError("");
    try {
      await (account ? disconnectWallet() : connectWallet());
    } catch (error) {
      setError(error.shortMessage || error.message || "Unable to connect wallet.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <button disabled={busy} onClick={handleClick}>
        {busy ? "Please wait…" : account ? "Disconnect" : "Connect"}
      </button>
      {error && <p role="alert">{error}</p>}
    </>
  );
};

export default ConnectButton;
