"use client";

import React, { useState, useRef } from "react";
import { toPng } from 'html-to-image';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Download, ChevronLeft, Search, Printer } from "lucide-react";
import Link from "next/link";
import { numberToThaiBaht } from "@/lib/utils"; // อย่าลืม import function ที่สร้างในข้อ 2

// --- Mock Data สำหรับใบเสร็จ ---
const mockReceiptData = {
  receiptNo: "RC-6701-0089",
  date: "31 มกราคม 2567",
  payer: "นายสมชาย ใจดี",
  memberId: "6700123",
  department: "โรงเรียนอนุบาลหนองบัว",
  shareCapital: 153000, // ทุนเรือนหุ้น
  accumulatedInterest: 0, // ดอกเบี้ยสะสม
  items: [
    { id: 1, name: "ค่าหุ้นรายเดือน", period: "108", principal: 1500.00, interest: 0.00, total: 1500.00, remainingPrincipal: 153000.00 },
    { id: 2, name: "ชำระเงินกู้สามัญ (ส.65023)", period: "28", principal: 6000.00, interest: 2350.50, total: 8350.50, remainingPrincipal: 420000.00 },
    { id: 3, name: "ชำระเงินกู้ฉุกเฉิน (ฉ.66001)", period: "12", principal: 2000.00, interest: 150.00, total: 2150.00, remainingPrincipal: 0.00 },
    { id: 4, name: "ค่าธรรมเนียมแรกเข้า", period: "-", principal: 100.00, interest: 0.00, total: 100.00, remainingPrincipal: 0.00 },
  ]
};

export default function ReceiptPage() {
  const [selectedMonth, setSelectedMonth] = useState("");
  const [showReceipt, setShowReceipt] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const receiptRef = useRef<HTMLDivElement>(null);

  // คำนวณยอดรวม
  const totalAmount = mockReceiptData.items.reduce((sum, item) => sum + item.total, 0);
  const thaiBahtText = numberToThaiBaht(totalAmount);

  // ฟังก์ชันดาวน์โหลดเป็นรูปภาพ
  const handleDownloadImage = async () => {
    if (!receiptRef.current) return;
    setIsGenerating(true);
    
    try {
      // html-to-image ใช้งานง่ายกว่า ไม่ต้องรอ fonts.ready นานเท่า
      const dataUrl = await toPng(receiptRef.current, { 
        cacheBust: true, 
        backgroundColor: '#ffffff', // บังคับพื้นหลังขาว
        pixelRatio: 2 // เพิ่มความชัด (เหมือน scale: 2)
      });

      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = `ใบเสร็จ_${mockReceiptData.receiptNo}.png`;
      link.click();
      
    } catch (error) {
      console.error("Error generating image:", error);
      alert("เกิดข้อผิดพลาดในการบันทึกภาพ");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSearch = () => {
    if (selectedMonth) {
        setShowReceipt(true);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 p-4 md:p-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header Navigation */}
        <div className="flex items-center gap-4 mb-4">
            <Link href="/" className="p-2 rounded-full bg-white shadow hover:bg-slate-50 text-slate-600">
                <ChevronLeft size={24} />
            </Link>
            <h1 className="text-2xl font-bold text-slate-800">ระบบใบเสร็จรับเงินออนไลน์</h1>
        </div>

        {/* Step 1: Selection Card */}
        {!showReceipt && (
            <Card className="w-full max-w-md mx-auto mt-10 shadow-lg">
                <CardHeader>
                    <CardTitle className="text-center text-blue-700">ค้นหาใบเสร็จรับเงิน</CardTitle>
                    <CardDescription className="text-center">กรุณาเลือกเดือนที่ต้องการดูข้อมูล</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">ประจำเดือน</label>
                        <Select onValueChange={setSelectedMonth}>
                            <SelectTrigger>
                                <SelectValue placeholder="-- เลือกเดือน --" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="2024-01">มกราคม 2567</SelectItem>
                                <SelectItem value="2024-02">กุมภาพันธ์ 2567</SelectItem>
                                <SelectItem value="2024-03">มีนาคม 2567</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <Button 
                        className="w-full bg-blue-600 hover:bg-blue-700" 
                        disabled={!selectedMonth}
                        onClick={handleSearch}
                    >
                        <Search className="mr-2 h-4 w-4" /> ดูใบเสร็จ
                    </Button>
                </CardContent>
            </Card>
        )}

        {/* Step 2: Receipt Display & Actions */}
        {showReceipt && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                
                {/* Action Bar */}
                <div className="flex justify-end gap-2 mb-4">
                    <Button variant="outline" onClick={() => setShowReceipt(false)}>
                        เลือกเดือนใหม่
                    </Button>
                    <Button onClick={handleDownloadImage} disabled={isGenerating} className="bg-green-600 hover:bg-green-700">
                        {isGenerating ? "กำลังบันทึก..." : (
                            <>
                                <Download className="mr-2 h-4 w-4" /> บันทึกเป็นรูปภาพ
                            </>
                        )}
                    </Button>
                </div>

                {/* --- ตัวใบเสร็จ (Receipt Container) --- */}
                {/* กำหนด width ให้เหมือน A4 หรือ Paper Size เวลา render */}
                <div className="overflow-auto pb-10">
                    <div 
                        ref={receiptRef} 
                        className="bg-white mx-auto p-8 md:p-12 shadow-2xl text-slate-900 border border-slate-200"
                        style={{ width: "210mm", minHeight: "148mm" }} // A5 Landscape (ครึ่ง A4) หรือปรับเป็น A4 ตามชอบ
                    >
                        {/* Header */}
                        <div className="flex justify-between items-start border-b-2 border-slate-800 pb-4 mb-4">
                            <div className="flex items-center gap-4">
                                {/* Logo Mockup */}
                                <div className="w-16 h-16 bg-blue-900 rounded-full flex items-center justify-center text-white font-bold text-2xl">
                                    CO
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold">สหกรณ์ออมทรัพย์ตัวอย่าง จำกัด</h2>
                                    <p className="text-sm text-slate-600">123 ถ.ตัวอย่าง ต.ในเมือง อ.เมือง จ.กรุงเทพ 10000</p>
                                    <p className="text-sm text-slate-600">โทร. 02-123-4567 เลขประจำตัวผู้เสียภาษี 099400012345</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <h1 className="text-2xl font-bold text-blue-900 uppercase tracking-widest">ใบเสร็จรับเงิน</h1>
                                <p className="text-sm font-semibold mt-1">RECEIPT</p>
                            </div>
                        </div>

                        {/* Info Grid */}
                        <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm mb-6">
                            <div className="flex">
                                <span className="w-32 font-bold text-slate-700">เล่มที่/เลขที่ :</span>
                                <span>{mockReceiptData.receiptNo}</span>
                            </div>
                            <div className="flex">
                                <span className="w-32 font-bold text-slate-700">วันที่ :</span>
                                <span>{mockReceiptData.date}</span>
                            </div>
                            <div className="flex">
                                <span className="w-32 font-bold text-slate-700">ได้รับเงินจาก :</span>
                                <span className="font-semibold">{mockReceiptData.payer}</span>
                            </div>
                            <div className="flex">
                                <span className="w-32 font-bold text-slate-700">สมาชิกเลขที่ :</span>
                                <span>{mockReceiptData.memberId}</span>
                            </div>
                            <div className="flex">
                                <span className="w-32 font-bold text-slate-700">สังกัด/หน่วย :</span>
                                <span>{mockReceiptData.department}</span>
                            </div>
                            <div className="flex">
                                <span className="w-32 font-bold text-slate-700">ทุนเรือนหุ้นสะสม :</span>
                                <span>{mockReceiptData.shareCapital.toLocaleString()}</span>
                            </div>
                        </div>

                        {/* Table Items */}
                        <div className="mb-6 border border-slate-300 rounded-sm overflow-hidden">
                            <Table>
                                <TableHeader className="bg-slate-100">
                                    <TableRow className="border-b border-slate-300">
                                        <TableHead className="text-slate-900 font-bold border-r border-slate-300 w-[40%]">รายการ</TableHead>
                                        <TableHead className="text-slate-900 font-bold border-r border-slate-300 text-center">งวดที่</TableHead>
                                        <TableHead className="text-slate-900 font-bold border-r border-slate-300 text-right">เงินต้น</TableHead>
                                        <TableHead className="text-slate-900 font-bold border-r border-slate-300 text-right">ดอกเบี้ย</TableHead>
                                        <TableHead className="text-slate-900 font-bold border-r border-slate-300 text-right">จำนวนเงิน</TableHead>
                                        <TableHead className="text-slate-900 font-bold text-right">คงเหลือ</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {mockReceiptData.items.map((item, index) => (
                                        <TableRow key={item.id} className="border-b border-slate-200 last:border-0 hover:bg-transparent">
                                            <TableCell className="border-r border-slate-200 py-2">{item.name}</TableCell>
                                            <TableCell className="border-r border-slate-200 text-center py-2">{item.period}</TableCell>
                                            <TableCell className="border-r border-slate-200 text-right py-2">{item.principal.toLocaleString(undefined, {minimumFractionDigits: 2})}</TableCell>
                                            <TableCell className="border-r border-slate-200 text-right py-2">{item.interest.toLocaleString(undefined, {minimumFractionDigits: 2})}</TableCell>
                                            <TableCell className="border-r border-slate-200 text-right font-semibold py-2">{item.total.toLocaleString(undefined, {minimumFractionDigits: 2})}</TableCell>
                                            <TableCell className="text-right py-2 text-slate-500">{item.remainingPrincipal > 0 ? item.remainingPrincipal.toLocaleString() : "-"}</TableCell>
                                        </TableRow>
                                    ))}
                                    
                                    {/* Empty Rows Filler (Optional: เพื่อให้ใบเสร็จดูเต็มถ้ารายการน้อย) */}
                                    {Array.from({ length: Math.max(0, 5 - mockReceiptData.items.length) }).map((_, i) => (
                                        <TableRow key={`empty-${i}`} className="h-9 border-b border-slate-100 hover:bg-transparent">
                                            <TableCell className="border-r border-slate-100"></TableCell>
                                            <TableCell className="border-r border-slate-100"></TableCell>
                                            <TableCell className="border-r border-slate-100"></TableCell>
                                            <TableCell className="border-r border-slate-100"></TableCell>
                                            <TableCell className="border-r border-slate-100"></TableCell>
                                            <TableCell></TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>

                        {/* Footer Totals */}
                        <div className="flex border border-slate-800 bg-slate-50 mb-8">
                            <div className="flex-1 p-3 border-r border-slate-800 flex items-center justify-center">
                                <span className="font-bold text-slate-700 mr-2">ตัวอักษร :</span>
                                <span className="font-medium text-lg text-blue-800">({thaiBahtText})</span>
                            </div>
                            <div className="w-1/3 p-3 flex justify-between items-center bg-slate-200 text-slate-900">
                                <span className="font-bold">รวมเงินทั้งสิ้น</span>
                                <span className="font-bold text-xl">{totalAmount.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                            </div>
                        </div>

                        {/* Signatures */}
                        <div className="flex justify-between items-end mt-12 px-8">
                            <div className="text-center space-y-8">
                                <div className="border-b border-dotted border-slate-400 w-48 mx-auto"></div>
                                <div>
                                    <p className="font-bold">( นายการเงิน รอบคอบ )</p>
                                    <p className="text-sm text-slate-500">เจ้าหน้าที่การเงิน</p>
                                </div>
                            </div>
                            <div className="text-center space-y-8">
                                <div className="border-b border-dotted border-slate-400 w-48 mx-auto"></div>
                                <div>
                                    <p className="font-bold">( นางจัดการ มั่นคง )</p>
                                    <p className="text-sm text-slate-500">ผู้จัดการสหกรณ์</p>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>

                <p className="text-center text-sm text-slate-400 mt-4 pb-8">
                    * เอกสารนี้สร้างจากระบบอิเล็กทรอนิกส์
                </p>
            </div>
        )}

      </div>
    </div>
  );
}