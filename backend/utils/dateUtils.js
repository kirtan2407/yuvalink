const config = require('../config/env');

const todayInTimezone = () => {
  const date = new Date().toLocaleString('en-US', { timeZone: config.APP_TIMEZONE || 'Asia/Kolkata' });
  return new Date(date);
};

const isValidDateString = (dateString) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateString)) return false;
  const date = new Date(dateString);
  return !isNaN(date.getTime()) && dateString === date.toISOString().split('T')[0];
};

const addDays = (date, days) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

const birthdayWindow = (days) => {
  const today = todayInTimezone();
  const end = addDays(today, days);
  return { start: today, end };
};

const isLeapYear = (year) => (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);

const getBirthdayDiff = (birthDateDate) => {
  if (!birthDateDate) return null;
  const today = todayInTimezone();
  today.setHours(0, 0, 0, 0);

  const currentYear = today.getFullYear();
  let bMonth = birthDateDate.getMonth();
  let bDate = birthDateDate.getDate();

  if (bMonth === 1 && bDate === 29 && !isLeapYear(currentYear)) {
    bDate = 28;
  }

  const currentYearBday = new Date(currentYear, bMonth, bDate);
  const nextYearBday = new Date(currentYear + 1, bMonth, bDate);
  const prevYearBday = new Date(currentYear - 1, bMonth, bDate);

  const diffCurrent = Math.round((currentYearBday - today) / (1000 * 60 * 60 * 24));
  const diffNext = Math.round((nextYearBday - today) / (1000 * 60 * 60 * 24));
  const diffPrev = Math.round((prevYearBday - today) / (1000 * 60 * 60 * 24));

  let minDiff = diffCurrent;
  if (Math.abs(diffNext) < Math.abs(minDiff)) minDiff = diffNext;
  if (Math.abs(diffPrev) < Math.abs(minDiff)) minDiff = diffPrev;

  return minDiff;
};

module.exports = {
  todayInTimezone,
  isValidDateString,
  addDays,
  birthdayWindow,
  getBirthdayDiff,
  isLeapYear
};
