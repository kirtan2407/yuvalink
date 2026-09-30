export function filterMembers(members, { group, search, sortOrder }) {
  let filtered = [...members];

  // Search filter
  if (search) {
    const s = search.trim();
    if (s.length === 1) {
      const g = s.toUpperCase();
      filtered = filtered.filter(m => m.group === g);
    } else if (s.length >= 2) {
      const sl = s.toLowerCase();
      filtered = filtered.filter(m => {
        return (
          (m.name && m.name.toLowerCase().includes(sl)) ||
          (m.mobile && m.mobile.toLowerCase().includes(sl)) ||
          (m.address && m.address.toLowerCase().includes(sl)) ||
          (m.study && m.study.toLowerCase().includes(sl)) ||
          (m.occupation && m.occupation.toLowerCase().includes(sl))
        );
      });
    }
  }

  // Group filter
  if (group && group !== 'All') {
    if (group === 'Unassigned') {
      filtered = filtered.filter(m => !m.group || m.group.trim() === '');
    } else {
      filtered = filtered.filter(m => m.group === group);
    }
  }

  // Sort Order
  if (sortOrder) {
    filtered.sort((a, b) => {
      switch (sortOrder) {
        case 'Name A-Z':
          return (a.name || '').localeCompare(b.name || '');
        case 'Name Z-A':
          return (b.name || '').localeCompare(a.name || '');
        case 'Newest':
          return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
        case 'Oldest':
          return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
        default:
          return 0;
      }
    });
  }

  return filtered;
}
