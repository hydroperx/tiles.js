export function hex() {
  return Math.floor(Math.random() * 0xf_ff_ff).toString(16);
}

export function hexLarge() {
  return [0, 0, 0, 0, 0, 0, 0].map(_ => hex()).join("");
}
