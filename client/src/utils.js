export const formatPhone = (phoneNumber) => {
  if (!phoneNumber) return "Not provided";
  // Remove any non-digit characters first
  const cleaned = phoneNumber.replace(/\D/g, "");
  // Only format if it's exactly 10 digits
  if (cleaned.length === 10) {
    return cleaned.replace(/(\d{5})(\d{5})/, "$1-$2");
  }
  return phoneNumber; // Return original if not 10 digits
};
