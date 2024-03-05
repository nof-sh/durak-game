class Card {
    constructor(rank, suit, frontImageUrl) {
      this.rank = rank;
      this.suit = suit;
      this.frontCardImageUrl = frontImageUrl;
      this.backCardImageUrl = 'images/backCard.png';

    }

    getRank() {
        return this.rank;
    }

    getSuit() {
        return this.suit;
    }

    getFrontCardImageUrl() {
        return this.frontCardImageUrl;
    }

    getBackCardImageUrl() {
        return this.backCardImageUrl;
    }

    toObject() {
      // convert the card object to a plain JavaScript object
        return {
            rank: this.rank,
            suit: this.suit,
            frontCardImageUrl: this.frontCardImageUrl,
            backCardImageUrl: this.backCardImageUrl
        }
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
          this.cards.push(new Card(rank, suit, frontCardImageUrl));
        }
      }
    }

    getCards() {
      return this.cards;
    }

    popCard(i) {
      // remove the i card from the deck and return it
      return this.cards[i].pop();
    }
}

module.exports = {
  Deck,
  Card
}

