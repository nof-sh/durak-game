
const e = require('express');
const { Deck } = require('./cards');
const { Card } = require('./cards');
const { Player } = require('./player');



class Game {

    constructor() {
      this.players = [];
      this.deck = new Deck();
      this.pot = [];
      this.trumpCard = null;
      this.currentPlayerIndex = 0;
      this.firstPlayer = null;
      this.cardsOnTable = [];
      // other game state variables...
    }
    isLegalMove( playerCard, cardsOnTable, trumpCard, player) {
        // check if the move is legal
    
        if (player.getAttack() && cardsOnTable.length == 0) {
            return true; // no cards on the table, so any card is legal
        }
    
        if (cardsOnTable.length > 0) {
            var tableSuit = cardsOnTable[cardsOnTable.length - 1].getSuit();
            var tableRank = cardsOnTable[cardsOnTable.length - 1].getRank();
            var playerSuit = playerCard.getSuit();
            var playerRank = playerCard.getRank();
        }
    
        // if the player is a defender, the move is legal if the player has a card of the same suit with a higher rank or trump card .
        if(!player.getAttack()){
            if (tableSuit === playerSuit) {
                return playerRank > tableRank; // can only play a card of the same suit with a higher rank
            // else if the player has a trump card, the move is legal.
            } else if (playerSuit === trumpCard.getSuit()) { 
                return true; // can play any trump card
            // else the player doesn't have a card of the same suit of card on table or a trump card, the move is illegal.
            } else {
                return false; 
            }
        }
    }
    
    checkGameOver(players) {
        // check if the game is over
        for (let player of players) {
            // if a player has no cards left, the game is over
            if (player.getHand().length === 0) {
                console.log(`${player.getPlayerName()} has no cards left. \n ${player.getPlayerName()} won the game\n!`);
                return (true, player.getPlayerName()); // return the name of the player who won.
            }
        }
            return false;
    }
    
    
    sameSuit(playerHand) {
        // check if all the cards in the hand have the same suit
        let suit = playerHand[0].getSuit();
        for (let card of playerHand) {
            if (card.getSuit() !== suit) {
                return false;
            }
        }
        return true;
      
    }

    initPlayers(players) {
        // create a new player object for each player
       for (let player of players) {
           this.players.push(new Player(player));
       }

    }

    setTrumpCard() {
        // draw the first card from the pot and set it as the trump card.
        let randomIndex = Math.floor(Math.random() * this.deck.length);
        return this.deck.popCard(randomIndex);
    }

    dealCards(numCards) {
        let dealtCards = [];
        for(let i = 0; i < numCards; i++) {
            let randomIndex = Math.floor(Math.random() * this.deck.getCards().length);
            let card = this.deck.popCard(randomIndex);
            dealtCards.push(card);
        }
        return dealtCards;
    }

    firstPlayerToStart() {
        // determine the first player
        let firstPlayer = this.players[0];
        let lowestTrump = this.trumpCard;
    
        for (let player of this.players) {
            let playerLowestTrump = player.getHand()
                .filter(card => card.getSuit() == this.trumpCard.getSuit())
                .sort((a,b) => a.getRank() - b.getRank())[0];
            
            if (playerLowestTrump && playerLowestTrump.getRank() < lowestTrump) {
                firstPlayer = player;
                lowestTrump = playerLowestTrump.getRank();
            }
        }
    
        firstPlayer.setTurn(true);
        firstPlayer.setAttack(true);
    
        return this.players.indexOf(firstPlayer);
    }

    startNewGame (players) {
        this.initPlayers(players);
        this.deck.generateDeck();
         // Create a deck of cards
        let copyDack = this.deck // copy the deck
        // other setup logic...

        // Distribute six cards to each player
        for (let player of this.players) {
            var hand = this.dealCards(6);
            player.setHand(hand);
            if (this.sameSuit(player.getHand())) {
                // If a player has all cards of the same suit, reshuffle and redistribute the cards
                this.deck = copyDack;
                return this.startNewGame();
            }
        }// Draw the first card from the pot and set it as the trump card
        this.trumpCard = this.setTrumpCard(); 
        // Create the pot with the remaining cards
        this.pot = this.deck;
        
        // Determine the first player 
        this.firstPlayer = this.firstPlayerToStart();
        this.currentPlayerIndex = this.firstPlayer;

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

    swapTurns () {
        // implement the logic for swapping turns
        
        this.cardsOnTable = [];
        // the turn is over and the next player is the first player to start.
        this.moveToNextPlayer();
        this.firstPlayerToStart = this.currentPlayerIndex;
        this.players[this.currentPlayerIndex].setAttack(true);
        // check that all the players have 6 cards in their hands - unless the pot is empty and the trump card is null.
        for (let player of this.players) {
            this.takeCardsFromPot(player);
        }
            
    }

    

    playCard (player, card) {
        // implement the logic for playing a card.
        // if the player is not the current player, throw an error.
        if (this.getCurrentPlayer() !== player) {
            throw new Error('It is not your turn');
        // else if - the move is not legal, throw an error.
        } else if (!isLegalMove(card, this.cardsOnTable, this.trumpCard, this.getCurrentPlayer())) {
            throw new Error('Illegal move');
        // else - the player plays the card and the turn is over.
        } else {
            this.cardsOnTable.push(player.playCard(card));
            // if - the player make an attack, the turn is over. and the next player need to defend.
            if (this.getCurrentPlayer().getAttack()){
                this.getCurrentPlayer().setAttack(false);
                this.moveToNextPlayer();
            // else if - If the round is over (we go back to the player who started the round). Start a new round with a new starting player
            }else if (this.getCurrentPlayer().getAttack() === false && this.getCurrentPlayer() === this.players[this.firstPlayer]){
                this.swapTurns();
            // else - the player can keep play and now he naad to attack.
            }else{
                this.getCurrentPlayer().setAttack(true);
            }
            checkGameOver(this.players);
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
            firstPlayer: this.firstPlayer,
            pot: this.pot.toObject(),
            trumpCard: this.trumpCard.toObject(),
            board: this.cardsOnTable.map(card => card.toObject()),
        };
    }


}

module.exports = {
    Game
}