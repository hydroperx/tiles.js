export function random_hex() {
  return Math.floor(Math.random() * 0xf_ff_ff).toString(16);
}

export function random_hex_large() {
  return [0, 0, 0, 0, 0, 0, 0].map((_) => random_hex()).join("");
}
