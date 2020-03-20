import React from 'react';
import {
  StyleSheet,
  Dimensions,
  StatusBar,
  TouchableOpacity,
  View,
  Text,
} from 'react-native';
import Matter from 'matter-js';
import { GameEngine } from 'react-native-game-engine';
import { Ball } from './components/Ball';
import { Player } from './components/Player';
import { Score } from './components/Score';

const SCORE_LIMIT = 2;
const STARTING_SPEED = 5;
const SPEED_MULTIPLIER = 1.3;
const MAX_SPEED = 30;

var player1Score = 0;
var player2Score = 0;

const { width, height } = Dimensions.get('screen');

const ballSize = Math.trunc(Math.max(width, height) * 0.035);
const initialBallPosition = { x: width / 2, y: height / 2 };
const initialBall = Matter.Bodies.circle(
  initialBallPosition.x,
  initialBallPosition.y,
  ballSize,
  {
    restitution: 1.01,
    frictionAir: 0,
    inertia: Infinity,
  },
);

const playerWidth = width / 3;
const playerHeight = height / 75;
const initialPlayer1Position = { x: width / 2, y: height * 0.95 };
const initialPlayer1 = Matter.Bodies.rectangle(
  initialPlayer1Position.x,
  initialPlayer1Position.y,
  playerWidth,
  playerHeight,
  { isStatic: true, label: 'Player1' },
);
const initialPlayer2Position = { x: width / 2, y: height * 0.05 };
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
  running: boolean;
  whoWon: string;
}

export class Game extends React.Component<{}, State> {
  entities: any;
  gameEngine: any;

  constructor(props: any) {
    super(props);

    this.state = {
      running: true,
      whoWon: '',
    };

    this.gameEngine = null;

    this.entities = this.setupWorld();
  }

  setupWorld() {
    Matter.Events.on(engine, 'collisionStart', function(event) {
      const { bodyA, bodyB } = event.pairs[0];
      if (bodyA.label === 'Player1' || bodyA.label === 'Player2') {
        const newY = bodyB.velocity.y * -SPEED_MULTIPLIER;

        Matter.Body.setVelocity(bodyB, {
          x: (bodyB.position.x - bodyA.position.x) * 0.1,
          y: Math.abs(newY) < MAX_SPEED ? newY : MAX_SPEED,
        });
      }
      if (bodyB.label === 'Player1' || bodyB.label === 'Player2') {
        const newY = bodyA.velocity.y * -SPEED_MULTIPLIER;

        Matter.Body.setVelocity(bodyA, {
          x: (bodyA.position.x - bodyB.position.x) * 0.1,
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
        x: width * 0.9,
        y: height * 0.93,
        text: String(player1Score),
        player1: true,
      },
      player2Score: {
        renderer: Score,
        x: width * 0.1,
        y: height * 0.03,
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
          Matter.Body.setVelocity(initialBall, { x: 0, y: STARTING_SPEED });
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
    Matter.Body.setPosition(initialBall, initialBallPosition);
    Matter.Body.setVelocity(initialBall, { x: 0, y: 0 });
    Matter.Body.setPosition(initialPlayer1, initialPlayer1Position);
    Matter.Body.setPosition(initialPlayer2, initialPlayer2Position);
  }

  gameOver(who: string) {
    this.setState({
      running: false,
      whoWon: who,
    });
  }

  reset() {
    this.gameEngine.swap(this.setupWorld());
    this.setState({
      running: true,
      whoWon: '',
    });
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
          running={this.state.running}
          entities={this.entities}>
          <StatusBar hidden={false} />
        </GameEngine>
        {!this.state.running && (
          <TouchableOpacity
            style={styles.fullScreenButton}
            onPress={this.reset.bind(this)}>
            <View style={styles.fullScreen}>
              <Text style={styles.gameOverText}>
                {this.state.whoWon + ' Won!'}
              </Text>
              <Text style={styles.gameOverText}>Tap anywhere to restart</Text>
            </View>
          </TouchableOpacity>
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
  gameOverText: {
    color: 'white',
    fontSize: 48,
    textAlign: 'center',
  },
  fullScreen: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'black',
    opacity: 0.75,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullScreenButton: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    flex: 1,
  },
});
