import { format, formatDistanceToNowStrict, isValid, parseISO } from 'date-fns';

export function formatAppDate(isoDate: string, pattern = 'yyyy.MM.dd') {
  const parsedDate = parseISO(isoDate);

  if (!isValid(parsedDate)) {
    return isoDate;
  }

  return format(parsedDate, pattern);
}

export function formatTimeUntilDate(isoDate: string) {
  const parsedDate = parseISO(isoDate);

  if (!isValid(parsedDate)) {
    return '';
  }

  return formatDistanceToNowStrict(parsedDate, { addSuffix: true });
}
