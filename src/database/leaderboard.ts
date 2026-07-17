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
  constructor() {
    auth().onAuthStateChanged(user => {
      this.userId = user?.uid ?? null;
    });
  }

  userId: null | string = null;

  getAll(): Promise<null | Record<string, LeaderboardEntry>> {
    return database()
      .ref('/leaderboard')
      .once('value')
      .then(snapshot => snapshot.val());
  }

  set(entry: LeaderboardEntry) {
    return database().ref(`/leaderboard/${this.userId}`).set(entry);
  }

  remove() {
    return database().ref(`/leaderboard/${this.userId}`).remove();
  }
}

const leaderboard = new Leaderboard();

export default leaderboard;
