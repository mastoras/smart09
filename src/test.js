class App extends Component {
    state = {
      manager: '',
      players: [],
      balance: '',
      value: '',
      message: ''
    };
  
    async componentDidMount() {
  
      window.ethereum.on('accountsChanged', (accounts) => {
        window.location.reload();
      });
  
      const manager = await lottery.methods.manager().call();
      const players = await lottery.methods.getPlayers().call();
      const balance = await web3.eth.getBalance(lottery.options.address);
      const currentAccount = (await web3.eth.getAccounts())[0]; 
      this.setState({ manager, players, balance, currentAccount });
  
     lottery.events.PlayerEntered()
      .on('data', async (data) => {
          console.log(data.returnValues.player);
          const players = await lottery.methods.getPlayers().call();
          const balance = await web3.eth.getBalance(lottery.options.address);
          this.setState({ players, balance });
      });
      
      lottery.events.WinnerPicked()
      .on('data', async (data) => {
          console.log(data.returnValues.winner);
          const players = await lottery.methods.getPlayers().call();
          const balance = await web3.eth.getBalance(lottery.options.address);
          const lastWinner = data.returnValues.winner;
          this.setState({ lastWinner, players, balance });
      });
      
    }
  