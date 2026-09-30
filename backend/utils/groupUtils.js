const normalizeGroup = (group) => {
  if (!group || typeof group !== 'string') return '';
  const trimmed = group.trim().toUpperCase();
  return /^[A-Z]$/.test(trimmed) ? trimmed : '';
};

const isValidGroup = (group) => {
  if (group === '') return true;
  return /^[A-Z]$/.test(group);
};

module.exports = {
  normalizeGroup,
  isValidGroup
};
