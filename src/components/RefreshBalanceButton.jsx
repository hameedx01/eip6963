import { useState } from "react";

const RefreshBalanceButton = ({ account, getBalance }) => {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const handleRefresh = async () => {
    setBusy(true);
    setError("");
    try {
      await getBalance();
    } catch (error) {
      setError(error.shortMessage || error.message || "Unable to refresh balance. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <button disabled={!account || busy} onClick={handleRefresh}>
        {busy ? "Refreshing…" : "Refresh balance"}
      </button>
      {error && <p role="alert">{error}</p>}
    </>
  );
};

export default RefreshBalanceButton;
