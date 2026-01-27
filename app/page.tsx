"use client";

import React, { useState, Suspense } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import {
  User,
  CreditCard,
  Banknote,
  Landmark,
  ShieldCheck,
  Receipt,
  PieChart,
} from "lucide-react";
import { mockMemberData, formatTHB, formatDate } from "@/lib/data";

// Wrap Component หลักด้วย Suspense สำหรับใช้ useSearchParams
export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center">
          กำลังโหลดข้อมูล...
        </div>
      }
    >
      <MemberSystem />
    </Suspense>
  );
}

function MemberSystem() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // 1. Logic อ่านค่า Tab จาก URL (Default = profile)
  const activeTab = searchParams.get("tab") || "profile";

  // 2. Logic เปลี่ยน URL เมื่อกด Tab
  const handleTabChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", value);
    // ใช้ replace เพื่อไม่ให้ History บวมเกินไป
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  // State สำหรับ dropdown เลือกสัญญา/บัญชี
  const [selectedLoan, setSelectedLoan] = useState(
    mockMemberData.loans[0].contractId,
  );
  const [selectedDeposit, setSelectedDeposit] = useState(
    mockMemberData.deposits[0].accountId,
  );

  // คำนวณข้อมูลตาม State ที่เลือก
  const currentLoan = mockMemberData.loans.find(
    (l) => l.contractId === selectedLoan,
  );
  const currentDeposit = mockMemberData.deposits.find(
    (d) => d.accountId === selectedDeposit,
  );
  const billingTotal = mockMemberData.billing.items.reduce(
    (sum, item) => sum + (item.total || 0),
    0,
  );

  return (
    <div className="min-h-screen bg-slate-50 pb-20 font-sans">
      {/* Header Mobile */}
      <header className="bg-blue-700 text-white p-4 shadow-md sticky top-0 z-50">
        <div className="flex items-center justify-between max-w-md mx-auto md:max-w-4xl">
          <div>
            <h1 className="text-lg font-bold">สหกรณ์ออมทรัพย์ตัวอย่าง</h1>
            <p className="text-xs text-blue-100">
              สวัสดี, {mockMemberData.profile.name}
            </p>
          </div>
          <div className="h-10 w-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
            <User size={20} />
          </div>
        </div>
      </header>

      <main className="max-w-md mx-auto md:max-w-4xl p-4">
        {/* Controlled Tabs */}
        <Tabs
          value={activeTab}
          onValueChange={handleTabChange}
          className="w-full"
        >
          {/* Scrollable Tab List (Mobile Friendly) */}
          <ScrollArea className="w-full whitespace-nowrap rounded-md border bg-white shadow-sm mb-4">
            <TabsList className="flex w-max p-1 h-auto bg-transparent">
              <TabTriggerItem
                value="profile"
                icon={<User size={16} />}
                label="ข้อมูลสมาชิก"
              />
              <TabTriggerItem
                value="shares"
                icon={<Banknote size={16} />}
                label="ทะเบียนหุ้น"
              />
              <TabTriggerItem
                value="loans"
                icon={<CreditCard size={16} />}
                label="เงินกู้"
              />
              <TabTriggerItem
                value="deposits"
                icon={<Landmark size={16} />}
                label="เงินฝาก"
              />
              <TabTriggerItem
                value="guarantees"
                icon={<ShieldCheck size={16} />}
                label="ค้ำประกัน"
              />
              <TabTriggerItem
                value="billing"
                icon={<Receipt size={16} />}
                label="เรียกเก็บ"
              />
              <TabTriggerItem
                value="dividend"
                icon={<PieChart size={16} />}
                label="ปันผล"
              />
            </TabsList>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>

          {/* --- 1. หน้าข้อมูลสมาชิก --- */}
          <TabsContent
            value="profile"
            className="animate-in fade-in-50 duration-300"
          >
            <Card>
              <CardHeader className="bg-blue-50 border-b border-blue-100">
                <CardTitle className="text-blue-800 text-lg">
                  ข้อมูลส่วนตัว
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <InfoRow
                  label="หมายเลขสมาชิก"
                  value={mockMemberData.profile.memberId}
                />
                <InfoRow
                  label="ชื่อ-นามสกุล"
                  value={mockMemberData.profile.name}
                />
                <InfoRow label="ตำแหน่ง" value="พนักงานราชการ" />
                <InfoRow
                  label="เงินเดือน"
                  value={formatTHB(mockMemberData.profile.salary)}
                />
                <InfoRow
                  label="วันที่เข้าเป็นสมาชิก"
                  value={formatDate(mockMemberData.profile.joinDate)}
                />
                <InfoRow
                  label="เลขบัตรประชาชน"
                  value={mockMemberData.profile.citizenId}
                />
                <div className="pt-2 border-t">
                  <span className="text-sm text-gray-500">ที่อยู่</span>
                  <p className="text-gray-900 mt-1 text-sm">
                    {mockMemberData.profile.address}
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* --- 2. หน้าทะเบียนหุ้น --- */}
          <TabsContent
            value="shares"
            className="animate-in fade-in-50 duration-300"
          >
            <Card className="mb-4 bg-white border-l-4 border-l-blue-600">
              <CardContent className="pt-6">
                <p className="text-sm text-gray-500 mb-1">ทุนเรือนหุ้นสะสม</p>
                <h2 className="text-3xl font-bold text-blue-800">
                  {formatTHB(mockMemberData.shares.totalShare)}
                </h2>
                <div className="mt-4 flex gap-4 text-sm">
                  <div>
                    <span className="text-gray-500 block">งวดล่าสุด</span>
                    <span className="font-medium">
                      {mockMemberData.shares.lastInstallment}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500 block">ส่งต่องวด</span>
                    <span className="font-medium">
                      {formatTHB(mockMemberData.shares.monthlyShare)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">ประวัติการชำระหุ้น</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <ResponsiveTable
                  headers={["วันที่", "รายการ", "งวด", "รับ", "คงเหลือ"]}
                  data={mockMemberData.shares.history}
                  renderRow={(row) => (
                    <>
                      <TableCell>{formatDate(row.date)}</TableCell>
                      <TableCell>{row.item}</TableCell>
                      <TableCell className="text-center">
                        {row.installment}
                      </TableCell>
                      <TableCell className="text-right text-green-600">
                        +{row.amountIn?.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right font-bold">
                        {row.balance.toLocaleString()}
                      </TableCell>
                    </>
                  )}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* --- 3. หน้าเงินกู้ --- */}
          <TabsContent
            value="loans"
            className="animate-in fade-in-50 duration-300"
          >
            <div className="space-y-4">
              <div className="bg-white p-4 rounded-lg shadow-sm border">
                <label className="text-xs font-semibold text-gray-500 mb-2 block uppercase">
                  เลือกสัญญาเงินกู้
                </label>
                <Select value={selectedLoan} onValueChange={setSelectedLoan}>
                  <SelectTrigger className="w-full font-medium">
                    <SelectValue placeholder="เลือกสัญญา" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockMemberData.loans.map((loan) => (
                      <SelectItem key={loan.contractId} value={loan.contractId}>
                        <span className="font-bold mr-2">
                          {loan.contractId}
                        </span>
                        <span className="text-gray-500 text-xs">
                          ({formatTHB(loan.outstandingBalance)})
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {currentLoan && (
                <>
                  <Card className="border-l-4 border-l-red-500">
                    <CardContent className="pt-6">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-sm text-gray-500">หนี้คงเหลือ</p>
                          <h2 className="text-3xl font-bold text-red-600">
                            {formatTHB(currentLoan.outstandingBalance)}
                          </h2>
                        </div>
                        <Badge
                          variant="outline"
                          className="text-red-600 border-red-200 bg-red-50"
                        >
                          {currentLoan.contractId}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mt-2">
                        {currentLoan.details}
                      </p>
                      <div className="mt-4 pt-4 border-t flex justify-between text-sm">
                        <span className="text-gray-500">ชำระต่องวด</span>
                        <span className="font-bold">
                          {formatTHB(currentLoan.installmentAmount)}
                        </span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">
                        ความเคลื่อนไหว
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                      <ResponsiveTable
                        headers={["วันที่", "งวด", "ต้น", "ดอก", "คงเหลือ"]}
                        data={currentLoan.history}
                        renderRow={(row) => (
                          <>
                            <TableCell>{formatDate(row.date)}</TableCell>
                            <TableCell className="text-center">
                              {row.installment}
                            </TableCell>
                            <TableCell className="text-right">
                              {row.principal?.toLocaleString()}
                            </TableCell>
                            <TableCell className="text-right text-red-500">
                              {row.interest?.toLocaleString()}
                            </TableCell>
                            <TableCell className="text-right font-bold">
                              {row.balance.toLocaleString()}
                            </TableCell>
                          </>
                        )}
                      />
                    </CardContent>
                  </Card>
                </>
              )}
            </div>
          </TabsContent>

          {/* --- 4. หน้าเงินฝาก --- */}
          <TabsContent
            value="deposits"
            className="animate-in fade-in-50 duration-300"
          >
            <div className="space-y-4">
              <div className="bg-white p-4 rounded-lg shadow-sm border">
                <label className="text-xs font-semibold text-gray-500 mb-2 block uppercase">
                  เลือกบัญชีเงินฝาก
                </label>
                <Select
                  value={selectedDeposit}
                  onValueChange={setSelectedDeposit}
                >
                  <SelectTrigger className="w-full font-medium">
                    <SelectValue placeholder="เลือกบัญชี" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockMemberData.deposits.map((acc) => (
                      <SelectItem key={acc.accountId} value={acc.accountId}>
                        {acc.accountId} - {acc.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {currentDeposit && (
                <>
                  <Card className="bg-gradient-to-br from-blue-600 to-blue-800 text-white border-none shadow-lg">
                    <CardContent className="pt-6">
                      <div className="flex justify-between items-start mb-6">
                        <Landmark className="opacity-80" />
                        <span className="font-mono opacity-80">
                          {currentDeposit.accountId}
                        </span>
                      </div>
                      <p className="text-blue-100 mb-1 text-sm">
                        ยอดเงินฝากคงเหลือ
                      </p>
                      <h2 className="text-3xl font-bold tracking-tight">
                        {formatTHB(currentDeposit.balance)}
                      </h2>
                      <p className="text-sm mt-4 opacity-90 font-medium">
                        {currentDeposit.name}
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Statement</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                      <ResponsiveTable
                        headers={["วันที่", "รายการ", "ถอน", "ฝาก", "คงเหลือ"]}
                        data={currentDeposit.history}
                        renderRow={(row) => (
                          <>
                            <TableCell>{formatDate(row.date)}</TableCell>
                            <TableCell>{row.item}</TableCell>
                            <TableCell className="text-right text-red-500">
                              {row.amountOut
                                ? `-${row.amountOut.toLocaleString()}`
                                : "-"}
                            </TableCell>
                            <TableCell className="text-right text-green-600 font-medium">
                              {row.amountIn
                                ? `+${row.amountIn.toLocaleString()}`
                                : "-"}
                            </TableCell>
                            <TableCell className="text-right font-bold">
                              {row.balance.toLocaleString()}
                            </TableCell>
                          </>
                        )}
                      />
                    </CardContent>
                  </Card>
                </>
              )}
            </div>
          </TabsContent>

          {/* --- 5. หน้าข้อมูลการค้ำประกัน --- */}
          <TabsContent
            value="guarantees"
            className="animate-in fade-in-50 duration-300"
          >
            <div className="space-y-6">
              <Card>
                <CardHeader className="bg-gray-50 pb-3">
                  <CardTitle className="text-base flex items-center gap-2 text-gray-700">
                    <ShieldCheck size={18} className="text-blue-600" />{" "}
                    ทรัพย์สินค้ำประกัน
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <ResponsiveTable
                    headers={["สัญญาที่ค้ำ", "รายละเอียด", "มูลค่า"]}
                    data={mockMemberData.guarantees.collateral}
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    renderRow={(row: any) => (
                      <>
                        <TableCell className="font-medium">
                          {row.refContract}
                        </TableCell>
                        <TableCell className="text-xs text-gray-600 max-w-[150px] truncate">
                          {row.detail}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatTHB(row.balance)}
                        </TableCell>
                      </>
                    )}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="bg-gray-50 pb-3">
                  <CardTitle className="text-base flex items-center gap-2 text-gray-700">
                    <User size={18} className="text-red-500" />{" "}
                    ค้ำประกันให้บุคคลอื่น
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <ResponsiveTable
                    headers={["สัญญาผู้กู้", "ชื่อ-สกุล", "ยอดคงเหลือ"]}
                    data={mockMemberData.guarantees.guaranteeing}
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    renderRow={(row: any) => (
                      <>
                        <TableCell className="font-medium">
                          {row.contractId}
                        </TableCell>
                        <TableCell>{row.debtorName}</TableCell>
                        <TableCell className="text-right text-red-600">
                          {formatTHB(row.balance)}
                        </TableCell>
                      </>
                    )}
                  />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* --- 6. หน้าข้อมูลการเรียกเก็บ --- */}
          <TabsContent
            value="billing"
            className="animate-in fade-in-50 duration-300"
          >
            <Card>
              <CardHeader>
                <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-2">
                  <div>
                    <CardTitle className="text-lg">
                      ใบเสร็จเรียกเก็บรายเดือน
                    </CardTitle>
                    <CardDescription className="mt-1 font-bold text-blue-600 text-xl">
                      {mockMemberData.billing.month}
                    </CardDescription>
                  </div>
                  <Badge
                    variant="secondary"
                    className="w-fit text-xs px-2 py-1 bg-slate-200 text-slate-700"
                  >
                    เลขที่: {mockMemberData.billing.receiptNo}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="relative w-full overflow-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-slate-50">
                        <TableHead className="w-[40%] text-xs font-bold text-gray-700">
                          รายการ
                        </TableHead>
                        <TableHead className="text-center text-xs font-bold text-gray-700">
                          งวด
                        </TableHead>
                        <TableHead className="text-right text-xs font-bold text-gray-700">
                          เงินต้น
                        </TableHead>
                        <TableHead className="text-right text-xs font-bold text-gray-700">
                          ดอกเบี้ย
                        </TableHead>
                        <TableHead className="text-right text-xs font-bold text-gray-700">
                          รวม
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {mockMemberData.billing.items.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium text-xs md:text-sm">
                            {item.item}
                          </TableCell>
                          <TableCell className="text-center text-xs">
                            {item.installment}
                          </TableCell>
                          <TableCell className="text-right text-xs md:text-sm">
                            {item.principal?.toLocaleString()}
                          </TableCell>
                          <TableCell className="text-right text-xs md:text-sm">
                            {item.interest?.toLocaleString()}
                          </TableCell>
                          <TableCell className="text-right font-bold text-xs md:text-sm">
                            {item.total?.toLocaleString()}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                    {/* Table Footer */}
                    <tfoot className="bg-blue-50 font-bold border-t-2 border-blue-100">
                      <tr>
                        <td
                          colSpan={4}
                          className="p-4 text-right text-sm text-blue-900"
                        >
                          รวมเรียกเก็บสุทธิ
                        </td>
                        <td className="p-4 text-right text-blue-700 text-lg">
                          {formatTHB(billingTotal)}
                        </td>
                      </tr>
                    </tfoot>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* --- 7. หน้าข้อมูลเงินปันผล --- */}
          <TabsContent
            value="dividend"
            className="animate-in fade-in-50 duration-300"
          >
            <Card className="overflow-hidden border-yellow-400 border">
              <div className="bg-gradient-to-r from-yellow-500 to-amber-500 p-8 text-white text-center shadow-inner">
                <h3 className="text-lg font-medium opacity-90">
                  เงินปันผล-เฉลี่ยคืน ประจำปี
                </h3>
                <h1 className="text-5xl font-extrabold mt-2 tracking-tight drop-shadow-md">
                  {mockMemberData.dividend.year}
                </h1>
              </div>
              <CardContent className="pt-6">
                <div className="space-y-6">
                  {/* Rate Cards */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-blue-50 p-4 rounded-lg text-center border border-blue-100">
                      <p className="text-xs text-gray-500 uppercase font-semibold">
                        อัตราปันผล
                      </p>
                      <p className="text-2xl font-bold text-blue-600 mt-1">
                        {mockMemberData.dividend.dividendRate}%
                      </p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg text-center border border-green-100">
                      <p className="text-xs text-gray-500 uppercase font-semibold">
                        อัตราเฉลี่ยคืน
                      </p>
                      <p className="text-2xl font-bold text-green-600 mt-1">
                        {mockMemberData.dividend.rebateRate}%
                      </p>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="space-y-2">
                    <InfoRow
                      label="เงินปันผล"
                      value={formatTHB(mockMemberData.dividend.dividendAmount)}
                    />
                    <InfoRow
                      label="เงินเฉลี่ยคืน"
                      value={formatTHB(mockMemberData.dividend.rebateAmount)}
                    />
                    <div className="py-2 px-2 bg-slate-50 rounded flex justify-between font-bold border border-slate-200">
                      <span>รวมยอดรับ</span>
                      <span>{formatTHB(mockMemberData.dividend.total)}</span>
                    </div>
                  </div>

                  {/* Deductions */}
                  <div className="bg-red-50 p-4 rounded-lg border border-red-100">
                    <h4 className="text-xs font-bold text-red-800 uppercase mb-2">
                      รายการหัก
                    </h4>
                    <div className="space-y-2 text-sm text-red-700">
                      <div className="flex justify-between">
                        <span>หัก ฌาปนกิจ (รท)</span>
                        <span>
                          -
                          {mockMemberData.dividend.deductCremation1.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>หัก ฌาปนกิจ (ชสอ)</span>
                        <span>
                          -
                          {mockMemberData.dividend.deductCremation2.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Net Total */}
                  <div className="pt-2">
                    <div className="flex justify-between items-center p-5 bg-green-50 rounded-xl border border-green-200 shadow-sm">
                      <span className="font-bold text-green-800 text-sm uppercase">
                        คงเหลือสุทธิเข้าบัญชี
                      </span>
                      <span className="text-2xl font-bold text-green-700">
                        {formatTHB(mockMemberData.dividend.netTotal)}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

// --------------------------------------------------------
// Sub-Components Helper
// --------------------------------------------------------

function TabTriggerItem({
  value,
  icon,
  label,
}: {
  value: string;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <TabsTrigger
      value={value}
      className="flex items-center gap-2 px-4 py-2 text-gray-600 data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700 transition-all duration-200"
    >
      {icon}
      <span className="text-sm font-medium">{label}</span>
    </TabsTrigger>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0 hover:bg-slate-50 transition-colors px-1">
      <span className="text-sm text-gray-500">{label}</span>
      <span className="font-medium text-gray-900">{value}</span>
    </div>
  );
}

// Reusable Table with Horizontal Scroll
function ResponsiveTable({
  headers,
  data,
  renderRow,
}: {
  headers: string[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  renderRow: (row: any) => React.ReactNode;
}) {
  if (!data || data.length === 0) {
    return (
      <div className="p-8 text-center text-gray-400 text-sm bg-slate-50 rounded-lg border border-dashed">
        ไม่มีรายการเคลื่อนไหว
      </div>
    );
  }
  return (
    <div className="relative w-full overflow-auto">
      <Table>
        <TableHeader>
          <TableRow className="bg-slate-50 hover:bg-slate-50">
            {headers.map((h, i) => (
              <TableHead
                key={i}
                className={`whitespace-nowrap text-xs font-bold text-gray-600 ${i > 1 ? "text-right" : ""}`}
              >
                {h}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row, index) => (
            <TableRow
              key={row.id || index}
              className="text-xs md:text-sm hover:bg-blue-50/50"
            >
              {renderRow(row)}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
