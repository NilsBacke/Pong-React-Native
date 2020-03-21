import * as React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Image,
} from 'react-native';

const { width, height } = Dimensions.get('screen');

export interface MenuProps {
  onPlayPress: () => void;
}

export function Menu(props: MenuProps) {
  return (
    <View style={styles.menuScreen}>
      <Text style={[styles.player2TutorialText, styles.tutorialText]}>
        Player 2's plank
      </Text>
      <Image
        style={[styles.player2Arrow, styles.arrowIcon]}
        resizeMode="contain"
        source={require('../../assets/arrow.png')}
      />
      <Text style={styles.welcomeText}>Welcome to Pong</Text>
      <Text style={[styles.ballTutorialText, styles.tutorialText]}>
        Don't let it go past your plank!
      </Text>
      <Image
        style={[styles.ballArrow, styles.arrowIcon]}
        resizeMode="contain"
        source={require('../../assets/arrow.png')}
      />
      <TouchableOpacity
        style={styles.playButton}
        onPress={() => props.onPlayPress()}>
        <Text style={styles.playText}>Play</Text>
      </TouchableOpacity>
      <Text style={[styles.player1TutorialText, styles.tutorialText]}>
        Player 1's plank
      </Text>
      <Image
        style={[styles.player1Arrow, styles.arrowIcon]}
        resizeMode="contain"
        source={require('../../assets/arrow.png')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  menuScreen: {
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
  welcomeText: {
    color: 'white',
    fontSize: 42,
    textAlign: 'center',
  },
  playButton: {
    backgroundColor: 'white',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  playText: {
    fontSize: 56,
  },
  tutorialText: {
    fontSize: 16,
    color: 'lightgrey',
    position: 'absolute',
  },
  player2TutorialText: {
    top: height * 0.07,
  },
  player1TutorialText: {
    top: height * 0.906,
  },
  ballTutorialText: {
    top: height * 0.45,
    left: width * 0.06,
  },
  arrowIcon: {
    width: 22,
    height: 22,
    position: 'absolute',
  },
  player2Arrow: {
    top: height * 0.06,
    left: width * 0.66,
    transform: [{ rotate: '70deg' }],
  },
  player1Arrow: {
    top: height * 0.92,
    left: width * 0.28,
    transform: [{ rotate: '260deg' }],
  },
  ballArrow: {
    top: height * 0.485,
    left: width * 0.38,
    transform: [{ rotate: '200deg' }],
  },
});
