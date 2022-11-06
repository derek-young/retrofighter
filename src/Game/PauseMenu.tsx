import React from 'react';
import {Pressable, StyleSheet} from 'react-native';
import {useNavigation} from '@react-navigation/native';

import {GameNavigationProp} from 'types/app';
import Colors from 'types/colors';
import IBMText from 'components/IBMText';
import Modal from 'components/Modal';
import {useGameContext} from './GameContext';

const styles = StyleSheet.create({
  menuItems: {
    minWidth: 160,
    padding: 16,
    borderRadius: 8,
    backgroundColor: 'black',
  },
  menuItem: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomColor: 'white',
    height: 32,
  },
  menuText: {
    color: Colors.SKY_BLUE,
  },
});

interface PauseMenuProps {
  onReset: () => void;
}

const PauseMenu = ({onReset}: PauseMenuProps): null | JSX.Element => {
  const navigation = useNavigation<GameNavigationProp>();
  const {isPaused, setIsPaused} = useGameContext();
  const onClose = () => setIsPaused(false);

  return (
    <Modal onClose={onClose} open={isPaused}>
      <Pressable style={styles.menuItems}>
        <Pressable
          onPress={() => {
            onReset();
            onClose();
          }}
          style={({pressed}) => [
            {opacity: pressed ? 0.3 : 1},
            styles.menuItem,
          ]}>
          <IBMText style={styles.menuText}>Restart Level</IBMText>
        </Pressable>
        <Pressable
          onPress={() => {
            navigation.navigate('Catalog');
            onReset();
            onClose();
          }}
          style={({pressed}) => [
            {opacity: pressed ? 0.3 : 1},
            styles.menuItem,
          ]}>
          <IBMText style={styles.menuText}>Exit Level</IBMText>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

export default PauseMenu;
