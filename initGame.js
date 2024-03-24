
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
      this.winner = "";
      // other game state variables...
    }
    isLegalMove( cardRnk, cardSuit) {
        // check if the move is legal
    
        if (this.getCurrentPlayer().getAttack() && (this.cardsOnTable.length == 0)) {
            return true; // no cards on the table, so any card is legal
        }
    
        if (this.cardsOnTable.length > 0) {
            var tableSuit = this.cardsOnTable[this.cardsOnTable.length - 1].getSuit();
            var tableRank = this.cardsOnTable[this.cardsOnTable.length - 1].getRank();
            
        }
    
        // if the player is a defender, the move is legal if the player has a card of the same suit with a higher rank or trump card .
        if(!this.getCurrentPlayer().getAttack() && this.getCurrentPlayer().getTurn()){
            if (tableSuit == cardSuit) {
                return (cardRnk > tableRank); // can only play a card of the same suit with a higher rank
            // else if the player has a trump card, the move is legal.
            } else if (cardSuit == this.trumpCard.getSuit()) { 
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
        let handLength = this.getCurrentPlayer().getHand().length;
        if (handLength < 6){
            // if the pot is not empty, take cards from the pot
            if (this.pot.length !== 0) {
                let cardsToTake = this.pot.splice(0, 6 - handLength);
                this.getCurrentPlayer().setHand(this.getCurrentPlayer().getHand().concat(cardsToTake));
        
            }
            // if the pot is empty and the trump card is not null, take the trump card
            if (this.pot.length === 0 && this.trumpCard !== null) {
                this.getCurrentPlayer().setHand(this.getCurrentPlayer().getHand().concat(this.trumpCard));
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
        if (this.getCurrentPlayer().getName() != player['name']) {
            return {status: 0, message: 'It is not your turn'};
        // else if - the move is not legal, throw an error.
        } else if (!this.isLegalMove(card['rank'], card['suit'])) {
            return {status: 0, message: 'Illegal move'};
        // else - the player plays the card and the turn is over.
        } else {
            var playedCard = this.getCurrentPlayer().playCard(card['rank'], card['suit']);
            this.cardsOnTable.push(new Card(playedCard.rank, playedCard.suit, playedCard.image));
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
            this.winner = this.checkGameWinner();
        }
        return { status: 1, message: 'Card played successfully' };
    }

    takeCardsFromTable(player){
        // add cards to the player's hand and clear the cards on the table.
        // if - the cards on the table are empty, throw an error.
        if (this.cardsOnTable.length === 0) {
            return {status: 0, message: 'There are no cards on the table'};
        // else if - the player is not the current player, throw an error.
        }else if (this.getCurrentPlayer().getName() != player['name']) {
            return {status: 0, message:'It is not your turn'};
        // else if - the player is the attacker, throw an error.
        }else if (this.getCurrentPlayer().getAttack()){
            return {status: 0, message: 'You cannot take cards from the table, you must attack.'};
        // else - the player takes the cards from the table and the turn is over.
        }else{
            this.getCurrentPlayer().setHand(this.getCurrentPlayer().getHand().concat(this.cardsOnTable));
            this.cardsOnTable = [];
            this.moveToNextPlayer();
            this.getCurrentPlayer().setAttack(true);
        }
        return {status: 1, message: 'Cards from Table added successfully'};
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

    removePlayer(player){
        let index = this.players.indexOf(player);
        if (index > -1) {
            this.players.splice(index, 1);
        }
    }

    moveToNextPlayer() {
        this.getCurrentPlayer().setTurn(false);
        this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.players.length;
        this.getCurrentPlayer().setTurn(true);
    }

    checkGameWinner(){
        // check if the game is over
        for (let player of this.players) {
            // if a player has no cards left, the game is over
            if (player.getHand().length == 0) {
                console.log(`${player.getName()} has no cards left. \n ${player.getName()} won the game\n!`);
                return (player.getName()); // return the name of the player who won.
            }
        }
            return false;
    }

    getWinner(){
        return this.winner;
    }



    toObject() {
        // convert the game object to a plain JavaScript object.
        return {
            players: this.players.map(player => player.toObject()),
            currentPlayerIndex: this.currentPlayerIndex,
            firstPlayer: this.firstPlayer,
            pot: this.pot.toObject(),
            trumpCard: this.trumpCard.toObject(),
            board: this.cardsOnTable ? this.cardsOnTable.map(card => card.toObject()) : [],
            winner: this.winner,
        };
    }


}

module.exports = {
    Game
}