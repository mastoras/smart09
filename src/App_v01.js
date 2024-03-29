import React, { Component } from 'react';
import 'bootstrap/dist/css/bootstrap.css';
import web3 from './web3';
import lottery from './lottery';

// Η κλάση App αποτελεί απόγονο της Component 
// η οποία είναι θεμελιώδης στην react.
// Σε κάθε αλλαγή κάποιου στοιχείου εντός της App,
// π.χ. πληκτρολογώντας εντός ενός textBox,
// ή αν τροποποιηθεί κάποια μεταβλητή state,
// όλη η ιστοσελίδα (HTML) γίνεται refresh
// καλώντας αυτόματα τη render()...
// ...ΠΡΟΣΟΧΗ! ΔΕΝ γίνεται reload... ΜΟΝΟ refresh
class App extends Component {
  state = {
    manager: '',
    players: [],
    balance: '',
    value: '',
    message: ''
  };

  // Η componentDidMount() καλείται ΜΟΝΟ την πρώτη φορά
  // που φορτώνει η ιστοσελίδα (είναι σαν την onLoad())
  async componentDidMount() {

    // Κάθε φορά που επιλέγεται άλλο πορτοφόλι στο metamask...
    window.ethereum.on('accountsChanged', (accounts) => {
      // ... να γίνεται reload η σελίδα, δηλ. να καλείται η componentDidMount()
      window.location.reload();
    });

    // Ορισμός των state μεταβλητών
    const manager = await lottery.methods.manager().call();
    const players = await lottery.methods.getPlayers().call();
    const balance = await web3.eth.getBalance(lottery.options.address);
    const currentAccount = (await web3.eth.getAccounts())[0]; 
    this.setState({ manager, players, balance, currentAccount });

    // Αν δεν υπήρχε παραπάνω η window.ethereum.on('accountsChanged', (accounts)
    // this.refreshAccount();
  }

// Αν δεν υπήρχε παραπάνω η window.ethereum.on('accountsChanged', (accounts)
//   refreshAccount = async () => {
//     const accounts = await web3.eth.getAccounts();

//     if (this.state.currentAccount !== accounts[0]) {
//       this.setState({ currentAccount: accounts[0] });
//     }

//     setTimeout(() => {
//       this.refreshAccount();
//     }, 1000);
//   };

  // Όταν πατηθεί το κουμπί "Enter"
  onSubmit = async event => {
    event.preventDefault();

    this.setState({ message: 'Waiting on transaction success...' });

    await lottery.methods.enter().send({ // Κλήση της "enter()" του συμβολαίου
      from: this.state.currentAccount,
      value: web3.utils.toWei(this.state.value, 'ether')
    });

    this.setState({ message: 'You have been entered!' });
  };

  // Όταν πατηθεί το κουμπί "Pick a Winner"
  onClick = async () => {
    this.setState({ message: 'Waiting on transaction success...' });

    await lottery.methods.pickWinner().send({ // Κλήση της "pickWinner()" του συμβολαίου
      from: this.state.currentAccount
    });

    this.setState({ message: 'A winner has been picked!' });
  };

  // Κάθε φορά που η σελίδα γίνεται refresh
  render() {
    return (
      <div>
        <h2>Lottery Contract</h2>
        {/* Ό,τι βρίσκεται εντός των άγκιστρων είναι κώδικας JavaScript */}
        {/* Η σελίδα HLML λειτουργεί αυτόνομα, σαν να εκτελείται σε κάποιον server */}
        <p>
          This contract is managed by {this.state.manager}. There are currently{' '}
          {this.state.players.length} people entered, competing to win{' '}
          {web3.utils.fromWei(this.state.balance, 'ether')} ether!
        </p>

        <hr /> {/*  -------------------- Οριζόντια γραμμή -------------------- */}

        {/* Η φόρμα "Want to try your luck?" */}
        {/* Θα μπορούσε αντί να χρησιμοποιηθεί φόρμα, */}
        {/* να χρησιμοποιηθεί button... */}
        {/* και αντί .onSubmit να χρησιμοποιούνταν .onClick */}
        <form onSubmit={this.onSubmit}>
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

        <hr /> {/*  -------------------- Οριζόντια γραμμή -------------------- */}

        <h4>Ready to pick a winner?</h4>
        <button onClick={this.onClick}>Pick a winner!</button>

        <hr /> {/*  -------------------- Οριζόντια γραμμή -------------------- */}

        <h1>{this.state.message}</h1>
      </div>
    );
  }
}

export default App;
