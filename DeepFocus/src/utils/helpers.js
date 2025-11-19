/**
 * Format seconds to MM:SS format
 * @param {number} seconds - Time in seconds
 * @returns {string} Formatted time string
 */
export const formatTime = (seconds) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes.toString().padStart(2, "0")}:${remainingSeconds
    .toString()
    .padStart(2, "0")}`;
};

/**
 * Format work time in hours and minutes
 * @param {number} seconds - Time in seconds
 * @param {string} language - Language code ('vi' or 'en')
 * @returns {string} Formatted work time (e.g., "2 giờ 30 phút" or "2 hours 30 minutes")
 */
export const formatWorkTime = (seconds, language = "vi") => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (language === "vi") {
    if (hours > 0) {
      return `${hours} giờ ${minutes} phút`;
    }
    return `${minutes} phút`;
  } else {
    // English
    if (hours > 0) {
      return `${hours} ${hours === 1 ? "hour" : "hours"} ${minutes} ${
        minutes === 1 ? "minute" : "minutes"
      }`;
    }
    return `${minutes} ${minutes === 1 ? "minute" : "minutes"}`;
  }
};

/**
 * Format date to readable string with locale support
 * @param {Date|string} dateInput - Date object or date string
 * @param {string} language - Language code ('vi' or 'en')
 * @returns {string} Formatted date string
 */
export const formatDate = (dateInput, language = "vi") => {
  const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput;

  if (!(date instanceof Date) || isNaN(date)) {
    return "";
  }

  const options = {
    year: "numeric",
    month: "long",
    day: "numeric",
  };

  const locale = language === "vi" ? "vi-VN" : "en-US";
  return date.toLocaleDateString(locale, options);
};

/**
 * Format date to short format (e.g., "17/11/2025" or "11/17/2025")
 * @param {Date|string} dateInput - Date object or date string
 * @param {string} language - Language code ('vi' or 'en')
 * @returns {string} Short formatted date
 */
export const formatDateShort = (dateInput, language = "vi") => {
  const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput;

  if (!(date instanceof Date) || isNaN(date)) {
    return "";
  }

  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const year = date.getFullYear();

  // Vietnamese format: DD/MM/YYYY, English format: MM/DD/YYYY
  return language === "vi"
    ? `${day}/${month}/${year}`
    : `${month}/${day}/${year}`;
};

/**
 * Get relative time description (e.g., "Hôm nay", "Hôm qua", "Tomorrow")
 * @param {Date|string} dateInput - Date object or date string
 * @param {string} language - Language code ('vi' or 'en')
 * @returns {string} Relative time description
 */
export const getRelativeTime = (dateInput, language = "vi") => {
  const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput;

  if (!(date instanceof Date) || isNaN(date)) {
    return "";
  }

  const now = new Date();
  const diffInDays = Math.floor(
    (now.setHours(0, 0, 0, 0) - date.setHours(0, 0, 0, 0)) /
      (1000 * 60 * 60 * 24)
  );

  if (language === "vi") {
    if (diffInDays === 0) return "Hôm nay";
    if (diffInDays === 1) return "Hôm qua";
    if (diffInDays === -1) return "Ngày mai";
  } else {
    if (diffInDays === 0) return "Today";
    if (diffInDays === 1) return "Yesterday";
    if (diffInDays === -1) return "Tomorrow";
  }

  return formatDate(dateInput, language);
};

/**
 * Format number with locale-specific formatting
 * @param {number} number - Number to format
 * @param {string} language - Language code ('vi' or 'en')
 * @returns {string} Formatted number
 */
export const formatNumber = (number, language = "vi") => {
  if (typeof number !== "number" || isNaN(number)) {
    return "0";
  }

  const locale = language === "vi" ? "vi-VN" : "en-US";
  return number.toLocaleString(locale);
};

/**
 * Get day of week name
 * @param {Date|string} dateInput - Date object or date string
 * @param {string} language - Language code ('vi' or 'en')
 * @param {boolean} short - Return short format (e.g., "T2" vs "Thứ Hai")
 * @returns {string} Day name
 */
export const getDayName = (dateInput, language = "vi", short = false) => {
  const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput;

  if (!(date instanceof Date) || isNaN(date)) {
    return "";
  }

  const dayIndex = date.getDay();

  if (language === "vi") {
    const daysLong = [
      "Chủ Nhật",
      "Thứ Hai",
      "Thứ Ba",
      "Thứ Tư",
      "Thứ Năm",
      "Thứ Sáu",
      "Thứ Bảy",
    ];
    const daysShort = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
    return short ? daysShort[dayIndex] : daysLong[dayIndex];
  } else {
    const daysLong = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    const daysShort = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    return short ? daysShort[dayIndex] : daysLong[dayIndex];
  }
};

/**
 * Get month name
 * @param {number} monthIndex - Month index (0-11)
 * @param {string} language - Language code ('vi' or 'en')
 * @param {boolean} short - Return short format
 * @returns {string} Month name
 */
export const getMonthName = (monthIndex, language = "vi", short = false) => {
  if (monthIndex < 0 || monthIndex > 11) {
    return "";
  }

  if (language === "vi") {
    const monthsLong = [
      "Tháng 1",
      "Tháng 2",
      "Tháng 3",
      "Tháng 4",
      "Tháng 5",
      "Tháng 6",
      "Tháng 7",
      "Tháng 8",
      "Tháng 9",
      "Tháng 10",
      "Tháng 11",
      "Tháng 12",
    ];
    const monthsShort = [
      "Th1",
      "Th2",
      "Th3",
      "Th4",
      "Th5",
      "Th6",
      "Th7",
      "Th8",
      "Th9",
      "Th10",
      "Th11",
      "Th12",
    ];
    return short ? monthsShort[monthIndex] : monthsLong[monthIndex];
  } else {
    const monthsLong = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    const monthsShort = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    return short ? monthsShort[monthIndex] : monthsLong[monthIndex];
  }
};

/**
 * Get greeting based on time of day
 * @param {string} language - Language code ('vi' or 'en')
 * @returns {string} Greeting message
 */
export const getGreeting = (language = "vi") => {
  const hour = new Date().getHours();

  if (language === "vi") {
    if (hour < 12) {
      return "Chào buổi sáng!";
    } else if (hour < 18) {
      return "Chào buổi chiều!";
    } else {
      return "Chào buổi tối!";
    }
  } else {
    if (hour < 12) {
      return "Good morning!";
    } else if (hour < 18) {
      return "Good afternoon!";
    } else {
      return "Good evening!";
    }
  }
};

/**
 * Validate if string is not empty
 * @param {string} str - String to validate
 * @returns {boolean} Is valid
 */
export const isValidString = (str) => {
  return typeof str === "string" && str.trim().length > 0;
};

/**
 * Generate unique ID
 * @returns {string} Unique ID
 */
export const generateId = () => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};
