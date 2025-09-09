export const formatDateTime = (isoString) => {
  const date = new Date(isoString);

  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");

  const year = date.getFullYear();
  const month = date.getMonth() + 1; // months are 0-based
  const day = date.getDate();

  return `${hours}:${minutes}:${seconds} ${year}.${month}.${day}`;
};
