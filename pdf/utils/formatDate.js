const formatDate = (dateString) => {
  if (!dateString) return "";

  const options = { day: "2-digit", month: "short", year: "numeric" };
  const dateObj = new Date(dateString);

  return dateObj.toLocaleDateString("en-US", options); // "04 Apr, 2011"
};

export default formatDate