/**
 * Focus Tips - Mẹo tập trung hiển thị trong lúc chờ AI generate plan
 */

export const FOCUS_TIPS = [
  {
    id: 1,
    icon: '💧',
    text: 'Uống đủ nước giúp tăng khả năng tập trung lên 20%'
  },
  {
    id: 2,
    icon: '🌱',
    text: 'Nghỉ 5 phút sau mỗi 25 phút làm việc tăng hiệu suất gấp đôi'
  },
  {
    id: 3,
    icon: '🎧',
    text: 'Nhạc không lời (Lo-fi, Classical) giúp não tập trung tốt hơn'
  },
  {
    id: 4,
    icon: '📱',
    text: 'Tắt thông báo trong giờ tập trung giảm mất tập trung 73%'
  },
  {
    id: 5,
    icon: '🌿',
    text: 'Cây xanh trên bàn làm việc cải thiện sự tập trung 15%'
  },
  {
    id: 6,
    icon: '☀️',
    text: 'Ánh sáng tự nhiên giúp duy trì năng lượng suốt cả ngày'
  },
  {
    id: 7,
    icon: '🧘',
    text: 'Hít thở sâu 3 lần trước khi bắt đầu giúp làm trống đầu óc'
  },
  {
    id: 8,
    icon: '📝',
    text: 'Viết ra mục tiêu trước khi làm tăng khả năng hoàn thành 42%'
  },
  {
    id: 9,
    icon: '🎯',
    text: 'Làm công việc quan trọng nhất vào buổi sáng khi não tỉnh táo nhất'
  },
  {
    id: 10,
    icon: '🔕',
    text: 'Chế độ "Không làm phiền" trên điện thoại tăng năng suất 35%'
  },
  {
    id: 11,
    icon: '🍎',
    text: 'Ăn nhẹ lành mạnh (hạt, trái cây) duy trì năng lượng ổn định'
  },
  {
    id: 12,
    icon: '🚶',
    text: 'Đi bộ 10 phút giữa các phiên làm việc làm tươi mới đầu óc'
  },
  {
    id: 13,
    icon: '🎨',
    text: 'Dọn dẹp bàn làm việc gọn gàng giúp tâm trí tập trung hơn'
  },
  {
    id: 14,
    icon: '⏰',
    text: 'Thiết lập deadline cụ thể giúp não hoạt động hiệu quả hơn'
  },
  {
    id: 15,
    icon: '🌙',
    text: 'Ngủ đủ 7-8 tiếng mỗi đêm cải thiện trí nhớ và tập trung'
  }
];

export const getRandomTip = () => {
  return FOCUS_TIPS[Math.floor(Math.random() * FOCUS_TIPS.length)];
};

export const getTipSequence = (count: number = 5) => {
  const shuffled = [...FOCUS_TIPS].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
};
