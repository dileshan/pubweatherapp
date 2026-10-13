import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

type SectionTitleProps = {
  title: string;
  action?: ReactNode;
};

export function SectionTitle({ title, action }: SectionTitleProps) {
  return (
    <View style={styles.sectionHeading}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {action}
    </View>
  );
}

const styles = StyleSheet.create({
  sectionHeading: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  sectionTitle: { color: '#d7edf5', fontSize: 17, fontWeight: '800' },
});
