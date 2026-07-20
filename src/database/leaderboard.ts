import auth from '@react-native-firebase/auth';
import database from '@react-native-firebase/database';

export interface LeaderboardEntry {
  displayName: string;
  totalScore: number;
  // Fastest completion in seconds per level; 0 = no recorded time. Firebase
  // may return sparse arrays as keyed objects — normalize at the consumer.
  bestTimes?: number[];
}

class Leaderboard {
  // See User.ref(): resolve the uid at call time so writes never land on
  // /leaderboard/null when a cached listener value hasn't caught up.
  private entryRef() {
    return database().ref(`/leaderboard/${auth().currentUser?.uid}`);
  }

  getAll(): Promise<null | Record<string, LeaderboardEntry>> {
    return database()
      .ref('/leaderboard')
      .once('value')
      .then(snapshot => snapshot.val());
  }

  set(entry: LeaderboardEntry) {
    return this.entryRef().set(entry);
  }

  remove() {
    return this.entryRef().remove();
  }
}

const leaderboard = new Leaderboard();

export default leaderboard;
