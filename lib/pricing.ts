export const SHIPPING_FEE = 20000;

export const VN_PHONE_REGEX = /^0(3|5|7|8|9)[0-9]{8}$/;

export function isValidAddress(address: string) {
  const trimmed = address.trim();
  return trimmed.length >= 10 && /\d/.test(trimmed);
}
