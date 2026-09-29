import { useEffect, useRef, useState } from "react";

// Add or remove networks here to change which chains the app supports.
const SUPPORTED_CHAINS = [
  { id: 1, name: "Ethereum Mainnet" },
  { id: 11155111, name: "Sepolia" },
];

const Eip6963 = () => {
  const [providers, setProviders] = useState([]);
  const [activeProvider, setActiveProvider] = useState(null);
  const [account, setAccount] = useState("");
  const [chainId, setChainId] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const session = useRef(0);

  useEffect(() => {
    const announceProvider = (event) => {
      setProviders((current) =>
        current.some(({ info }) => info.uuid === event.detail.info.uuid)
          ? current
          : [...current, event.detail],
      );
    };

    // Listen first: wallets may announce synchronously when requested.
    window.addEventListener("eip6963:announceProvider", announceProvider);
    window.dispatchEvent(new Event("eip6963:requestProvider"));

    return () => {
      window.removeEventListener("eip6963:announceProvider", announceProvider);
      session.current += 1;
    };
  }, []);

  const handleDisconnectWallet = () => {
    // Injected wallets have no universal disconnect RPC. End the app session.
    session.current += 1;
    setActiveProvider(null);
    setAccount("");
    setChainId(null);
    setError("");
    setBusy(false);
  };

  useEffect(() => {
    if (!activeProvider) return;
    const currentSession = session.current;
    const isCurrent = () => session.current === currentSession;

    const accountsChanged = (accounts) => {
      if (!isCurrent()) return;
      if (!accounts.length) {
        handleDisconnectWallet();
      } else {
        setAccount(accounts[0]);
      }
    };
    const chainChanged = (id) => {
      if (!isCurrent()) return;
      setChainId(Number(id));
      setError("");
    };
    const disconnected = () => {
      if (isCurrent()) handleDisconnectWallet();
    };

    activeProvider.on("accountsChanged", accountsChanged);
    activeProvider.on("chainChanged", chainChanged);
    activeProvider.on("disconnect", disconnected);

    return () => {
      activeProvider.removeListener("accountsChanged", accountsChanged);
      activeProvider.removeListener("chainChanged", chainChanged);
      activeProvider.removeListener("disconnect", disconnected);
    };
  }, [activeProvider]);

  const handleConnectWallet = async (provider) => {
    const currentSession = ++session.current;
    setBusy(true);
    setError("");
    try {
      const accounts = await provider.request({ method: "eth_requestAccounts" });
      if (!accounts.length) throw new Error("No wallet account was selected.");
      const id = await provider.request({ method: "eth_chainId" });
      if (session.current !== currentSession) return;
      setAccount(accounts[0]);
      setChainId(Number(id));
      setActiveProvider(provider);
    } catch (err) {
      if (session.current !== currentSession) return;
      setError(
        err.code === 4001
          ? "Wallet connection was rejected. Please try again."
          : err.message || "Unable to connect the wallet.",
      );
    } finally {
      if (session.current === currentSession) setBusy(false);
    }
  };

  const handleSwitchChain = async (chain) => {
    const currentSession = session.current;
    setBusy(true);
    setError("");
    try {
      await activeProvider.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: `0x${chain.id.toString(16)}` }],
      });
      const id = await activeProvider.request({ method: "eth_chainId" });
      if (session.current === currentSession) setChainId(Number(id));
    } catch (err) {
      if (session.current !== currentSession) return;
      if (err.code === 4001) {
        setError("Network switch was rejected. Choose a supported chain to retry.");
      } else if (err.code === 4902) {
        setError(`Enable or add ${chain.name} in your wallet, then try again.`);
      } else {
        setError(err.message || "Unable to switch networks. Switch in your wallet and try again.");
      }
    } finally {
      if (session.current === currentSession) setBusy(false);
    }
  };

  const supportedChain = SUPPORTED_CHAINS.find((chain) => chain.id === chainId);
  const unsupportedChain = account && chainId !== null && !supportedChain;

  return (
    <div>
      <p>Supported chains: {SUPPORTED_CHAINS.map((chain) => chain.name).join(", ")}</p>
      {providers.map(({ info, provider }) => (
        <div key={info.uuid} style={{ display: "flex", gap: "10px" }}>
          <img src={info.icon} alt={info.name} width={50} height={50} />
          <p>{info.name}</p>
          <button
            disabled={busy || Boolean(account)}
            onClick={() => handleConnectWallet(provider)}
          >
            Connect {info.name}
          </button>
        </div>
      ))}

      {account && (
        <div>
          <h2>Wallet connected</h2>
          <p>Account connected: {account}</p>
          <p>Chain connected: {supportedChain?.name || chainId} ({chainId})</p>
          <button onClick={handleDisconnectWallet}>Disconnect wallet</button>
        </div>
      )}

      {unsupportedChain && (
        <div>
          <p role="alert">Unsupported chain: {chainId}.</p>
          <section aria-label="Switch to a supported chain">
            <p>Please switch to a supported chain to continue:</p>
            {SUPPORTED_CHAINS.map((chain) => (
              <button key={chain.id} disabled={busy} onClick={() => handleSwitchChain(chain)}>
                Switch to {chain.name}
              </button>
            ))}
          </section>
        </div>
      )}
      {error && <p role="alert">{error}</p>}
      {busy && <p role="status">Waiting for your wallet…</p>}
    </div>
  );
};

export default Eip6963;
