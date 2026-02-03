import { formatRelative } from "date-fns";

export function RelativeDate({ date }: { date: string | null | undefined }) {
  // Handle null, undefined, or empty date
  if (!date) {
    return null;
  }
  
  const parsedDate = new Date(date);
  
  // Check if the date is valid
  if (isNaN(parsedDate.getTime())) {
    return null;
  }
  
  return formatRelative(parsedDate, new Date());
}
