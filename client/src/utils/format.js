export const fmtTime = (d) => d ? new Date(d).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
export const fmtDateTime = (d) => d ? new Date(d).toLocaleString([], { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : '';
export const initials = (name = '') => name.split(' ').filter(Boolean).slice(0, 2).map((s) => s[0].toUpperCase()).join('') || '?';
