import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import competitionService from '@/src/services/competitionService';
import { useClass } from '@/src/contexts/ClassContext';
import { useRole } from '@/src/contexts/RoleContext';
import { theme } from '@/src/config/theme';

export default function CreateCompetitionScreen() {
  const { classes, loadClasses } = useClass();
  const { currentRole } = useRole();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [target, setTarget] = useState('100');
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [scope, setScope] = useState<'global' | 'class'>('global');
  const [loading, setLoading] = useState(false);
  const [loadingClasses, setLoadingClasses] = useState(true);

  useEffect(() => {
    if (currentRole === 'teacher') {
      loadClasses().finally(() => setLoadingClasses(false));
    } else {
      setLoadingClasses(false);
    }
  }, [currentRole]);

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

      const competitionData: any = {
        title: title.trim(),
        description: description.trim(),
        type: 'individual',
        scope: scope,
        timing: {
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
        },
        goal: {
          metric: 'total_pomodoros',
          target: targetValue,
          unit: 'count',
        },
        rules: {
          allowLateJoin: true,
        },
      };

      // If class scope, add classId
      if (scope === 'class' && selectedClassId) {
        competitionData.class = selectedClassId;
      }

      const competition = await competitionService.createCompetition(competitionData);

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

  if (loadingClasses) {
    return (
      <View style={[styles.container, styles.centerContainer]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

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

        {/* Scope Selection */}
        {currentRole === 'teacher' && classes.length > 0 && (
          <>
            <Text style={styles.label}>Scope *</Text>
            <View style={styles.scopeButtons}>
              <TouchableOpacity
                style={[
                  styles.scopeButton,
                  scope === 'global' && styles.scopeButtonActive,
                ]}
                onPress={() => {
                  setScope('global');
                  setSelectedClassId('');
                }}
              >
                <Ionicons 
                  name="globe" 
                  size={20} 
                  color={scope === 'global' ? theme.colors.onPrimary : theme.colors.onSurface} 
                />
                <Text style={[
                  styles.scopeButtonText,
                  scope === 'global' && styles.scopeButtonTextActive,
                ]}>
                  Global
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.scopeButton,
                  scope === 'class' && styles.scopeButtonActive,
                ]}
                onPress={() => setScope('class')}
              >
                <Ionicons 
                  name="school" 
                  size={20} 
                  color={scope === 'class' ? theme.colors.onPrimary : theme.colors.onSurface} 
                />
                <Text style={[
                  styles.scopeButtonText,
                  scope === 'class' && styles.scopeButtonTextActive,
                ]}>
                  Class Only
                </Text>
              </TouchableOpacity>
            </View>

            {/* Class Selection (only if scope is 'class') */}
            {scope === 'class' && (
              <>
                <Text style={styles.label}>Select Class *</Text>
                <View style={styles.classCards}>
                  {classes.map((cls: any) => {
                    const classId = cls._id || cls.id;
                    const isSelected = selectedClassId === classId;
                    return (
                      <TouchableOpacity
                        key={classId}
                        style={[
                          styles.classCard,
                          isSelected && styles.classCardActive,
                        ]}
                        onPress={() => setSelectedClassId(classId)}
                      >
                        <View style={styles.classCardContent}>
                          <Ionicons 
                            name={isSelected ? "checkmark-circle" : "ellipse-outline"} 
                            size={24} 
                            color={isSelected ? theme.colors.primary : theme.colors.onSurface} 
                          />
                          <View style={styles.classCardInfo}>
                            <Text style={[
                              styles.classCardName,
                              isSelected && styles.classCardNameActive,
                            ]}>
                              {cls.name}
                            </Text>
                            {cls.studentCount > 0 && (
                              <Text style={styles.classCardMeta}>
                                {cls.studentCount} students
                              </Text>
                            )}
                          </View>
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </>
            )}
          </>
        )}

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
            Competition will start tomorrow and last for 7 days. Type: Individual, Scope: {scope === 'class' ? `Class only${selectedClassId ? ` (${classes.find((c: any) => (c._id || c.id) === selectedClassId)?.name})` : ''}` : 'Global'}
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.createButton, (loading || (scope === 'class' && !selectedClassId)) && styles.createButtonDisabled]}
          onPress={handleCreate}
          disabled={loading || (scope === 'class' && !selectedClassId)}
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
  scopeButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  scopeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: theme.colors.surface,
    borderWidth: 2,
    borderColor: theme.colors.surfaceVariant,
    borderRadius: 12,
    padding: 16,
  },
  scopeButtonActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  scopeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.onSurface,
  },
  scopeButtonTextActive: {
    color: theme.colors.onPrimary,
  },
  classCards: {
    gap: 12,
    marginBottom: 16,
  },
  classCard: {
    backgroundColor: theme.colors.surface,
    borderWidth: 2,
    borderColor: theme.colors.surfaceVariant,
    borderRadius: 12,
    padding: 16,
  },
  classCardActive: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primaryContainer,
  },
  classCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  classCardInfo: {
    flex: 1,
  },
  classCardName: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.onSurface,
    marginBottom: 2,
  },
  classCardNameActive: {
    color: theme.colors.primary,
  },
  classCardMeta: {
    fontSize: 12,
    color: theme.colors.onSurface,
    opacity: 0.7,
  },
  centerContainer: {
    justifyContent: 'center',
    alignItems: 'center',
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
