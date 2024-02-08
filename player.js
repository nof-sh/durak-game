
class Player {
    constructor(name) {
        this.name = name;
        this.hand = [];
        this.turn = false;
        this.attack = false;
        this.points = 0;
    }
    playCard(card) {
        // remove the played card from the player's hand
        let index = this.hand.indexOf(card);
        if (index > -1) {
            this.hand.splice(index, 1);
            return card;
        }
    }
    addPoints(points) {
        this.points += points;
    }
    getHand() {
        return this.hand;
    }
    getName() {
        return this.name;
    }
    getPoints() {
        return this.points;
    }
    setHand(hand) {
        this.hand = hand;
    }
    setPoints(points) {
        this.points = points;
    }
    setName(name) {
        this.name = name;
    }

    setTurn(turn) {
        this.turn = turn;
    }

    getTurn() {
        return this.turn;
    }

    setAttack(attack) {
        this.attack = attack;
    }

    getAttack() {
        return this.attack;
    }
}

module.exports = Player;