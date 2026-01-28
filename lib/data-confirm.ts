// lib/data-confirm.ts

export const mockConfirmData = {
  profile: {
    memberId: "6700123",
    name: "นายสมชาย ใจดี",
    department: "โรงเรียนอนุบาลหนองบัว",
  },
  auditDate: "31 สิงหาคม 2568",
  financials: {
    shares: [
      { id: 1, label: "ทุนเรือนหุ้น", amount: 153000.00 }
    ],
    loans: [
      { id: 1, label: "เงินกู้สามัญ (ส.65023)", balance: 420000.00 },
      { id: 2, label: "เงินกู้ฉุกเฉิน (ฉ.66001)", balance: 0.00 }
    ],
    deposits: [
      { id: 1, label: "ออมทรัพย์พิเศษ (001-2-34567)", balance: 54321.50 },
      { id: 2, label: "ออมทรัพย์เกษียณ (002-1-11223)", balance: 100000.00 }
    ]
  }
};

export const formatCurrency = (amount: number) => {
  return amount.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};