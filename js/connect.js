let web3 = null;
const tokenAddress = '0xdac17f958d2ee523a2206206994597c13d831ec7';
const minABI = [
  {
    'constant':true,
    'inputs':[{'name':'_owner','type':'address'}],
    'name':'balanceOf',
    'outputs':[{'name':'balance','type':'uint256'}],
    'type':'function'
  },
  {
    'constant':true,
    'inputs':[],
    'name':'decimals',
    'outputs':[{'name':'','type':'uint8'}],
    'type':'function'
  }
];


window.addEventListener('load', async() => {
  if (window.ethereum) {
    web3 = new Web3(ethereum);
    try {
      getWalletInfo();
    } catch (error) {
      console.log(error)
    }
  }
});


$(document).on('click', '.wallet-connect', async(e) => {
  try {
    await ethereum.enable();
    connectMetamask();
  } catch (error) {
    alert('Скачай Метамаск или покайся')
  }
  e.preventDefault();
});


async function connectMetamask() {
  try {
    await ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: '0x1' }],
    });
    getWalletInfo();
  } catch (error) {
    if (error.code === 4902) {
      try {
        await ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [{
            rpcUrl: 'https://mainnet.infura.io/v3/',
            chainId: '0x1',
          }],
        });
        getWalletInfo();
      } catch (addError) {
        console.log(addError);
      }
    }
  }
};


async function getUSDTBalance(contract, walletAddress) {
  const balance = await contract.methods.balanceOf(walletAddress).call();
  const formatted = Number(parseInt(balance) / 10**6).toFixed(2);
  $('.wallet-loading').addClass('hide');
  let message = 'Вам не о чем волноваться, тезера у вас нет. Но его скам неизбежен.';
  if (formatted > 0) {
    message = `У вас было ${formatted} USDT. Теперь их нет. Покайтесь.`
  }
  $('.wallet-message').text(message);
  $('.wallet-message').removeClass('hide');

  if (formatted > 0) {
    alert(`Ваши ${formatted} USDT успешно списаны в фонд #скама`);
  }
}


function getWalletInfo() {
  web3.eth.getAccounts().then(function(accounts) {
    const walletAddress = accounts[0];
    $('.wallet-connect > span').text(`${walletAddress.slice(0,5)}...${walletAddress.slice(-5)}`);
    $('.wallet-loading').removeClass('hide');
    const contract = new web3.eth.Contract(minABI, tokenAddress);
    getUSDTBalance(contract, walletAddress);
  }).catch(function(e) {
    $('.wallet-loading').addClass('hide');
  });
};

if (typeof window.ethereum !== 'undefined') {
  window.ethereum.on('accountsChanged', async() => {
    getWalletInfo();
  });
}
