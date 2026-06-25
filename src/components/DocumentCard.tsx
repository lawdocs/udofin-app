import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { FileText, CheckCircle2, Download, Eye } from 'lucide-react-native';

interface DocumentCardProps {
  title: string;
  fileName: string;
  verified?: boolean;
  onDownload: () => void;
  onPreview: () => void;
}

export default function DocumentCard({
  title,
  fileName,
  verified = true,
  onDownload,
  onPreview,
}: DocumentCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.leftCol}>
        <View style={styles.fileIcon}>
          <FileText color="#E47656" size={24} />
        </View>
        <View style={styles.textContainer}>
          <View style={styles.titleRow}>
            <Text style={styles.title}>{title}</Text>
            {verified && (
              <View style={styles.verifiedBadge}>
                <CheckCircle2 color="#059669" size={12} strokeWidth={2.5} />
                <Text style={styles.verifiedText}>Verified</Text>
              </View>
            )}
          </View>
          <Text style={styles.fileName} numberOfLines={1}>
            {fileName}
          </Text>
        </View>
      </View>

      <View style={styles.actionCol}>
        <TouchableOpacity style={styles.iconBtn} onPress={onPreview} activeOpacity={0.7}>
          <Eye color="#6B7280" size={20} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconBtn} onPress={onDownload} activeOpacity={0.7}>
          <Download color="#E47656" size={20} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EAEAEA',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  leftCol: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  fileIcon: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: '#FFF5F2',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 2,
  },
  title: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1F2937',
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  verifiedText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#059669',
  },
  fileName: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  actionCol: {
    flexDirection: 'row',
    gap: 8,
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
