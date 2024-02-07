// gameLogic.js
const gameLogic = require('./gameLogic');
const Deck = require('./cards');

  
function shuffleDeck(deck) {
   // Implementation here
}
  
function dealCards(deck, numCards) {
    // Implementation here
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
        this.deck.generateDeck();
        this.dealInitialCards();
        this.determineFirstPlayer();
        // other setup logic...
        // Create a deck of cards

        // Shuffle the deck
        shuffleDeck(deck);

        // Distribute six cards to each player
        for (let player of players) {
            player.hand = dealCards(deck, 6);
            // Check if every card in the hand has the same suit as the first card....
            //.........if so, reshuffle and redistribute the cards.
        }

        // Create the pot with the remaining cards
        this.pot = deck;

        // Draw the first card from the pot and set it as the trump card
        this.trumpCard = drawCard(pot);
        this.pot.unshift(trumpCard);

        // Check if any player has all cards of the same suit
        for (let player of players) {
            if (gameLogic.sameSuit(player.hand)) {
                // If a player has all cards of the same suit, reshuffle and redistribute the cards
                return startNewGame();
            }
        }  

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