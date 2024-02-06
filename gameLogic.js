// gameLogic.js
function createDeck() {
   // Implementation here
}
  
function shuffleDeck(deck) {
   // Implementation here
}
  
function dealCards(deck, numCards) {
    // Implementation here
}
  
function drawCard(pot) {
    // Implementation here
}
  
function checkSameSuit(hand) {
    // Implementation here
}
  

module.exports = {
    updateGameState: function(gameState, action) {
      // Implement your game state update logic here
    },
    checkGameRules: function(gameState) {
      // Implement your game rules checking logic here
    },
    startNewGame: function(players) {
          // Create a deck of cards
        const deck = createDeck();

        // Shuffle the deck
        shuffleDeck(deck);

        // Distribute six cards to each player
        for (let player of players) {
            player.hand = dealCards(deck, 6);
            // Check if every card in the hand has the same suit as the first card....
            //.........if so, reshuffle and redistribute the cards.
        }

        // Create the pot with the remaining cards
        const pot = deck;

        // Draw the first card from the pot and set it as the trump card
        const trumpCard = drawCard(pot);
        pot.unshift(trumpCard);

        // Check if any player has all cards of the same suit
        for (let player of players) {
            if (checkSameSuit(player.hand)) {
            // If a player has all cards of the same suit, reshuffle and redistribute the cards
            return startNewGame(players);
            }
        }

        // Return the initial game state
        return {
            players,
            pot,
            trumpCard
        };
        
    }
  };