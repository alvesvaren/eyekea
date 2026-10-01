export const formatNumber = new Intl.NumberFormat("en").format;
export const formatPercent = new Intl.NumberFormat("en", { style: "percent", maximumFractionDigits: 0 }).format;
export const formatDate = new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format;
