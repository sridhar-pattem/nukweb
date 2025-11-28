import React, { useEffect, useState } from 'react';
import { View, ScrollView, Text, StyleSheet } from 'react-native';
import { patronAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Card from '../components/Card';
import Button from '../components/Button';
import { Heading, Subheading, Body } from '../components/Typography';
import { colors, spacing } from '../styles/theme';

const DashboardScreen = ({ navigation }) => {
  const { logout } = useAuth();
  const [borrowings, setBorrowings] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [borrowingRes, recRes] = await Promise.all([
          patronAPI.getBorrowings('active'),
          patronAPI.getRecommendations(),
        ]);
        setBorrowings(borrowingRes.data || []);
        setRecommendations(recRes.data || []);
      } catch (err) {
        console.error('Error fetching library data', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: spacing.lg }}>
      <View style={styles.headerRow}>
        <View>
          <Heading>My Library</Heading>
          <Subheading>Track borrowing and discover new reads</Subheading>
        </View>
        <Button title="Logout" variant="ghost" onPress={logout} />
      </View>

      <View style={styles.cardsRow}>
        <Card style={styles.statCard}>
          <Text style={styles.statNumber}>{borrowings.length}</Text>
          <Body>Active Borrowings</Body>
        </Card>
        <Card style={styles.statCard}>
          <Text style={styles.statNumber}>{recommendations.length}</Text>
          <Body>Recommendations</Body>
        </Card>
      </View>

      <Heading style={{ marginBottom: spacing.sm }}>Currently Borrowed</Heading>
      {loading && <Body>Loading...</Body>}
      {!loading && borrowings.length === 0 && <Body>No active borrowings yet.</Body>}
      {!loading && borrowings.map((b) => (
        <Card key={b.borrowing_id}>
          <Text style={styles.bookTitle}>{b.title}</Text>
          {b.contributors && b.contributors.length > 0 && (
            <Body style={{ color: colors.muted }}>
              by {b.contributors.map((c) => c.name).join(', ')}
            </Body>
          )}
          <Body style={{ marginTop: spacing.sm }}>Due: {new Date(b.due_date).toLocaleDateString()}</Body>
        </Card>
      ))}

      <Heading style={{ marginVertical: spacing.sm }}>Recommended for You</Heading>
      {!loading && recommendations.length === 0 && <Body>We will show suggestions as you borrow books.</Body>}
      {!loading && recommendations.map((r) => (
        <Card key={r.book_id}>
          <Text style={styles.bookTitle}>{r.title}</Text>
          {r.contributors && r.contributors.length > 0 && (
            <Body style={{ color: colors.muted }}>
              by {r.contributors.map((c) => c.name).join(', ')}
            </Body>
          )}
          <Body style={{ marginTop: spacing.xs }}>Collection: {r.collection_name || 'General'}</Body>
        </Card>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  cardsRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.text,
  },
  bookTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs,
  },
});

export default DashboardScreen;
