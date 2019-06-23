const $ = require('jquery');
const Web3 = require('web3');

const contractAbi = require('./MosesIgbukuToken.json');

window.jquery = $;
window.$ = $;

/**
 * Adds comma seperators to numbers
 * @param {Number | String} x
 * @return {Number}
 */
function numberWithCommas(x) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

window.addEventListener('load', async function startApp() {
  const contractHelper = {
    web3: null,
    contract: null,
    baseAccount: null,
    initialiseContract(web3js, baseAccount) {
      this.web3js = web3js;
      this.baseAccount = baseAccount;
      this.contract = new web3js.eth.Contract(
        contractAbi,
        '0x3c642ad7bd413cf97e08237537fad15dd187ee8d'
      );
    },
    async setTotalSupply() {
      const tokenSupply = await this.contract.methods.totalSupply().call();
      $('#total-supply').text(numberWithCommas(tokenSupply));
    },

    async mint() {
      const amount = Number($('#mint-value').val());

      if (isNaN(amount) || amount < 1) {
        // eslint-disable-next-line max-len
        alert(`Invalid amount: mint value should be a valid number greater than zero`);
        return;
      }
      try {
        const gasLimit = 360980;
        const data = this.contract.methods.mint(this.baseAccount, amount).encodeABI();

        const tx = {
          from: this.baseAccount,
          data,
          to: this.contract._address,
          gasPrice: '0x00',
          gasLimit,
        };

        const receipt = await this.web3js.eth.sendTransaction(tx);
        $('#info-general').show();
        console.log(receipt);
        $('#mint-value').val('');
        this.setTotalSupply();
        // const result = await this.contract.mint(this.baseAccount, amount);
      } catch (err) {
        console.log(`Mint error: ${err.message}`);
        alert('Mint request failed');
      } finally {
        $('#info-general').hide();
      }
    },
  };

  if (web3) {
    // Use Mist/MetaMask's provider
    web3js = new Web3(web3.currentProvider);

    console.log(`the addresses are ${web3.currentProvider.selectedAddress}`);

    // check if Metamask is connected to Rinkeby
    const network = await web3js.eth.net.getNetworkType();
    if (network === 'rinkeby') {
      console.log(`Connected to Rinkeby - ${network}`);

      const accounts = await web3js.eth.getAccounts();
      if (accounts.length) {
        const baseAccount = accounts[0];

        console.log(`web3js.eth.requestAccounts: - ${baseAccount}`);

        contractHelper.initialiseContract(web3js, baseAccount);
        contractHelper.setTotalSupply();

        $('#mint-btn').click(async () => {
          await contractHelper.mint();
        });
      } else {
        const errMsg = `You are not logged in. Please login or create 
        an account with metamask or mist`;
        console.log(errMsg);

        $('#errors-general').html(errMsg).show();
      }
    } else {
      const errMsg = `You are currently connected to ${network}. 
      Please change to "rinkeby" from metamask or mist`;
      $('#errors-general').html(errMsg).show();
    }
    const accounts = await web3js.eth.getAccounts();
    console.log(`web3js.eth.requestAccounts: - ${accounts[0]}`);
  } else {
    console.log('No web3? You should consider trying MetaMask!');
    const errMsg = `No web3 provider was detected. Please install <a href="https://metamask.io/" target="_blank">metamask</a>
        Or <a href="https://github.com/ethereum/mist/releases" target="_blank">mist browser</a> then reload this page.`;

    $('#errors-general').html(errMsg).show();
  }
});
