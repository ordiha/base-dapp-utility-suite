let web3;
let accounts = [];
let provider;

// Connect Wallet
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
  document.getElementById("chain").innerText = "Connected ✅";
}

// Contracts actions
const actions = {};

// Build UI + methods
function renderContracts() {
  const container = document.getElementById("contracts");

  for (const [name, { abi, address }] of Object.entries(abis)) {
    const card = document.createElement("div");
    card.className = "p-4 bg-gray-800 rounded-lg shadow";

    let html = `<h2 class="text-xl font-bold mb-3">${name}</h2>`;

    abi.forEach(fn => {
      if (fn.type === "function") {
        let inputsHtml = "";
        fn.inputs.forEach(input => {
          inputsHtml += `<input id="${name}_${fn.name}_${input.name}" placeholder="${input.name} (${input.type})" class="w-full mb-1 px-2 py-1 rounded text-black">`;
        });

        // extra field for payable
        let valueBox = "";
        if (fn.stateMutability === "payable") {
          valueBox = `<input id="${name}_${fn.name}_value" placeholder="ETH value" class="w-full mb-1 px-2 py-1 rounded text-black">`;
        }

        html += `
          <div class="mb-3">
            <b>${fn.name}</b>
            ${inputsHtml}
            ${valueBox}
            <button class="px-3 py-1 bg-indigo-600 rounded hover:bg-indigo-500" onclick="actions['${name}']['${fn.name}']()">Run</button>
            <div id="${name}_${fn.name}_status" class="text-sm text-green-400 mt-1"></div>
          </div>
        `;
      }
    });

    card.innerHTML = html;
    container.appendChild(card);
  }
}

// Generate methods
for (const [name, { abi, address }] of Object.entries(abis)) {
  actions[name] = {};

  abi.forEach(fn => {
    if (fn.type === "function") {
      const fnName = fn.name;

      actions[name][fnName] = async () => {
        if (!web3 || accounts.length === 0) {
          alert("Please connect wallet first!");
          return;
        }

        try {
          const inputs = fn.inputs.map(input => {
            const el = document.getElementById(`${name}_${fnName}_${input.name}`);
            let val = el ? el.value : undefined;
            if (input.type.includes("[]")) {
              return val ? val.split(",") : [];
            }
            return val;
          });

          const contract = new web3.eth.Contract(abi, address);
          const txMethod = contract.methods[fnName](...inputs);

          let result;
          if (fn.stateMutability === "view" || fn.stateMutability === "pure") {
            result = await txMethod.call({ from: accounts[0] });
            document.getElementById(`${name}_${fnName}_status`).innerText = `Result: ${JSON.stringify(result)}`;
          } else {
            let valueEl = document.getElementById(`${name}_${fnName}_value`);
            let options = { from: accounts[0] };
            if (valueEl && valueEl.value) {
              options.value = web3.utils.toWei(valueEl.value, "ether");
            }
            result = await txMethod.send(options);
            document.getElementById(`${name}_${fnName}_status`).innerText = `Tx: ${result.transactionHash}`;
          }
        } catch (e) {
          console.error(e);
          document.getElementById(`${name}_${fnName}_status`).innerText = `Error: ${e.message}`;
        }
      };
    }
  });
}

window.addEventListener("load", renderContracts);
