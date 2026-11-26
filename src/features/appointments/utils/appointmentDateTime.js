export function getDefaultAppointmentDateTime() {
  const date = new Date();
  date.setMinutes(Math.ceil(date.getMinutes() / 30) * 30, 0, 0);
  date.setMinutes(date.getMinutes() + 30);
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);

  return localDate.toISOString().slice(0, 16);
}

export function toLocalDateTimeInput(value) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return getDefaultAppointmentDateTime();
  }

  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return localDate.toISOString().slice(0, 16);
}
