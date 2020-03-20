import React from 'react';
import { View, Text } from 'react-native';

interface Props {
  color: string;
  x: number;
  y: number;
  text: string;
  player1: boolean;
}

export class Score extends React.Component<Props> {
  render() {
    return (
      <View
        style={{
          position: 'absolute',
          left: this.props.x,
          top: this.props.y,
        }}>
        <Text
          style={[
            { color: 'white', fontSize: 24, fontWeight: 'bold' },
            !this.props.player1 && { transform: [{ rotate: '180deg' }] },
          ]}>
          {this.props.text}
        </Text>
      </View>
    );
  }
}
