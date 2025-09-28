let web3;
let accounts;
let provider;

// Connect Wallet button
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
      infuraId: "5056a2b581e5962f9e3083d68053b5d8"
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
  document.getElementById("chain").innerText = "Connected";
}

// Actions object for all contracts
const actions = {};

// Dynamically create methods from abis.js
for (const [name, { abi, address }] of Object.entries(abis)) {
  actions[name] = {};

  abi.forEach(fn => {
    if (fn.type === "function") {
      const fnName = fn.name;

      actions[name][fnName] = async () => {
        try {
          const inputs = fn.inputs.map(input => {
            const el = document.getElementById(`${name}_${fnName}_${input.name}`);
            if (!el) return undefined;
            return el.value;
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
          const statusEl = document.getElementById(`${name}_${fnName}_status`);
          if (statusEl) statusEl.innerText = `Error: ${e.message}`;
        }
      };
    }
  });
}

// Render contract UIs
function renderContracts() {
  const container = document.getElementById("contracts");

  for (const [name, { abi }] of Object.entries(abis)) {
    const box = document.createElement("div");
    box.innerHTML = `<h3>${name}</h3>`;
    
    abi.forEach(fn => {
      if (fn.type === "function") {
        const fnBox = document.createElement("div");
        fnBox.innerHTML = `<b>${fn.name}</b><br>`;
        
        fn.inputs.forEach(input => {
          fnBox.innerHTML += `<input id="${name}_${fn.name}_${input.name}" placeholder="${input.name} (${input.type})"> `;
        });
        
        fnBox.innerHTML += `<button onclick="actions['${name}']['${fn.name}']()">Call</button>`;
        fnBox.innerHTML += `<div id="${name}_${fn.name}_status"></div>`;
        box.appendChild(fnBox);
      }
    });
    container.appendChild(box);
  }
}

// Call renderer after page load
window.addEventListener("load", renderContracts);
