import * as React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export interface GameOverProps {
  onReset: () => void;
  whoWon: string;
}

export function GameOver(props: GameOverProps) {
  return (
    <TouchableOpacity style={styles.fullScreenButton} onPress={props.onReset}>
      <View style={styles.fullScreen}>
        <Text style={styles.gameOverText}>{props.whoWon + ' Won!'}</Text>
        <Text style={styles.gameOverText}>Tap anywhere to restart</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
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
    justifyContent: 'space-around',
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
