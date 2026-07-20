import auth from '@react-native-firebase/auth';
import database from '@react-native-firebase/database';

export interface DbUser {
  scores?: number[];
  // Elapsed seconds of the run that set each level's high score, so scores
  // can be recomputed if the time-bonus formula changes.
  levelTimes?: number[];
  // Fastest completion in seconds per level, regardless of score; 0 = no
  // recorded time.
  bestTimes?: number[];
}

class User {
  // Resolve the uid from Firebase's authoritative current user at call time.
  // A cached value populated by a separate onAuthStateChanged listener can be
  // stale/null depending on listener ordering, sending reads/writes to
  // /users/null — which the security rules reject.
  private ref() {
    return database().ref(`/users/${auth().currentUser?.uid}`);
  }

  get() {
    return this.ref()
      .once('value')
      .then(snapshot => snapshot.val());
  }

  set(nextValue: Partial<DbUser>) {
    return this.ref().set(nextValue);
  }

  on(callback: (user: DbUser) => void) {
    return this.ref().on('value', snapshot => callback(snapshot.val()));
  }

  off(callback: any) {
    return this.ref().off('value', callback);
  }
}

const user = new User();

export default user;
