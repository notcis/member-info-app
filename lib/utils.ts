import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ฟังก์ชันแปลงตัวเลขเป็นบาทภาษาไทย (ฉบับย่อ)
export const numberToThaiBaht = (n: number): string => {
  const txtNumArr = [
    "ศูนย์",
    "หนึ่ง",
    "สอง",
    "สาม",
    "สี่",
    "ห้า",
    "หก",
    "เจ็ด",
    "แปด",
    "เก้า",
  ];
  const txtDigitArr = ["", "สิบ", "ร้อย", "พัน", "หมื่น", "แสน", "ล้าน"];

  let bahtText = "";
  const numberStr = n.toFixed(2);
  const [integerPart, decimalPart] = numberStr.split(".");

  if (parseInt(integerPart) === 0 && parseInt(decimalPart) === 0)
    return "ศูนย์บาทถ้วน";

  // ส่วนจำนวนเต็ม
  const len = integerPart.length;
  for (let i = 0; i < len; i++) {
    const digit = parseInt(integerPart[i]);
    const pos = len - i - 1;
    if (digit !== 0) {
      if (pos === 1 && digit === 1)
        bahtText += ""; // สิบ ไม่ใช่ หนึ่งสิบ
      else if (pos === 1 && digit === 2) bahtText += "ยี่";
      else if (pos === 0 && digit === 1 && len > 1) bahtText += "เอ็ด";
      else bahtText += txtNumArr[digit];
      bahtText += txtDigitArr[pos];
    }
  }
  bahtText += "บาท";

  // ส่วนสตางค์
  if (parseInt(decimalPart) === 0) {
    bahtText += "ถ้วน";
  } else {
    // Logic สตางค์คล้ายจำนวนเต็ม (ย่อไว้เพื่อความกระชับ)
    if (decimalPart === "50") bahtText += "ห้าสิบสตางค์";
    else if (decimalPart === "25") bahtText += "ยี่สิบห้าสตางค์";
    else bahtText += decimalPart + "สตางค์"; // กรณีอื่นแสดงตัวเลขไปเลยเพื่อความง่ายใน demo
  }

  return bahtText;
};
