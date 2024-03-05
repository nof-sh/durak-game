// Import your Game, Player and Deck classes
const {Game} = require('./initGame');
const {Player} = require('./player');
const {Deck, Card} = require('./cards');

// Mock the Player and Deck classes
jest.mock('./player');
jest.mock('./cards');

Deck.mockImplementation(() => {
  return {
    getCards: jest.fn().mockReturnValue(['card1', 'card2', 'card3']),
    generateDeck: jest.fn(),
    popCard: jest.fn().mockReturnValue('card1'),
    
    // other methods...
  };
});

Player.mockImplementation(() => {
  return {
    setHand: jest.fn(),
    setTurn: jest.fn(),
    setAttack: jest.fn(),
    getHand: jest.fn().mockReturnValue([]),
    playCard: jest.fn(),
    takeCards: jest.fn(),
    takeCardsFromPot: jest.fn(),

    
    // other methods...
  };
});

describe('Game', () => {
  let game;
  let card;
  beforeEach(() => {


    // Initialize a new game and a card before each test
    game = new Game();
    card = new Card('hearts', 'A');

    // Mock the isLegalMove and checkGameOver functions
    global.isLegalMove = jest.fn().mockReturnValue(true);
    global.checkGameOver = jest.fn();
    // Mock the Math.random function
    jest.spyOn(global.Math, 'random').mockReturnValue(0);
    // Mock the sameSuit function
    global.sameSuit = jest.fn().mockReturnValue(false);
    
   
  });

  afterEach(() => {
    // Restore the original Math.random function after each test
    jest.spyOn(global.Math, 'random').mockRestore();
  });

  it('constructor initializes with correct values', () => {
    expect(game.players.length).toBe(0);
    expect(game.deck).toBeInstanceOf(Object);
    expect(game.pot).toEqual([]);
    expect(game.trumpCard).toBeNull();
    expect(game.currentPlayerIndex).toBeNull();
    expect(game.firstPlayerToStart).toBeNull();
    expect(game.cardsOnTable).toEqual([]);
  });

  it('startNewGame initializes a new game with the players', () => {
    const players = [new Player('player1'), new Player('player2')];
    game.startNewGame(players);

    expect(game.players).toEqual(players);
    expect(game.deck.generateDeck).toHaveBeenCalled();
    expect(game.dealCards).toHaveBeenCalledWith(6);
    expect(game.players[0].setHand).toHaveBeenCalled();
    expect(game.players[1].setHand).toHaveBeenCalled();
    expect(game.setTrumpCard).toHaveBeenCalled();
    expect(game.deck.getCards).toHaveBeenCalled();
    expect(game.firstPlayerToStart).toHaveBeenCalled();

  });


  it('initPlayers creates Player instances', () => {
    expect(Player).toHaveBeenCalledTimes(2);
    expect(game.players[0]).toBeInstanceOf(Player);
    expect(game.players[1]).toBeInstanceOf(Player);
  });

  it('setTrumpCard draws a card from the pot', () => {
    game.pot = ['card1', 'card2', 'card3'];
    const card = game.setTrumpCard();

    expect(card).toBe('card1');
    expect(game.pot).toEqual(['card2', 'card3']);
  });

  it('dealCards deals cards from the deck', () => {
    game.deck.cards = ['card1', 'card2', 'card3', 'card4', 'card5', 'card6'];
    const cards = game.dealCards(3);

    expect(cards.length).toEqual(3);
    expect(game.deck.cards.length).toEqual(6);
  });

  it('firstPlayerToStart returns the first player', () => {
    const firstPlayer = game.players[0];
    const lowestTrump = game.trumpCard;

    expect(game.firstPlayerToStart).toBe(firstPlayer);
  });

  it('startNewGame initializes a new game', () => {
    game.startNewGame();

    expect(game.deck.generateDeck).toHaveBeenCalled();
    expect(game.dealCards).toHaveBeenCalledWith(6);
    expect(game.players[0].setHand).toHaveBeenCalled();
    expect(game.players[1].setHand).toHaveBeenCalled();
    expect(game.setTrumpCard).toHaveBeenCalled();
    expect(game.deck.getCards).toHaveBeenCalled();
    expect(game.firstPlayerToStart).toHaveBeenCalled();
  });

  it('playCard plays a card if the move is legal', () => {
    game.currentPlayerIndex = 0;
    

    game.playCard(game.players[0], card);

    expect(game.players[0].playCard).toHaveBeenCalledWith(card);
    expect(game.cardsOnTable).toContain(card);
  });

  it('playCard throws an error if the move is not legal', () => {
    game.currentPlayerIndex = 0;
    

    expect(() => game.playCard(game.players[0], card)).toThrow('Illegal move');
  });

  it('takeCardsFromTable adds cards to the player\'s hand and clears the cards on the table', () => {
    game.currentPlayerIndex = 0;
    game.cardsOnTable = [card];

    game.takeCardsFromTable(game.players[0]);

    expect(game.players[0].setHand).toHaveBeenCalledWith([card]);
    expect(game.cardsOnTable).toEqual([]);
  });

  it('takeCardsFromTable throws an error if the cards on the table are empty', () => {
    game.currentPlayerIndex = 0;
    game.cardsOnTable = [];

    expect(() => game.takeCardsFromTable(game.players[0])).toThrow('There are no cards on the table');
  });

  it('swapTurns swaps turns and ensures all players have 6 cards', () => {
  
    game.swapTurns();
  
    expect(game.players[0].setTurn).toHaveBeenCalledWith(false);
    expect(game.players[1].setTurn).toHaveBeenCalledWith(true);
    expect(game.players[1].setAttack).toHaveBeenCalledWith(true);
    expect(game.takeCardsFromPot).toHaveBeenCalledWith(game.players[0]);
    expect(game.takeCardsFromPot).toHaveBeenCalledWith(game.players[1]);
  });


  // Add more tests for other methods...
});