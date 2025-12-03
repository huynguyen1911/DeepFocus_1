import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import competitionService from '@/src/services/competitionService';
import { theme } from '@/src/config/theme';

export default function CreateCompetitionScreen() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [target, setTarget] = useState('100');
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a title');
      return;
    }

    if (!description.trim()) {
      Alert.alert('Error', 'Please enter a description');
      return;
    }

    const targetValue = parseInt(target);
    if (isNaN(targetValue) || targetValue <= 0) {
      Alert.alert('Error', 'Please enter a valid target value');
      return;
    }

    setLoading(true);
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() + 1); // Start tomorrow
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 8); // End in 7 days

      const competition = await competitionService.createCompetition({
        title: title.trim(),
        description: description.trim(),
        type: 'individual',
        scope: 'global',
        timing: {
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
        },
        goal: {
          metric: 'total_pomodoros',
          target: targetValue,
          unit: 'pomodoros',
        },
        rules: {
          allowLateJoin: true,
        },
      });

      Alert.alert('Success', 'Competition created successfully!', [
        {
          text: 'OK',
          onPress: () => router.replace(`/competitions/${competition._id}`),
        },
      ]);
    } catch (error: any) {
      console.error('Error creating competition:', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to create competition');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.label}>Title *</Text>
        <TextInput
          style={styles.input}
          value={title}
          onChangeText={setTitle}
          placeholder="Enter competition title"
          placeholderTextColor={theme.colors.onSurface + '80'}
        />

        <Text style={styles.label}>Description *</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={description}
          onChangeText={setDescription}
          placeholder="Describe your competition"
          placeholderTextColor={theme.colors.onSurface + '80'}
          multiline
          numberOfLines={4}
        />

        <Text style={styles.label}>Target (Pomodoros) *</Text>
        <TextInput
          style={styles.input}
          value={target}
          onChangeText={setTarget}
          placeholder="100"
          placeholderTextColor={theme.colors.onSurface + '80'}
          keyboardType="number-pad"
        />

        <View style={styles.infoCard}>
          <Ionicons name="information-circle" size={24} color={theme.colors.info} />
          <Text style={styles.infoText}>
            Competition will start tomorrow and last for 7 days. Type: Individual, Scope: Global
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.createButton, loading && styles.createButtonDisabled]}
          onPress={handleCreate}
          disabled={loading}
        >
          <Text style={styles.createButtonText}>
            {loading ? 'Creating...' : 'Create Competition'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    padding: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.onSurface,
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.surfaceVariant,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: theme.colors.onSurface,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surfaceVariant,
    padding: 12,
    borderRadius: 8,
    marginTop: 24,
    gap: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: theme.colors.onSurface,
    lineHeight: 20,
  },
  createButton: {
    backgroundColor: theme.colors.primary,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 32,
  },
  createButtonDisabled: {
    opacity: 0.5,
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.onPrimary,
  },
});
