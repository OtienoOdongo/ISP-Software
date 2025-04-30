export const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const options = { year: "numeric", month: "short", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  export const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-KE", { style: "currency", currency: "KES" }).format(amount || 0);
  };
  
  export const formatPhoneNumber = (phone) => {
    if (!phone) return "N/A";
    if (phone.startsWith("+254") && phone.length === 13) {
      return `0${phone.slice(4)}`;
    }
    return phone;
  };