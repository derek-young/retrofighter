import React, {useState} from 'react';
import {
  Image,
  Pressable,
  StyleSheet,
  View,
  useWindowDimensions,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

import {useAppContext} from 'AppContext';
import Colors from 'types/colors';
import Button from 'components/Button';
import IBMText from 'components/IBMText';

import {getDisplayName, getRank, getRankInsignia} from './utils';

const topHeight = 56;
const bottomHeight = 102;
const expandedHeight = topHeight + bottomHeight;

const styles = StyleSheet.create({
  borderContainer: {
    borderBottomWidth: 4,
    borderColor: `${Colors.PURPLE}90`,
    marginBottom: 16,
    width: '100%',
  },
  pressable: {
    overflow: 'hidden',
  },
  top: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: topHeight,
  },
  bottom: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: bottomHeight,
  },
  left: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
  right: {
    display: 'flex',
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
  button: {
    marginHorizontal: 8,
  },
  deleteButton: {
    backgroundColor: Colors.RED,
    color: Colors.DAVY_GREY,
  },
});

const DogTag = () => {
  const {onDeleteAcct, onSignOut, user, totalScore} = useAppContext();
  const [isExpanded, setIsExpanded] = useState(false);
  const {height, width} = useWindowDimensions();
  const isPortrait = height > width;

  return (
    <View style={styles.borderContainer}>
      <Pressable
        onPress={() => {
          if (user?.uid) {
            setIsExpanded(ex => !ex);
          }
        }}
        style={[
          styles.pressable,
          {height: isExpanded ? expandedHeight : topHeight},
        ]}>
        <LinearGradient colors={[Colors.GREY, 'white', Colors.GREY]}>
          <View style={[styles.top, {paddingHorizontal: isPortrait ? 16 : 40}]}>
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
            <View style={styles.right}>
              <IBMText>High Score</IBMText>
              <IBMText>
                {totalScore.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              </IBMText>
            </View>
          </View>
          {user?.uid ? (
            <View style={styles.bottom}>
              <Button onPress={onSignOut} style={styles.button}>
                Sign Out
              </Button>
              <Button
                onPress={onDeleteAcct}
                style={[styles.button, styles.deleteButton]}>
                Delete Acct
              </Button>
            </View>
          ) : null}
        </LinearGradient>
      </Pressable>
    </View>
  );
};

export default DogTag;
