// gameLogic.js
const dorakLogic = require('./dorakLogic');
const Deck = require('./cards');
const Player = require('./player');

function initPlayers(players) {
    // create a player object for each player
    let playerObjects = [];
    for (let player of players) {
        playerObjects.push(new Player(player));
    }
    return playerObjects;
}
  
function updateGameState (gameState, action){

}

class Game {

    constructor(players) {
      this.players = initPlayers(players);
      this.deck = new Deck();
      this.pot = [];
      this.trumpCard = null;
      this.currentPlayerIndex = null;
      this.firstPlayerToStart = null;
      this.cardsOnTable = [];
      // other game state variables...
    }

    setTrumpCard() {
        // draw the first card from the pot and set it as the trump card.
        randomIndex = Math.floor(Math.random() * this.pot.length);
        return this.pot.splice(randomIndex, 1)[0];
    }

    dealCards(numCards) {
        let dealtCards = [];
        for(let i = 0; i < numCards; i++) {
            let randomIndex = Math.floor(Math.random() * this.deck.length);
            let card = this.deck.splice(randomIndex, 1)[0];
            dealtCards.push(card);
        }
        return dealtCards;
    }

    startNewGame () {
        this.deck.generateDeck(); // Create a deck of cards
        // other setup logic...

        // Distribute six cards to each player
        for (let player of this.players) {
            player.setHand(dealCards(this.deck.getCards(), 6));
            if (dorakLogic.sameSuit(player.getHand())) {
                // If a player has all cards of the same suit, reshuffle and redistribute the cards
                return startNewGame();
            }
        }// Draw the first card from the pot and set it as the trump card
        this.trumpCard = setTrumpCard(); 
        // Create the pot with the remaining cards
        this.pot = this.deck.getCards();
        
        // Determine the first player 
        this.firstPlayerToStart = dorakLogic.determineFirstPlayer(this.players, this.trumpCard);
        this.currentPlayerIndex = this.firstPlayerToStart;

    } 

    takeCardsFromPot(player){
        // implement the logic for taking cards from the pot
        // if the player's hand is less than 6, take cards from the pot
        handLength = player.getHand().length;
        if (handLength < 6){
            // if the pot is not empty, take cards from the pot
            if (this.pot.length !== 0) {
                let cardsToTake = this.pot.splice(0, 6 - handLength);
                player.setHand(player.getHand().concat(cardsToTake));
        
            }
            // if the pot is empty and the trump card is not null, take the trump card
            if (this.pot.length === 0 && this.trumpCard !== null) {
                player.setHand(player.getHand().concat(this.trumpCard));
                this.trumpCard = null;
            }
        }
    }

    playGame () {
        // implement the logic for playing the game
    }

    swapTurns () {
        // implement the logic for swapping turns
        this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.players.length;

        if (this.currentPlayerIndex === this.firstPlayerToStart) {
            if (this.cardsOnTable.length != 0 && !(this.players[this.firstPlayerToStart].getHand().some(card => dorakLogic.isLegalMove(card, this.cardsOnTable, this.trumpCard, this.firstPlayerToStart, this.firstPlayerToStart)))) {
                // if the first player cannot play a card, the turn is over and the cards on the table are deleted.
                this.cardsOnTable = [];
                // the first player to start is the one who played the last card.
                this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.players.length;
                // check that all the players have 6 cards in their hands - unless the pot is empty and the trump card is null.
                for (let player of this.players) {
                    takeCardsFromPot(player);
                }

            }
            
        }
    }

    playCard (player, card) {
        // implement the logic for playing a card.
        if (this.currentPlayerIndex !== this.players.indexOf(player)) {
            throw new Error('It is not your turn');
        } else if (!dorakLogic.isLegalMove(card, this.cardsOnTable, this.trumpCard, this.players.indexOf(player), this.firstPlayerToStart)) {
            throw new Error('Illegal move');
        } else {
            this.cardsOnTable.push(player.playCard(card));
            swapTurns();
            
        }
    }

    getCurrentPlayer () {
        return this.players[this.currentPlayerIndex];
    }

    getTrumpCard () {
        return this.trumpCard;
    }

    getDeck(){
        return this.deck;
    }

    getPot(){
        return this.pot;
    }

    removeFromPot(card){
        let index = this.pot.indexOf(card);
        if (index > -1) {
            this.pot.splice(index, 1);
        }
    }

    getPlayers(){
        return this.players;
    }


}

module.exports = {
    Game
  };