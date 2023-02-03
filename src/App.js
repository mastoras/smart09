import React, { Component } from 'react';
import 'bootstrap/dist/css/bootstrap.css';
import web3 from './web3';
import lottery from './lottery';

class App extends Component {
  state = {
    manager: '',
    players: [],
    balance: '',
    value: '',
    message: '',
    currentAccount: '', // <---
    lastWinner: '' // <---
  };

  async componentDidMount() {
    window.ethereum.on('accountsChanged', (accounts) => {
      window.location.reload();
    });

    const manager = await lottery.methods.manager().call();
    const players = await lottery.methods.getPlayers().call();
    const balance = await web3.eth.getBalance(lottery.options.address);
    const currentAccount = (await web3.eth.getAccounts())[0]; // <---

    this.setState({ manager, players, balance, currentAccount });
    // this.refreshAccount();

    lottery.events.PlayerEntered({}, async (error, event) => {
      if (error) {
        console.error(error);
      } else {
        const players = await lottery.methods.getPlayers().call();
        const balance = await web3.eth.getBalance(lottery.options.address);
        this.setState({ players, balance });
      }
    });

    lottery.events.WinnerPicked({}, async (error, event) => {
      if (error) {
        console.error(error);
      } else {
        const players = await lottery.methods.getPlayers().call();
        const balance = await web3.eth.getBalance(lottery.options.address);
        const lastWinner = event.returnValues.winner;
        this.setState({ lastWinner, players, balance });
      }
    });
}

  onSubmit = async event => {
    event.preventDefault();

    this.setState({ message: 'Waiting on transaction success...' });

    await lottery.methods.enter().send({
      from: this.state.currentAccount,
      value: web3.utils.toWei(this.state.value, 'ether')
    });
    
    this.setState({ message: 'You have been entered!' });
  };



  onClick = async () => {
    // const accounts = await web3.eth.getAccounts();

    this.setState({ message: 'Waiting on transaction success...' });

    await lottery.methods.pickWinner().send({
      // from: accounts[0]
      from: this.state.currentAccount
    });

    this.setState({ message: 'A winner has been picked!' });
  };


  render() {
    return (
      <div>
        <h2>Lottery Contract</h2>
        <p>
          This contract is managed by {this.state.manager}. There are currently{' '}
          {this.state.players.length} people entered, competing to win{' '}
          {web3.utils.fromWei(this.state.balance, 'ether')} ether!
        </p>

        <hr />

        <form onSubmit={this.onSubmit}>
          {/* <h4>Want to try your luck?</h4> */}
          <h4>Want to try your luck? Connected wallet address: {this.state.currentAccount}</h4>
          <div>
            <label>Amount of ether to enter</label>
            <input
              value={this.state.value}
              onChange={event => this.setState({ value: event.target.value })}
            />
          </div>
          <button>Enter</button>
        </form>

        <hr />

        <h4>Ready to pick a winner?</h4>
        <button onClick={this.onClick}>Pick a winner!</button>

        <hr />

        <h1>{this.state.message}</h1>
        {this.state.lastWinner &&
          <h3>Last Winner Address: {this.state.lastWinner}</h3>
        }
      </div>
    );
  }
}

export default App;
