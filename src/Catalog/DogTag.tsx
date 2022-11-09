import React from 'react';
import {Image, StyleSheet, View} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

import {useAppContext} from 'AppContext';
import {useGameContext} from 'Game/GameContext';
import Colors from 'types/colors';
import IBMText from 'components/IBMText';

import {getDisplayName, getRank, getRankInsignia} from './utils';

const styles = StyleSheet.create({
  container: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    height: 56,
    width: '100%',
    padding: 8,
    marginBottom: 16,
  },
  imageContainer: {
    display: 'flex',
    justifyContent: 'center',
    marginLeft: 8,
    marginRight: 12,
  },
  image: {
    height: '100%',
    width: 24,
  },
  text: {
    textTransform: 'uppercase',
  },
  name: {
    fontSize: 16,
  },
});

const DogTag = () => {
  const {user} = useAppContext();
  const {totalScore} = useGameContext();

  return (
    <LinearGradient
      colors={[Colors.GREY, 'white', Colors.GREY]}
      style={styles.container}>
      <View style={styles.imageContainer}>
        <Image
          resizeMode="contain"
          source={getRankInsignia(totalScore)}
          style={styles.image}
        />
      </View>
      <View>
        <IBMText style={[styles.name, styles.text]}>
          {getDisplayName(user)}
        </IBMText>
        <IBMText style={styles.text}>{getRank(totalScore)}</IBMText>
      </View>
    </LinearGradient>
  );
};

export default DogTag;
