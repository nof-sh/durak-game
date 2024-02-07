
  
function firstPlayerToStart(players, trumpCard) {
    // determine the first player
    let firstPlayer = players[0];
    let lowestTrump = trumpCard.rank;

    for (let player of players) {
        let playerLowestTrump = player.cards
            .filter(card => card.suit === trumpCard.suit)
            .sort((a,b) => a.rank - b.rank)[0];
        
        if (playerLowestTrump && playerLowestTrump.rank < lowestTrump) {
            firstPlayer = player;
            lowestTrump = playerLowestTrump.rank;
        }
    }

    return firstPlayer;
}

function sameSuit(hand) {
    if (hand.length === 0) {
        return true; // an empty hand is trivially all the same suit
    }

    const suitToCheck = hand[0].suit;

    for (let card of hand) {
        if (card.suit !== suitToCheck) {
            return false; // found a card of a different suit
        }
    }

    return true; // all cards have the same suit
}
  
function playTurn() {
    // implement the logic for a single turn of the game
}
  
function attack() {
     // implement the logic for an attack
}
  
function defend() {
    // implement the logic for defending an attack
}
  
function endTurn() {
    // implement the logic for the end of a turn
}
  
function checkGameOver(players) {
    // check if the game is over
    for (let player of players) {
        if (player.hand.length === 0) {
            return (true, player.playerId)
        }
    }
        return false;
}
  
 module.exports = {
    firstPlayerToStart,
    sameSuit,
    playTurn,
    attack,
    defend,
    endTurn,
    checkGameOver
 } 