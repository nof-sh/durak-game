// gameLogic.js
const dorakLogic = require('./dorakLogic');
const Deck = require('./cards');

  
function dealCards(deck, numCards) {
    // deal numCards from the deck to the players.
    // and remove the dealt cards from the deck.
    let dealtCards = [];
    for(let i = 0; i < numCards; i++) {
        let randomIndex = Math.floor(Math.random() * deck.length);
        let card = deck.splice(randomIndex, 1)[0];
        dealtCards.push(card);
    }
    // return the dealt cards.
    return dealtCards;
}
  
function drawCard(pot) {
    // Implementation here
}
  
function updateGameState (gameState, action){

}

class Game {

    constructor(players) {
      this.players = players;
      this.deck = new Deck();
      this.pot = [];
      this.trumpCard = null;
      // other game state variables...
    }

    startNewGame () {
        this.deck.generateDeck(); // Create a deck of cards
        this.trumpCard = drawCard(this.deck); // Draw the first card from the pot and set it as the trump card
        // other setup logic...

        // Distribute six cards to each player
        for (let player of players) {
            player.hand = dealCards(deck, 6);
            if (dorakLogic.sameSuit(player.hand)) {
                // If a player has all cards of the same suit, reshuffle and redistribute the cards
                return startNewGame();
            }
        }
        // Create the pot with the remaining cards
        this.pot = deck;
        
        // Determine the first player 
        this.firstPlayer = dorakLogic.determineFirstPlayer(this.players, this.trumpCard);

        // Return the initial game state
        return {
            players,
            pot,
            trumpCard
        };
    } 
}

module.exports = {
    Game
  };