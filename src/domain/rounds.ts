export function parseTime(value: string) {
  const match = value.trim().match(/^([01]?\d|2[0-3]):([0-5]\d)$/);
  if (!match) return false;
  const hour = Number(match[1]);
  const minute = Number(match[2]);
  return hour * 60 + minute;
}

function escapeCsvCell(value: string) {
  const cell = String(value ?? '');
  if (!/[",\r\n]/.test(cell)) {
    return cell;
  }
  return `"${cell.replaceAll('"', '""')}"`;
}

export function tableToCsv(table: string[][]) {
  return table.map((row) => row.map(escapeCsvCell).join(',')).join('\n');
}
