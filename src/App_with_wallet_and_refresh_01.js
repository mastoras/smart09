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
    currentAccount: '' // <---
  };

  async componentDidMount() {
    const manager = await lottery.methods.manager().call();
    const players = await lottery.methods.getPlayers().call();
    const balance = await web3.eth.getBalance(lottery.options.address);
    const currentAccount = (await web3.eth.getAccounts())[0]; // <---

    this.setState({ manager, players, balance, currentAccount });
    this.refreshAccount();
  }

  refreshAccount = async () => {
    const accounts = await web3.eth.getAccounts();

    if (this.state.currentAccount !== accounts[0]) {
      this.setState({ currentAccount: accounts[0] });
    }

    setTimeout(() => {
      this.refreshAccount();
    }, 1000);
  };

  onSubmit = async event => {
    event.preventDefault();

    // const accounts = await web3.eth.getAccounts();

    // this.setState({ message: 'Waiting on transaction success...' });

    // await lottery.methods.enter().send({
    //   from: accounts[0],
    //   value: web3.utils.toWei(this.state.value, 'ether')
    // });

    // this.setState({ message: 'You have been entered!' });

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
      </div>
    );
  }
}

export default App;
