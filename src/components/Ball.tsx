import React from 'react';
import { View } from 'react-native';

interface Props {
  color: string;
  size: number;
  body: any;
}

export class Ball extends React.Component<Props> {
  render() {
    const width = this.props.size;
    const height = this.props.size;
    const x = this.props.body.position.x - width / 2;
    const y = this.props.body.position.y - height / 2;

    return (
      <View
        style={{
          position: 'absolute',
          left: x,
          top: y,
          width: width,
          height: height,
          backgroundColor: this.props.color || 'white',
          borderRadius: this.props.size / 2,
        }}
      />
    );
  }
}
