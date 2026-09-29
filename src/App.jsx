import { useEffect, useState } from "react";
import Eip6963 from "./Eip6963";

function App() {
  const [account, setAccount] = useState("");
  const [chainId, setChainId] = useState(0);

  useEffect(() => {
    const provider = window.ethereum;
    if (!provider) return;

    let active = true;

    const accountsChanged = (accounts) => {
      if (active) setAccount(accounts[0] || "");
    };
    const chainChanged = (id) => {
      if (active) setChainId(Number(id));
    };
    const disconnected = () => {
      if (!active) return;
      setAccount("");
      setChainId(0);
    };

    async function setUp() {
      try {
        const accounts = await provider.request({
          method: "eth_requestAccounts",
        });
        const id = await provider.request({ method: "eth_chainId" });
        if (!active) return;

        accountsChanged(accounts);
        chainChanged(id);
        provider.on("accountsChanged", accountsChanged);
        provider.on("chainChanged", chainChanged);
        provider.on("disconnect", disconnected);
      } catch (error) {
        if (active) console.error("Unable to initialize the wallet:", error);
      }
    }

    setUp();

    return () => {
      active = false;
      provider.removeListener("accountsChanged", accountsChanged);
      provider.removeListener("chainChanged", chainChanged);
      provider.removeListener("disconnect", disconnected);
    };
  }, []);

  return (
    <div>
      <Eip6963 />

      <h1 style={{ margin: "20px" }}>EIP 1193</h1>
      <p>Account: {account}</p>
      <p>chainid: {chainId}</p>
    </div>
  );
}

export default App;
