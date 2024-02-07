class Card {
    constructor(rank, suit, frontImageUrl, boolBackCardImage) {
      this.rank = rank;
      this.suit = suit;
      this.frontCardImageUrl = frontImageUrl;
      this.boolBackCardImage = boolBackCardImage;
      this.backCardImageUrl = 'images/backCard.png';

    }
}

class Deck {
    constructor() {
      this.cards = [];
      this.suits = ['heart', 'diamond', 'club', 'spade'];
      this.ranks = Array.from({length: 9}, (_, i) => i + 6); // ranks 6 to 14
    }
  
    generateDeck() {
      for (let suit of this.suits) {
        for (let rank of this.ranks) {
          let frontCardImageUrl = `images/${suit}/${rank}.png`; // images saved in this format
          this.cards.push(new Card(rank, suit, frontCardImageUrl, boolBackCardImage));
        }
      }
    }
}

module.exports = Deck;

