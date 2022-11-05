import React from 'react';
import {Pressable, StyleSheet} from 'react-native';
import {useNavigation} from '@react-navigation/native';

import {GameNavigationProp} from 'types/app';
import Colors from 'types/colors';
import IBMText from 'components/IBMText';

const styles = StyleSheet.create({
  pauseMenu: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    backgroundColor: '#00000040',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  },
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
  onClose: () => void;
  onReset: () => void;
  open: boolean;
}

const PauseMenu = ({
  onClose,
  onReset,
  open,
}: PauseMenuProps): null | JSX.Element => {
  const navigation = useNavigation<GameNavigationProp>();

  if (!open) {
    return null;
  }

  return (
    <Pressable onPress={onClose} style={styles.pauseMenu}>
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
    </Pressable>
  );
};

export default PauseMenu;
