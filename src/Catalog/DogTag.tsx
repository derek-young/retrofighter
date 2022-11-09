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
    borderBottomWidth: 4,
    borderColor: `${Colors.PURPLE}90`,
    marginBottom: 16,
    width: '100%',
  },
  gradiant: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 56,
    paddingHorizontal: 16,
  },
  left: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
  imageContainer: {
    display: 'flex',
    justifyContent: 'center',
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
    <View style={styles.container}>
      <LinearGradient
        colors={[Colors.GREY, 'white', Colors.GREY]}
        style={styles.gradiant}>
        <View style={styles.left}>
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
        </View>
        <View style={styles.left}>
          <IBMText>
            High score:&nbsp;
            {totalScore.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
          </IBMText>
        </View>
      </LinearGradient>
    </View>
  );
};

export default DogTag;
