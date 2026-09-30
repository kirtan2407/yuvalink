const config = require('../config/env');

const todayInTimezone = () => {
  const date = new Date().toLocaleString('en-US', { timeZone: config.APP_TIMEZONE });
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

module.exports = {
  todayInTimezone,
  isValidDateString,
  addDays,
  birthdayWindow
};
