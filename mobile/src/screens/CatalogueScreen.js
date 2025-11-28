import React, { useState } from 'react';
import { View, TextInput, Text, StyleSheet, ScrollView } from 'react-native';
import Button from '../components/Button';
import Card from '../components/Card';
import { Body, Heading } from '../components/Typography';
import { colors, radius, spacing } from '../styles/theme';
import { patronAPI } from '../services/api';

const CatalogueScreen = () => {
  const [query, setQuery] = useState('');
  const [books, setBooks] = useState([]);
  const [mode, setMode] = useState('semantic');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const search = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setError('');
    try {
      const res = await patronAPI.semanticSearch(query.trim(), 6);
      setBooks(res.data?.books || res.data || []);
    } catch (err) {
      console.error('Search failed', err);
      setError('Could not fetch books. Please try again.');
      setBooks([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: spacing.lg }}>
      <Heading style={{ marginBottom: spacing.sm }}>Catalogue</Heading>
      <Body style={{ marginBottom: spacing.lg }}>Natural language search powered by semantic mode.</Body>

      <View style={styles.searchRow}>
        <TextInput
          style={styles.input}
          placeholder="e.g., Books about friendship for 8-year-olds"
          value={query}
          onChangeText={setQuery}
        />
        <Button title={loading ? 'Searching…' : 'Search'} onPress={search} loading={loading} />
      </View>

      {error ? <Text style={{ color: colors.danger, marginBottom: spacing.md }}>{error}</Text> : null}

      {books.map((book) => (
        <Card key={book.book_id}>
          <Text style={styles.title}>{book.title}</Text>
          {book.authors && book.authors.length > 0 && (
            <Body style={{ color: colors.muted }}>by {book.authors.join(', ')}</Body>
          )}
          <Body style={{ marginTop: spacing.xs }}>Collection: {book.collection_name || 'General'}</Body>
        </Card>
      ))}

      {!loading && books.length === 0 && (
        <Body style={{ marginTop: spacing.lg }}>Try a natural language query to get started.</Body>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  searchRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  input: {
    flex: 1,
    backgroundColor: '#f1f5f9',
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs,
  },
});

export default CatalogueScreen;
