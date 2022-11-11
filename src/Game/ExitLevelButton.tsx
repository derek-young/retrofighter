import React from 'react';
import {useNavigation} from '@react-navigation/native';
import {StyleSheet} from 'react-native';

import {GameNavigationProp} from 'types/app';
import Button from 'components/Button';

const styles = StyleSheet.create({
  button: {
    marginHorizontal: 8,
  },
});

const ExitLevelButton = () => {
  const navigation = useNavigation<GameNavigationProp>();

  return (
    <Button
      onPress={() => navigation.navigate('Catalog')}
      style={styles.button}
      variant="secondary">
      Exit Level
    </Button>
  );
};

export default ExitLevelButton;
