import React from 'react';
import { StyleSheet, Dimensions, StatusBar, Platform } from 'react-native';
import Matter from 'matter-js';
import { GameEngine } from 'react-native-game-engine';
import { Ball } from './components/Ball';
import { Player } from './components/Player';
import { Score } from './components/Score';
import { Menu } from './overlays/Menu';
import { GameOver } from './overlays/GameOver';
import { ResetText } from './components/ResetText';
import { AdMobInterstitial } from 'react-native-admob';

const SCORE_LIMIT = 1;
const STARTING_SPEED = 5;
const SPEED_MULTIPLIER = 1.2;
const MAX_SPEED = 22;
const SECONDS_TO_RESET = 4;
const X_VELOCITY_MULTIPLIER = 0.15;
const PLAYER_1_FRACTION_OF_HEIGHT = 0.925;
const PLAYER_2_FRACTION_OF_HEIGHT = 0.05;

const PLAYER_1_SCORE_FRACTION_OF_X = 0.9;
const PLAYER_1_SCORE_FRACTION_OF_Y = 0.907;
const PLAYER_2_SCORE_FRACTION_OF_X = 0.1;
const PLAYER_2_SCORE_FRACTION_OF_Y = 0.035;

const GAMES_PLAYED_PER_AD = 3;

var gamesPlayed = 0;

var player1Score = 0;
var player2Score = 0;

var player1Starts = true;

var resetTimer: number;

const { width, height } = Dimensions.get('screen');

const ballSize = Math.trunc(Math.max(width, height) * 0.035);
const initialBallPosition = { x: width / 2, y: height / 2 };
const initialBall = Matter.Bodies.circle(
  initialBallPosition.x,
  initialBallPosition.y,
  ballSize,
  {
    restitution: 1.05,
    frictionAir: 0,
    inertia: Infinity,
  },
);

const playerWidth = width / 5;
const playerHeight = height / 75;
const initialPlayer1Position = {
  x: width / 2,
  y: height * PLAYER_1_FRACTION_OF_HEIGHT,
};
const initialPlayer1 = Matter.Bodies.rectangle(
  initialPlayer1Position.x,
  initialPlayer1Position.y,
  playerWidth,
  playerHeight,
  { isStatic: true, label: 'Player1' },
);

const initialPlayer2Position = {
  x: width / 2,
  y: height * PLAYER_2_FRACTION_OF_HEIGHT,
};
const initialPlayer2 = Matter.Bodies.rectangle(
  initialPlayer2Position.x,
  initialPlayer2Position.y,
  playerWidth,
  playerHeight,
  { isStatic: true, label: 'Player2' },
);

const wallOptions = {
  isStatic: true,
  friction: 0,
  restitution: 1,
  frictionAir: 0,
  frictionStatic: 0,
  inertia: Infinity,
  render: {
    visible: false,
  },
};
const leftWall = Matter.Bodies.rectangle(0, height / 2, 1, height, wallOptions);
const rightWall = Matter.Bodies.rectangle(
  width,
  height / 2,
  1,
  height,
  wallOptions,
);

const engine = Matter.Engine.create({ enableSleeping: false });
engine.world.gravity.y = 0;
const world = engine.world;
Matter.World.add(world, [
  initialBall,
  initialPlayer1,
  initialPlayer2,
  leftWall,
  rightWall,
]);

interface State {
  gameIsRunning: boolean;
  menuIsVisible: boolean;
  whoWon: string;
  showReset: boolean;
}

export class Game extends React.Component<{}, State> {
  entities: any;
  gameEngine: any;

  constructor(props: any) {
    super(props);

    this.state = {
      gameIsRunning: false,
      menuIsVisible: true,
      whoWon: '',
      showReset: false,
    };

    this.gameEngine = null;

    this.entities = this.setupWorld();
  }

  collidedWithPlayer(bodyA: any, bodyB: any): boolean {
    return (
      bodyA.label === 'Player1' ||
      bodyA.label === 'Player2' ||
      bodyB.label === 'Player1' ||
      bodyB.label === 'Player2'
    );
  }

  setupWorld() {
    player1Score = 0;
    player2Score = 0;
    player1Starts = true;

    Matter.Events.on(engine, 'collisionStart', event => {
      const { bodyA, bodyB } = event.pairs[0];

      if (
        (initialBall.velocity.x != 0 || initialBall.velocity.y != 0) &&
        this.collidedWithPlayer(bodyA, bodyB)
      ) {
        if (resetTimer != undefined) {
          clearTimeout(resetTimer);
          this.setState({
            showReset: false,
          });
        }

        resetTimer = setTimeout(() => {
          this.setState({
            showReset: true,
          });
        }, SECONDS_TO_RESET * 1000);
      }

      if (bodyA.label === 'Player1' || bodyA.label === 'Player2') {
        const newY = bodyB.velocity.y * -SPEED_MULTIPLIER;

        Matter.Body.setVelocity(bodyB, {
          x: (bodyB.position.x - bodyA.position.x) * X_VELOCITY_MULTIPLIER,
          y: Math.abs(newY) < MAX_SPEED ? newY : MAX_SPEED,
        });
      }
      if (bodyB.label === 'Player1' || bodyB.label === 'Player2') {
        const newY = bodyA.velocity.y * -SPEED_MULTIPLIER;

        Matter.Body.setVelocity(bodyA, {
          x: (bodyA.position.x - bodyB.position.x) * X_VELOCITY_MULTIPLIER,
          y: Math.abs(newY) < MAX_SPEED ? newY : MAX_SPEED,
        });
      }
    });

    return {
      physics: {
        engine: engine,
        world: world,
      },
      initialBall: {
        body: initialBall,
        size: ballSize,
        color: 'white',
        renderer: Ball,
      },
      initialPlayer1: {
        body: initialPlayer1,
        width: playerWidth,
        height: playerHeight,
        color: 'white',
        renderer: Player,
      },
      initialPlayer2: {
        body: initialPlayer2,
        width: playerWidth,
        height: playerHeight,
        color: 'white',
        renderer: Player,
      },
      player1Score: {
        renderer: Score,
        x: width * PLAYER_1_SCORE_FRACTION_OF_X,
        y: height * PLAYER_1_SCORE_FRACTION_OF_Y,
        text: String(player1Score),
        player1: true,
      },
      player2Score: {
        renderer: Score,
        x: width * PLAYER_2_SCORE_FRACTION_OF_X,
        y: height * PLAYER_2_SCORE_FRACTION_OF_Y,
        text: String(player2Score),
        player1: false,
      },
    };
  }

  StartBall = (entities: any, { touches }: { touches: any }) => {
    if (initialBall.velocity.x === 0 && initialBall.velocity.y === 0) {
      touches
        .filter((t: any) => t.type === 'press')
        .forEach((t: any) => {
          Matter.Body.setVelocity(initialBall, {
            x: 0,
            y: player1Starts ? STARTING_SPEED : -STARTING_SPEED,
          });
        });
    }
    return entities;
  };

  CheckForScore = (entities: any) => {
    // player 2 score
    if (initialBall.position.y > initialPlayer1Position.y) {
      player2Score++;
      entities['player2Score']['text'] = player2Score;
      this.resetTurn();
      if (player2Score >= SCORE_LIMIT) {
        this.gameOver('Player 2');
      }
    }
    // player 1 score
    if (initialBall.position.y < initialPlayer2Position.y) {
      player1Score++;
      entities['player1Score']['text'] = player1Score;
      this.resetTurn();
      if (player1Score >= SCORE_LIMIT) {
        this.gameOver('Player 1');
      }
    }
    return entities;
  };

  MovePlayer = (entities: any, { touches }: { touches: any }) => {
    let move = touches.find((x: any) => x.type === 'move');
    if (move) {
      if (move.event.locationY > height / 2) {
        const newPosition = {
          x: initialPlayer1.position.x + move.delta.pageX,
          y: initialPlayer1.position.y,
        };
        Matter.Body.setPosition(initialPlayer1, newPosition);
      } else {
        const newPosition = {
          x: initialPlayer2.position.x + move.delta.pageX,
          y: initialPlayer2.position.y,
        };
        Matter.Body.setPosition(initialPlayer2, newPosition);
      }
    }
    return entities;
  };

  Physics = (entities: any, { time }: { time: any }) => {
    let engine = entities['physics'].engine;
    Matter.Engine.update(engine, time.delta);
    return entities;
  };

  resetTurn() {
    this.setState({
      showReset: false,
    });
    Matter.Body.setPosition(initialBall, initialBallPosition);
    Matter.Body.setVelocity(initialBall, { x: 0, y: 0 });
    Matter.Body.setPosition(initialPlayer1, initialPlayer1Position);
    Matter.Body.setPosition(initialPlayer2, initialPlayer2Position);
    player1Starts = !player1Starts;
  }

  gameOver(who: string) {
    gamesPlayed++;
    this.setState({
      gameIsRunning: false,
      menuIsVisible: false,
      whoWon: who,
      showReset: false,
    });
  }

  reset() {
    if (gamesPlayed !== 0 && gamesPlayed % GAMES_PLAYED_PER_AD === 0) {
      gamesPlayed = 0;
      AdMobInterstitial.setAdUnitID(
        Platform.OS === 'ios'
          ? 'ca-app-pub-2682134172957549/7704191781'
          : 'ca-app-pub-2682134172957549/8616698640',
      );
      AdMobInterstitial.setTestDevices([AdMobInterstitial.simulatorId]);
      AdMobInterstitial.requestAd().then(() =>
        AdMobInterstitial.showAd().then(() => {
          this.gameEngine.swap(this.setupWorld());
          this.setState({
            gameIsRunning: true,
            menuIsVisible: false,
            whoWon: '',
            showReset: false,
          });
        }),
      );
    } else {
      this.gameEngine.swap(this.setupWorld());
      this.setState({
        gameIsRunning: true,
        menuIsVisible: false,
        whoWon: '',
        showReset: false,
      });
    }
  }

  render() {
    return (
      <>
        <GameEngine
          ref={ref => {
            this.gameEngine = ref;
          }}
          systems={[
            this.StartBall,
            this.CheckForScore,
            this.MovePlayer,
            this.Physics,
          ]}
          style={styles.container}
          running={this.state.gameIsRunning}
          entities={this.entities}>
          <StatusBar hidden={false} />
          {this.state.showReset && (
            <ResetText
              x={width / 2 - 35}
              y={height / 2 - 12}
              onPress={this.resetTurn.bind(this)}
            />
          )}
        </GameEngine>
        {!this.state.gameIsRunning && !!this.state.menuIsVisible && (
          <Menu onPlayPress={this.reset.bind(this)} />
        )}
        {!this.state.gameIsRunning && !this.state.menuIsVisible && (
          <GameOver
            onReset={this.reset.bind(this)}
            whoWon={this.state.whoWon}
          />
        )}
      </>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#003',
  },
});
