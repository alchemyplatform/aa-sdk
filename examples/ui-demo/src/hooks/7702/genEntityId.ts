export function genEntityId(): number {
  const min: number = 1;
  const max: number = Number(999999);

  return Math.floor(Math.random() * (max - min + 1)) + min;
}
