import React from 'react';
import { Text, TouchableOpacity } from 'react-native';

interface Props {
  x: number;
  y: number;
  onPress: () => void;
}

export class ResetText extends React.Component<Props> {
  render() {
    return (
      <TouchableOpacity
        style={{
          position: 'absolute',
          left: this.props.x,
          top: this.props.y,
        }}
        onPress={() => this.props.onPress()}>
        <Text
          style={[
            {
              color: 'white',
              fontSize: 24,
              fontWeight: 'bold',
              textAlign: 'center',
            },
          ]}>
          Reset
        </Text>
      </TouchableOpacity>
    );
  }
}
