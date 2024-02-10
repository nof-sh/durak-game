
  
function firstPlayerToStart(players, trumpCard) {
    // determine the first player
    let firstPlayer = players[0];
    let lowestTrump = trumpCard;

    for (let player of players) {
        let playerLowestTrump = player.getHand()
            .filter(card => card.getSuit() === trumpCard.getSuit())
            .sort((a,b) => a.getRank() - b.getRank())[0];
        
        if (playerLowestTrump && playerLowestTrump.getRank() < lowestTrump) {
            firstPlayer = player;
            lowestTrump = playerLowestTrump.getRank();
        }
    }

    firstPlayer.setTurn(true);
    firstPlayer.setAttack(true);

    return players.indexOf(firstPlayer);
}

function sameSuit(hand) {
    // check if all the cards in the hand have the same suit
    const suitToCheck = hand[0].getSuit();

    for (let card of hand) {
        if (card.getSuit() != suitToCheck) {
            return false; // found a card of a different suit
        }
    }

    return true; // all cards have the same suit
}

function isLegalMove(playerCard, cardsOnTable, trumpCard, player) {
    // check if the move is legal

    if (cardsOnTable.length === 0 || player.getAttack()) {
        return true; // no cards on the table, so any card is legal
    }

    const tableSuit = cardsOnTable[cardsOnTable.length - 1].getSuit();
    const tableRank = cardsOnTable[cardsOnTable.length - 1].getRank();
    const playerSuit = playerCard.getSuit();
    const playerRank = playerCard.getRank();

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

function playTurn(player, cardsOnTable, trumpCard, pot) {
    // implement the logic for a single turn of the game
}

function keepAttacking(player, playerCard, cardsOnTable) {
    // implement the logic for continuing to attack.
    // check if the player has any cards that can be used to attack.
    // if they do, retturn the cards that can be used to attack.
    // if they don't, return false.
}
  
function attack(player, playerCard, cardsOnTable) {
     // implement the logic for an attack
}
  
function checkDefend(playerCard, cardsOnTable, trumpCard) {
    // implement the logic for check defending an attack
    // check if the player has any cards that can be used to defend.
    // if they do, return the cards that can be used to defend.
    // if they don't, return false.
}

function defend(player, playerCard, cardsOnTable, trumpCard, pot) {
    // implement the logic for defending an attack
}
  
  
function checkGameOver(players) {
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
  
 module.exports = {
    firstPlayerToStart,
    sameSuit,
    isLegalMove,
    playTurn,
    attack,
    defend,
    endTurn,
    checkGameOver
 } 