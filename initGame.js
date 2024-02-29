// gameLogic.js
const dorakLogic = require('./dorakLogic');
const { Deck } = require('./cards');
const { Player } = require('./player');

function initPlayers(players) {
    playersArray = [];
    // create a player object for each player in the game
    for (let player of players) {
        playersArray.push(new Player(player));
    }
    return playersArray;
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
        
        this.cardsOnTable = [];
        // the turn is over and the next player is the first player to start.
        this.moveToNextPlayer();
        this.firstPlayerToStart = this.currentPlayerIndex;
        this.players[this.currentPlayerIndex].setAttack(true);
        // check that all the players have 6 cards in their hands - unless the pot is empty and the trump card is null.
        for (let player of this.players) {
            takeCardsFromPot(player);
        }
            
    }

    

    playCard (player, card) {
        // implement the logic for playing a card.
        // if the player is not the current player, throw an error.
        if (this.getCurrentPlayer() !== player) {
            throw new Error('It is not your turn');
        // else if - the move is not legal, throw an error.
        } else if (!dorakLogic.isLegalMove(card, this.cardsOnTable, this.trumpCard, this.getCurrentPlayer())) {
            throw new Error('Illegal move');
        // else - the player plays the card and the turn is over.
        } else {
            this.cardsOnTable.push(player.playCard(card));
            // if - the player make an attack, the turn is over. and the next player need to defend.
            if (this.getCurrentPlayer().getAttack()){
                this.getCurrentPlayer().setAttack(false);
                this.moveToNextPlayer();
            // else if - If the round is over (we go back to the player who started the round). Start a new round with a new starting player
            }else if (this.getCurrentPlayer().getAttack() === false && this.getCurrentPlayer() === this.players[this.firstPlayerToStart]){
                this.swapTurns();
            // else - the player can keep play and now he naad to attack.
            }else{
                this.getCurrentPlayer().setAttack(true);
            }
        }
    }

    takeCardsFromTable(player){
        // add cards to the player's hand and clear the cards on the table.
        // if - the cards on the table are empty, throw an error.
        if (this.cardsOnTable.length === 0) {
            throw new Error('There are no cards on the table');
        // else if - the player is not the current player, throw an error.
        }else if (this.currentPlayerIndex !== this.players.indexOf(player)) {
            throw new Error('It is not your turn');
        // else if - the player is the attacker, throw an error.
        }else if (this.getCurrentPlayer().getAttack()){
            throw new Error('You cannot take cards from the table, you must attack.');
        // else - the player takes the cards from the table and the turn is over.
        }else{
            player.setHand(player.getHand().concat(this.cardsOnTable));
            this.cardsOnTable = [];
            this.moveToNextPlayer();
            this.getCurrentPlayer().setAttack(true);
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

    getCurrentPlayer() {
        return this.players[this.currentPlayerIndex];
    }

    moveToNextPlayer() {
        this.getCurrentPlayer().setTurn(false);
        this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.players.length;
        this.getCurrentPlayer().setTurn(true);
    }



    toObject() {
        // convert the game object to a plain JavaScript object.
        return {
            players: this.players.map(player => player.toObject()),
            currentPlayerIndex: this.currentPlayerIndex,
            firstPlayerToStart: this.firstPlayerToStart,
            pot: this.pot.map(card => card.toObject()),
            trumpCard: this.trumpCard.toObject(),
            board: this.cardsOnTable.map(card => card.toObject()),
        };
    }


}

module.exports = {
    Game
  };