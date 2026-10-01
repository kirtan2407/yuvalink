const fs = require('fs');

let ctx = fs.readFileSync('frontend/src/context/MembersContext.jsx', 'utf8');

ctx = ctx.replace(
  /members: state\.members\.filter\(m => m\.id !== action\.payload\.id && m\._id !== action\.payload\.id\)/g,
  'members: state.members.filter(m => (m._id || m.id) !== (action.payload._id || action.payload.id))'
);

ctx = ctx.replace(
  /trashMembers: state\.trashMembers\.filter\(m => m\.id !== action\.payload\.id && m\._id !== action\.payload\.id\)/g,
  'trashMembers: state.trashMembers.filter(m => (m._id || m.id) !== (action.payload._id || action.payload.id))'
);

ctx = ctx.replace(
  /members: state\.members\.map\(m => m\.id === action\.payload\.id \|\| m\._id === action\.payload\.id \? action\.payload : m\)/g,
  'members: state.members.map(m => (m._id || m.id) === (action.payload._id || action.payload.id) ? action.payload : m)'
);

fs.writeFileSync('frontend/src/context/MembersContext.jsx', ctx);
