import auth from '@react-native-firebase/auth';
import database from '@react-native-firebase/database';

interface DbUser {
  scores?: number[];
}

class User {
  constructor() {
    auth().onAuthStateChanged(user => {
      this.userId = user?.uid ?? null;
    });
  }

  userId: null | string = null;

  get() {
    return database()
      .ref(`/users/${this.userId}`)
      .once('value')
      .then(snapshot => snapshot.val());
  }

  set(nextValue: Partial<DbUser>) {
    return database()
      .ref(`/users/${this.userId}`)
      .set(nextValue)
      .then(updatedValue => console.log('Data set.', updatedValue));
  }

  on(callback: (user: DbUser) => void) {
    return database()
      .ref(`/users/${this.userId}`)
      .on('value', snapshot => callback(snapshot.val()));
  }

  off(callback: any) {
    return database().ref(`/users/${this.userId}`).off('value', callback);
  }
}

const user = new User();

export default user;
