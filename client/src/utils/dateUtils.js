export const formatDate = (date, options = {}) =>
  new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    ...options,
  }).format(new Date(date));

export const formatDateTime = (date) =>
  formatDate(date, {
    hour: "2-digit",
    minute: "2-digit",
  });

export const daysBetween = (start, end) => {
  const ms = new Date(end).getTime() - new Date(start).getTime();
  return Math.max(1, Math.ceil(ms / 86400000));
};

export const isPastDate = (date) => new Date(date).getTime() < Date.now();
