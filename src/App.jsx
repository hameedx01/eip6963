import ConnectButton from "./components/ConnectButton.jsx";
import RefreshBalanceButton from "./components/RefreshBalanceButton.jsx";
import SupportedChains from "./components/SupportedChains.jsx";
import { useWalletConnection } from "./hooks/useWalletConnection.jsx";

function App() {
  const { account, chainId, balance, provider, getBalance, connectWallet, disconnectWallet } = useWalletConnection();

  return (
    <div>
      <h1 style={{ margin: "20px" }}>EIP 1193</h1>
      {account && <p>Account: {account}</p>}
      {chainId !== null && <p>Chain ID: {chainId}</p>}
      {account && (
        <p aria-live="polite">
          Balance (native token): {balance ?? "Unavailable"}
        </p>
      )}
      <ConnectButton
        account={account}
        connectWallet={connectWallet}
        disconnectWallet={disconnectWallet}
      />
      <RefreshBalanceButton account={account} getBalance={getBalance} />
      <SupportedChains account={account} chainId={chainId} provider={provider} />
    </div>
  );
}

export default App;
