export function computeAge(birthDateString) {
  if (!birthDateString) return null;
  const today = new Date();
  const birthDate = new Date(birthDateString);
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}

export function filterMembers(members, { group, search }) {
  return members.filter(member => {
    const matchGroup = group === 'all' || member.group === group;
    const matchSearch = !search || 
      (member.name && member.name.toLowerCase().includes(search.toLowerCase())) ||
      (member.phone && member.phone.includes(search));
    return matchGroup && matchSearch;
  });
}

export function sortMembers(members, sortType) {
  const sorted = [...members];
  switch (sortType) {
    case 'name_asc':
      return sorted.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    case 'name_desc':
      return sorted.sort((a, b) => (b.name || '').localeCompare(a.name || ''));
    case 'age_asc':
      return sorted.sort((a, b) => {
        const ageA = a.birthDate ? computeAge(a.birthDate) : 0;
        const ageB = b.birthDate ? computeAge(b.birthDate) : 0;
        return ageA - ageB;
      });
    case 'age_desc':
      return sorted.sort((a, b) => {
        const ageA = a.birthDate ? computeAge(a.birthDate) : 0;
        const ageB = b.birthDate ? computeAge(b.birthDate) : 0;
        return ageB - ageA;
      });
    default:
      return sorted;
  }
}
