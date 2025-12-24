import React, { useEffect } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import {
  Text,
  FAB,
  useTheme,
  ActivityIndicator,
  Surface,
} from "react-native-paper";
import { router } from "expo-router";
import { useClass } from "../contexts/ClassContext";
import { useRole } from "../contexts/RoleContext";
import { useLanguage } from "../contexts/LanguageContext";
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

// Màu sắc cho class avatars
const CLASS_COLORS = [
  ['#667eea', '#764ba2'], // Purple
  ['#f093fb', '#f5576c'], // Pink
  ['#4facfe', '#00f2fe'], // Blue
  ['#43e97b', '#38f9d7'], // Green
  ['#fa709a', '#fee140'], // Orange
  ['#30cfd0', '#330867'], // Teal
  ['#a8edea', '#fed6e3'], // Pastel
  ['#ff9a9e', '#fecfef'], // Rose
];

export default function ClassListScreen() {
  const theme = useTheme();
  const { t } = useLanguage();
  const { currentRole } = useRole();
  const { classes, loading, loadClasses } = useClass();
  const [refreshing, setRefreshing] = React.useState(false);

  useEffect(() => {
    loadClasses();
  }, [currentRole]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadClasses();
    setRefreshing(false);
  };

  const handleFABPress = () => {
    if (currentRole === "teacher") {
      router.push("/classes/create");
    } else if (currentRole === "student") {
      router.push("/classes/join");
    }
  };

  const handleClassPress = (classId: string) => {
    router.push(`/classes/${classId}`);
  };

  const getMemberStatus = (members: any[]) => {
    const approved = members?.filter((m) => m.status === "active").length || 0;
    const pending = members?.filter((m) => m.status === "pending").length || 0;
    return { approved, pending };
  };

  // Hàm capitalize - viết hoa chữ cái đầu mỗi từ
  const capitalizeText = (text: string) => {
    return text
      .split(' ')
      .map(word => {
        if (word.length === 0) return word;
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
      })
      .join(' ');
  };

  // Hàm lọc description thông minh - bỏ phần lặp lại với tên lớp
  const getSmartDescription = (className: string, description: string) => {
    if (!description) return '';
    
    // Bỏ từ "Lớp" ở đầu className để so sánh
    let cleanClassName = className.trim().toLowerCase();
    if (cleanClassName.startsWith('lớp ')) {
      cleanClassName = cleanClassName.substring(4).trim();
    }
    
    // Bỏ từ "Lớp" ở đầu description nếu có
    let cleanDescription = description.trim();
    if (cleanDescription.toLowerCase().startsWith('lớp ')) {
      cleanDescription = cleanDescription.substring(4).trim();
    }
    
    // Lấy phần đầu của description để so sánh (2-3 từ đầu)
    const descWords = cleanDescription.split(' ');
    const classWords = cleanClassName.split(' ');
    
    // Nếu 2-3 từ đầu của description trùng với className, bỏ phần đó
    let skipWords = 0;
    for (let i = 0; i < Math.min(descWords.length, classWords.length, 3); i++) {
      if (descWords[i].toLowerCase() === classWords[i].toLowerCase()) {
        skipWords = i + 1;
      } else {
        break;
      }
    }
    
    // Nếu có từ trùng, bỏ phần đầu
    if (skipWords > 0) {
      cleanDescription = descWords.slice(skipWords).join(' ');
    }
    
    // Viết hoa chữ cái đầu
    return capitalizeText(cleanDescription);
  };

  // Lấy chữ cái đầu cho avatar - bỏ từ "Lớp" để tạo initials có ý nghĩa
  const getClassInitials = (name: string) => {
    // Bỏ từ "Lớp" nếu có ở đầu
    let cleanName = name.trim();
    if (cleanName.toLowerCase().startsWith('lớp ')) {
      cleanName = cleanName.substring(4).trim();
    }
    
    // Lấy các từ còn lại
    const words = cleanName.split(' ').filter(word => word.length > 0);
    
    if (words.length >= 2) {
      // Nếu có 2 từ trở lên, lấy chữ cái đầu của 2 từ đầu
      return (words[0][0] + words[1][0]).toUpperCase();
    } else if (words.length === 1 && words[0].length >= 2) {
      // Nếu chỉ có 1 từ, lấy 2 chữ cái đầu
      return words[0].substring(0, 2).toUpperCase();
    }
    
    // Fallback: lấy 2 ký tự đầu của tên gốc
    return cleanName.substring(0, 2).toUpperCase();
  };

  // Chọn màu dựa trên tên class - sử dụng hash để đảm bảo màu đa dạng
  const getClassColor = (name: string, index: number) => {
    // Kết hợp hash của tên và index để tạo màu đa dạng hơn
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    hash = Math.abs(hash + index);
    const colorIndex = hash % CLASS_COLORS.length;
    return CLASS_COLORS[colorIndex];
  };

  if (loading && classes.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Large Title Header */}
      <View style={styles.header}>
        <Text variant="displaySmall" style={styles.headerTitle}>
          Lớp Học
        </Text>
        <Text variant="bodyMedium" style={styles.headerSubtitle}>
          {classes.length > 0 
            ? `${classes.length} lớp đang tham gia` 
            : 'Bắt đầu hành trình học tập'}
        </Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[theme.colors.primary]}
          />
        }
      >
        {classes.length === 0 ? (
          <View style={styles.emptyContainer}>
            {/* Empty State Illustration */}
            <View style={styles.emptyIllustration}>
              <MaterialCommunityIcons 
                name="school-outline" 
                size={120} 
                color="#E8E8E8" 
              />
            </View>
            <Text variant="headlineSmall" style={styles.emptyTitle}>
              Bạn chưa tham gia lớp nào
            </Text>
            <Text variant="bodyMedium" style={styles.emptyDescription}>
              {currentRole === 'teacher' 
                ? 'Tạo lớp học đầu tiên để bắt đầu dạy!' 
                : 'Tham gia lớp học để bắt đầu học tập!'}
            </Text>
          </View>
        ) : (
          <View style={styles.listContainer}>
            {classes.map((classItem: any, index: number) => {
              const { approved, pending } = getMemberStatus(classItem.members);
              const isTeacher = currentRole === "teacher";
              const initials = getClassInitials(classItem.name);
              const colors = getClassColor(classItem.name, index);
              
              // Chuẩn hóa tên lớp - viết hoa chữ cái đầu
              const displayName = capitalizeText(classItem.name);
              
              // Lọc mô tả thông minh - bỏ phần lặp
              const smartDescription = classItem.description 
                ? getSmartDescription(classItem.name, classItem.description)
                : '';

              return (
                <TouchableOpacity
                  key={classItem._id}
                  activeOpacity={0.7}
                  onPress={() => handleClassPress(classItem._id)}
                >
                  <Surface style={styles.classCard} elevation={1}>
                    <View style={styles.cardRow}>
                      {/* Class Avatar */}
                      <LinearGradient
                        colors={colors}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.classAvatar}
                      >
                        <Text variant="titleMedium" style={styles.avatarText}>
                          {initials}
                        </Text>
                      </LinearGradient>

                      {/* Class Info */}
                      <View style={styles.classInfo}>
                        <Text variant="titleMedium" style={styles.className}>
                          {displayName}
                        </Text>
                        <View style={styles.metaRow}>
                          {smartDescription ? (
                            <>
                              <Text variant="bodySmall" style={styles.metaText}>
                                {smartDescription}
                              </Text>
                              <Text variant="bodySmall" style={styles.metaDivider}>
                                •
                              </Text>
                            </>
                          ) : null}
                          <MaterialCommunityIcons 
                            name="account-group" 
                            size={14} 
                            color="#757575" 
                            style={{ marginRight: 4 }}
                          />
                          <Text variant="bodySmall" style={styles.metaText}>
                            {approved} {approved === 1 ? 'thành viên' : 'thành viên'}
                          </Text>
                        </View>

                        {/* Teacher Badge or Pending Indicator */}
                        {isTeacher && pending > 0 && (
                          <View style={styles.pendingBadge}>
                            <MaterialCommunityIcons 
                              name="clock-outline" 
                              size={14} 
                              color="#FF9800" 
                            />
                            <Text variant="labelSmall" style={styles.pendingText}>
                              {pending} yêu cầu chờ duyệt
                            </Text>
                          </View>
                        )}
                      </View>

                      {/* Arrow Icon */}
                      <MaterialCommunityIcons 
                        name="chevron-right" 
                        size={24} 
                        color="#BDBDBD" 
                      />
                    </View>

                    {/* Status Indicator */}
                    <View style={styles.statusIndicator}>
                      <View style={[
                        styles.statusDot,
                        { backgroundColor: '#4CAF50' }
                      ]} />
                      <Text variant="labelSmall" style={styles.statusText}>
                        Đang diễn ra
                      </Text>
                    </View>
                  </Surface>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </ScrollView>

      {/* Gradient FAB Button */}
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={handleFABPress}
        style={styles.fabContainer}
      >
        <LinearGradient
          colors={['#667eea', '#764ba2']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.fabGradient}
        >
          <MaterialCommunityIcons 
            name="plus" 
            size={28} 
            color="#FFFFFF" 
          />
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: '#FFFFFF',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#FFFFFF',
  },
  headerTitle: {
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 4,
  },
  headerSubtitle: {
    color: '#757575',
    fontSize: 15,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
    paddingTop: 80,
  },
  emptyIllustration: {
    marginBottom: 24,
    opacity: 0.6,
  },
  emptyTitle: {
    marginBottom: 12,
    textAlign: "center",
    fontWeight: '600',
    color: '#212121',
  },
  emptyDescription: {
    textAlign: "center",
    color: '#757575',
    lineHeight: 22,
  },
  classCard: {
    marginBottom: 12,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    padding: 16,
    overflow: 'hidden',
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  classAvatar: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  avatarText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 20,
  },
  classInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  className: {
    fontWeight: '600',
    color: '#212121',
    marginBottom: 4,
    fontSize: 17,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  metaText: {
    color: '#757575',
    fontSize: 13,
  },
  metaDivider: {
    color: '#BDBDBD',
    marginHorizontal: 6,
    fontSize: 13,
  },
  pendingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    paddingVertical: 4,
    paddingHorizontal: 8,
    backgroundColor: '#FFF3E0',
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  pendingText: {
    color: '#FF9800',
    marginLeft: 4,
    fontWeight: '500',
  },
  statusIndicator: {
    position: 'absolute',
    top: 12,
    right: 40,
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    color: '#4CAF50',
    fontWeight: '500',
    fontSize: 11,
  },
  fabContainer: {
    position: 'absolute',
    right: 20,
    bottom: 24,
    borderRadius: 28,
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  fabGradient: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
