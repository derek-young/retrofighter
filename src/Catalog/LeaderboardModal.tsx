import React, {useCallback, useEffect, useState} from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';

import {useAppContext} from 'AppContext';
import {leaderboardActions} from 'database';
import {LeaderboardEntry} from 'database/leaderboard';
import {startingEnemies} from 'Game/constants';
import Colors from 'types/colors';
import Button from 'components/Button';
import IBMText from 'components/IBMText';
import Modal from 'components/Modal';
import PressStartText from 'components/PressStartText';

import {formatScore, formatTime, getRankInsignia} from './utils';
import {rankByBestTime, rankByTotalScore} from './leaderboardUtils';

const styles = StyleSheet.create({
  panel: {
    backgroundColor: Colors.MIDNIGHT_BLUE,
    borderRadius: 8,
    padding: 16,
    width: '85%',
    maxWidth: 480,
    maxHeight: '75%',
  },
  title: {
    color: 'white',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16,
  },
  tabs: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 12,
  },
  tabButton: {
    marginHorizontal: 4,
  },
  levelsScroll: {
    flexGrow: 0,
    marginBottom: 12,
  },
  levels: {
    display: 'flex',
    flexDirection: 'row',
  },
  levelChip: {
    minWidth: 28,
    alignItems: 'center',
    borderColor: Colors.DAVY_GREY,
    borderRadius: 4,
    borderWidth: 1,
    marginRight: 8,
    paddingVertical: 2,
    paddingHorizontal: 4,
  },
  levelChipSelected: {
    borderColor: Colors.SKY_BLUE,
  },
  levelChipText: {
    color: 'white',
    fontSize: 12,
  },
  levelChipTextSelected: {
    color: Colors.SKY_BLUE,
  },
  message: {
    display: 'flex',
    alignItems: 'center',
    marginVertical: 16,
  },
  messageText: {
    color: 'white',
    marginBottom: 12,
    textAlign: 'center',
  },
  errorDetail: {
    color: Colors.GREY,
    fontSize: 12,
    marginBottom: 12,
    textAlign: 'center',
  },
  rows: {
    flexGrow: 0,
  },
  row: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  rowLeft: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1,
    marginRight: 16,
  },
  rowPosition: {
    color: 'white',
    width: 28,
  },
  insignia: {
    height: 20,
    width: 20,
    marginRight: 8,
  },
  rowName: {
    color: 'white',
    flexShrink: 1,
  },
  rowValue: {
    color: 'white',
  },
  currentUser: {
    color: Colors.GREEN,
  },
});

type Tab = 'scores' | 'times';

interface LeaderboardModalProps {
  onClose: () => void;
  open: boolean;
}

function LeaderboardModal({onClose, open}: LeaderboardModalProps) {
  const {user} = useAppContext();
  const [entries, setEntries] = useState<null | Record<
    string,
    LeaderboardEntry
  >>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<null | string>(null);
  const [tab, setTab] = useState<Tab>('scores');
  const [selectedLevel, setSelectedLevel] = useState(0);

  const load = useCallback(() => {
    setIsLoading(true);
    setError(null);
    leaderboardActions
      .getAll()
      .then(setEntries)
      .catch((e: Error) => setError(e.message ?? 'Unknown error'))
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    if (open) {
      load();
    } else {
      setEntries(null);
      setTab('scores');
      setSelectedLevel(0);
    }
  }, [load, open]);

  const rows =
    tab === 'scores'
      ? rankByTotalScore(entries)
      : rankByBestTime(entries, selectedLevel);

  let body;
  if (isLoading) {
    body = <ActivityIndicator color={Colors.SKY_BLUE} style={styles.message} />;
  } else if (error !== null) {
    body = (
      <View style={styles.message}>
        <IBMText style={styles.messageText}>
          Could not load the leaderboard.
        </IBMText>
        <IBMText style={styles.errorDetail}>{error}</IBMText>
        <Button onPress={load} variant="secondary">
          Retry
        </Button>
      </View>
    );
  } else if (rows.length === 0) {
    body = (
      <View style={styles.message}>
        <IBMText style={styles.messageText}>
          {tab === 'scores'
            ? 'No scores yet.'
            : `No times recorded for Level ${selectedLevel + 1} yet.`}
        </IBMText>
      </View>
    );
  } else {
    body = (
      <ScrollView style={styles.rows}>
        {rows.map((row, index) => {
          const isCurrentUser = row.uid === user?.uid;

          return (
            <View key={row.uid} style={styles.row}>
              <View style={styles.rowLeft}>
                <IBMText
                  style={[
                    styles.rowPosition,
                    isCurrentUser && styles.currentUser,
                  ]}>
                  {index + 1}.
                </IBMText>
                <Image
                  resizeMode="contain"
                  source={getRankInsignia(row.totalScore)}
                  style={styles.insignia}
                />
                <IBMText
                  numberOfLines={1}
                  style={[styles.rowName, isCurrentUser && styles.currentUser]}>
                  {row.displayName}
                </IBMText>
              </View>
              <IBMText
                style={[styles.rowValue, isCurrentUser && styles.currentUser]}>
                {tab === 'scores'
                  ? formatScore(row.value)
                  : formatTime(row.value)}
              </IBMText>
            </View>
          );
        })}
      </ScrollView>
    );
  }

  return (
    <Modal onClose={onClose} open={open}>
      <Pressable style={styles.panel}>
        <PressStartText style={styles.title}>LEADERBOARD</PressStartText>
        <View style={styles.tabs}>
          <Button
            onPress={() => setTab('scores')}
            style={styles.tabButton}
            variant={tab === 'scores' ? 'primary' : 'secondary'}>
            Top Scores
          </Button>
          <Button
            onPress={() => setTab('times')}
            style={styles.tabButton}
            variant={tab === 'times' ? 'primary' : 'secondary'}>
            Fastest Times
          </Button>
        </View>
        {tab === 'times' && (
          <ScrollView
            contentContainerStyle={styles.levels}
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.levelsScroll}>
            {startingEnemies.map((_, level) => (
              <Pressable
                key={level}
                onPress={() => setSelectedLevel(level)}
                style={[
                  styles.levelChip,
                  level === selectedLevel && styles.levelChipSelected,
                ]}>
                <IBMText
                  style={[
                    styles.levelChipText,
                    level === selectedLevel && styles.levelChipTextSelected,
                  ]}>
                  {level + 1}
                </IBMText>
              </Pressable>
            ))}
          </ScrollView>
        )}
        {body}
      </Pressable>
    </Modal>
  );
}

export default LeaderboardModal;
