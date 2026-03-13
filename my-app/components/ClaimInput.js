import React from 'react';
import { StyleSheet, View, TextInput } from 'react-native';
import { Text } from 'react-native-paper';

/**
 * ClaimInput - A styled text input component for entering claim text.
 */
export default function ClaimInput({ value, onChangeText, editable = true }) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>Claim to Verify</Text>
      <TextInput
        style={[styles.input, !editable && styles.disabledInput]}
        multiline
        numberOfLines={5}
        placeholder="Enter a news claim, government scheme, or election information to verify."
        placeholderTextColor="#9CA3AF"
        value={value}
        onChangeText={onChangeText}
        editable={editable}
        textAlignVertical="top"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
    letterSpacing: 0.3,
  },
  input: {
    borderWidth: 1.5,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    padding: 16,
    fontSize: 15,
    color: '#111827',
    backgroundColor: '#F9FAFB',
    minHeight: 130,
    lineHeight: 22,
  },
  disabledInput: {
    backgroundColor: '#E5E7EB',
    color: '#6B7280',
  },
});
