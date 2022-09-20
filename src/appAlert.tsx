import {Alert} from 'react-native';

const appAlert = (title = 'Alert Title', message = 'My Alert Msg') =>
  Alert.alert(title, message, [
    {
      text: 'Cancel',
      onPress: () => console.log('Cancel Pressed'),
      style: 'cancel',
    },
    {text: 'OK', onPress: () => console.log('OK Pressed')},
  ]);

export default appAlert;
