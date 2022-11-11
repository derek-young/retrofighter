import React, {useEffect, useState} from 'react';
import {Image, StyleSheet, View} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import database from '@react-native-firebase/database';

import {useAppContext} from 'AppContext';
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
  right: {
    display: 'flex',
    // flexDirection: 'row',
    alignItems: 'flex-end',
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
  const [highScore, setHighScore] = useState(0);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[Colors.GREY, 'white', Colors.GREY]}
        style={styles.gradiant}>
        <View style={styles.left}>
          <View style={styles.imageContainer}>
            <Image
              resizeMode="contain"
              source={getRankInsignia(highScore)}
              style={styles.image}
            />
          </View>
          <View>
            <IBMText style={[styles.name, styles.text]}>
              {getDisplayName(user)}
            </IBMText>
            <IBMText style={styles.text}>{getRank(highScore)}</IBMText>
          </View>
        </View>
        <View style={styles.right}>
          <IBMText>High Score</IBMText>
          <IBMText>
            {highScore.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
          </IBMText>
        </View>
      </LinearGradient>
    </View>
  );
};

export default DogTag;
