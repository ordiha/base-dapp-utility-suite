let web3;
let accounts;
let provider;

// 🔗 Connect Wallet
document.getElementById("btnConnect").addEventListener("click", async () => {
  try {
    if (window.ethereum) {
      provider = window.ethereum;
      await provider.request({ method: "eth_requestAccounts" });
      web3 = new Web3(provider);
      accounts = await web3.eth.getAccounts();
      showWallet(accounts[0]);
      return;
    }

    const WalletConnectProvider = window.WalletConnectProvider.default;
    provider = new WalletConnectProvider({
      projectId: "5056a2b581e5962f9e3083d68053b5d8", // your WC project id
      rpc: {
        8453: "https://mainnet.base.org" // Base Mainnet
      }
    });

    await provider.enable();
    web3 = new Web3(provider);
    accounts = await web3.eth.getAccounts();
    showWallet(accounts[0]);
  } catch (err) {
    console.error(err);
    alert("Failed to connect wallet!");
  }
});

function showWallet(addr) {
  document.getElementById("addr").innerText = addr;
  document.getElementById("chain").innerText = "Connected to Base";
}

// 🔹 Build UI for all contracts dynamically
window.addEventListener("load", () => {
  const container = document.getElementById("contracts");

  for (const [name, { abi, address }] of Object.entries(abis)) {
    const div = document.createElement("div");
    div.className = "contract";
    div.innerHTML = `<h3>${name}</h3>`;

    abi.forEach(fn => {
      if (fn.type === "function") {
        const fnName = fn.name;
        const inputs = fn.inputs.map(
          input =>
            `<input id="${name}_${fnName}_${input.name}" placeholder="${input.name} (${input.type})"/>`
        ).join("");

        div.innerHTML += `
          <div>
            <button onclick="actions['${name}']['${fnName}']()">Call ${fnName}</button>
            ${inputs}
            <span id="${name}_${fnName}_status"></span>
          </div>
        `;
      }
    });

    container.appendChild(div);
  }
});

// 🔹 Define actions object
const actions = {};

for (const [name, { abi, address }] of Object.entries(abis)) {
  actions[name] = {};
  abi.forEach(fn => {
    if (fn.type === "function") {
      const fnName = fn.name;

      actions[name][fnName] = async () => {
        try {
          const inputs = fn.inputs.map(input => {
            const el = document.getElementById(`${name}_${fnName}_${input.name}`);
            return el ? el.value : undefined;
          });

          const contract = new web3.eth.Contract(abi, address);
          const txMethod = contract.methods[fnName](...inputs);

          let tx;
          if (fn.stateMutability === "view" || fn.stateMutability === "pure") {
            tx = await txMethod.call({ from: accounts[0] });
            document.getElementById(`${name}_${fnName}_status`).innerText = `Result: ${tx}`;
          } else {
            tx = await txMethod.send({ from: accounts[0] });
            document.getElementById(`${name}_${fnName}_status`).innerText = `Tx: ${tx.transactionHash}`;
          }
        } catch (e) {
          console.error(e);
          document.getElementById(`${name}_${fnName}_status`).innerText = `Error: ${e.message}`;
        }
      };
    }
  });
}
