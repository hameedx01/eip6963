import { useState } from "react";
import { SUPPORTED_CHAINS } from "../constants/chains.js";

const SupportedChains = ({ account, chainId, provider }) => {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const currentChain = SUPPORTED_CHAINS.find((chain) => chain.id === chainId);

  const switchChain = async (chain) => {
    setBusy(true);
    setError("");
    try {
      await provider.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: `0x${chain.id.toString(16)}` }],
      });
    } catch (error) {
      if (error.code === 4001) {
        setError("Network switch was rejected. Please try again.");
      } else if (error.code === 4902) {
        setError(`Enable or add ${chain.name} in your wallet, then try again.`);
      } else {
        setError(error.message || "Unable to switch networks. Please try again.");
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <section aria-label="Supported networks">
      <p>Supported networks: {SUPPORTED_CHAINS.map((chain) => chain.name).join(", ")}</p>
      {account && chainId !== null && (
        currentChain
          ? <p>Current network: {currentChain.name}</p>
          : <p role="alert">Unsupported network (chain ID: {chainId}). Please switch to a supported network.</p>
      )}
      {SUPPORTED_CHAINS.map((chain) => (
        <button
          key={chain.id}
          disabled={!account || !provider || busy || chainId === chain.id}
          onClick={() => switchChain(chain)}
        >
          Switch to {chain.name}
        </button>
      ))}
      {busy && <p role="status">Confirm the network switch in your wallet…</p>}
      {error && <p role="alert">{error}</p>}
    </section>
  );
};

export default SupportedChains;
