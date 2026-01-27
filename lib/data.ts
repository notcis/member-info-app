// lib/data.ts

export interface Transaction {
  id: number;
  date: string;
  item: string;
  installment?: string; // งวด
  amountIn?: number; // รับ/ฝาก
  amountOut?: number; // จ่าย/ถอน
  balance: number; // คงเหลือ
  principal?: number; // เงินต้น (สำหรับกู้/ใบเสร็จ)
  interest?: number; // ดอกเบี้ย (สำหรับกู้/ใบเสร็จ)
  total?: number; // รวม (สำหรับใบเสร็จ)
}

export const mockMemberData = {
  profile: {
    memberId: "6700123",
    name: "นายสมชาย ใจดี",
    salary: 35000,
    joinDate: "2015-05-15",
    citizenId: "1-1030-00000-00-1",
    address: "123/45 หมู่ 8 ต.บางเขน อ.เมือง จ.นนทบุรี 11000",
  },
  shares: {
    lastInstallment: "105",
    monthlyShare: 1500,
    broughtForward: 150000,
    totalShare: 151500,
    history: [
      {
        id: 1,
        date: "2023-10-31",
        item: "หักรายเดือน",
        installment: "105",
        amountIn: 1500,
        amountOut: 0,
        balance: 151500,
      },
      {
        id: 2,
        date: "2023-09-30",
        item: "หักรายเดือน",
        installment: "104",
        amountIn: 1500,
        amountOut: 0,
        balance: 150000,
      },
      {
        id: 3,
        date: "2023-08-31",
        item: "หักรายเดือน",
        installment: "103",
        amountIn: 1500,
        amountOut: 0,
        balance: 148500,
      },
    ] as Transaction[],
  },
  loans: [
    {
      contractId: "ฉ.66001",
      details: "เงินกู้ฉุกเฉิน เพื่อการศึกษา",
      installmentAmount: 2000,
      outstandingBalance: 18000,
      history: [
        {
          id: 1,
          date: "2023-10-31",
          item: "ชำระรายเดือน",
          installment: "10",
          principal: 1800,
          interest: 200,
          balance: 18000,
        },
        {
          id: 2,
          date: "2023-09-30",
          item: "ชำระรายเดือน",
          installment: "9",
          principal: 1800,
          interest: 210,
          balance: 19800,
        },
      ] as Transaction[],
    },
    {
      contractId: "ส.65023",
      details: "เงินกู้สามัญ",
      installmentAmount: 8500,
      outstandingBalance: 450000,
      history: [
        {
          id: 1,
          date: "2023-10-31",
          item: "ชำระรายเดือน",
          installment: "24",
          principal: 6000,
          interest: 2500,
          balance: 450000,
        },
      ] as Transaction[],
    },
  ],
  deposits: [
    {
      accountId: "001-2-34567",
      name: "ออมทรัพย์พิเศษ",
      balance: 54321.5,
      history: [
        {
          id: 1,
          date: "2023-10-25",
          item: "ฝากเงินสด",
          amountIn: 5000,
          amountOut: 0,
          balance: 54321.5,
        },
        {
          id: 2,
          date: "2023-09-01",
          item: "ถอนเงินสด",
          amountIn: 0,
          amountOut: 2000,
          balance: 49321.5,
        },
      ] as Transaction[],
    },
    {
      accountId: "002-1-11223",
      name: "ออมทรัพย์เกษียณเปี่ยมสุข",
      balance: 100000,
      history: [],
    },
  ],
  guarantees: {
    collateral: [
      {
        id: 1,
        refContract: "ส.65023",
        detail: "ที่ดินโฉนดเลขที่ 12345",
        balance: 1500000,
      },
    ],
    guaranteeing: [
      {
        id: 1,
        contractId: "ส.66055",
        debtorName: "นางสมหญิง รักดี",
        balance: 250000,
      },
      {
        id: 2,
        contractId: "ฉ.66102",
        debtorName: "นายมานะ อดทน",
        balance: 30000,
      },
    ],
  },
  billing: {
    month: "ตุลาคม 2566",
    receiptNo: "RC-6610-00123",
    items: [
      {
        id: 1,
        item: "ค่าหุ้นรายเดือน",
        installment: "105",
        principal: 1500,
        interest: 0,
        total: 1500,
        balance: 151500,
      },
      {
        id: 2,
        item: "ชำระเงินกู้ฉุกเฉิน (ฉ.66001)",
        installment: "10",
        principal: 1800,
        interest: 200,
        total: 2000,
        balance: 18000,
      },
      {
        id: 3,
        item: "ชำระเงินกู้สามัญ (ส.65023)",
        installment: "24",
        principal: 6000,
        interest: 2500,
        total: 8500,
        balance: 450000,
      },
    ] as Transaction[],
  },
  dividend: {
    year: "2565",
    dividendAmount: 8500.0,
    rebateAmount: 1250.5, // เฉลี่ยคืน
    total: 9750.5,
    deductCremation1: 200, // ฌาปนกิจ 1
    deductCremation2: 400, // ฌาปนกิจ 2
    netTotal: 9150.5,
    dividendRate: 5.5,
    rebateRate: 12.0,
  },
};

export const formatTHB = (amount: number) => {
  return new Intl.NumberFormat("th-TH", {
    style: "currency",
    currency: "THB",
  }).format(amount);
};

export const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString("th-TH", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};
