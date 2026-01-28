"use client";

import React, { useState, useRef } from "react";
import { toPng } from "html-to-image";
import jsPDF from "jspdf"; 
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Download, ChevronLeft, Search, Loader2 } from "lucide-react";
import Link from "next/link";
import { numberToThaiBaht } from "@/lib/utils";

// --- Mock Data ---
const mockReceiptData = {
    receiptNo: "RC-6701-0089",
    date: "31 มกราคม 2567",
    payer: "นายสมชาย ใจดี",
    memberId: "6700123",
    department: "โรงเรียนอนุบาลหนองบัว",
    shareCapital: 153000,
    items: [
      { id: 1, name: "ค่าหุ้นรายเดือน", period: "108", principal: 1500.00, interest: 0.00, total: 1500.00 },
      { id: 2, name: "ชำระเงินกู้สามัญ (ส.65023)", period: "28", principal: 6000.00, interest: 2350.50, total: 8350.50 },
      { id: 3, name: "ชำระเงินกู้ฉุกเฉิน (ฉ.66001)", period: "12", principal: 2000.00, interest: 150.00, total: 2150.00 },
      { id: 4, name: "ค่าธรรมเนียมแรกเข้า", period: "-", principal: 100.00, interest: 0.00, total: 100.00 },
      // เพิ่มรายการทดสอบให้ตารางยาวๆ เพื่อดูว่า Scrollbar หายจริงไหม
      { id: 5, name: "เงินฝากออมทรัพย์พิเศษ", period: "-", principal: 500.00, interest: 0.00, total: 500.00 },
      { id: 6, name: "ค่าบำรุงสมาชิกรายปี", period: "-", principal: 200.00, interest: 0.00, total: 200.00 },
    ]
};

export default function ReceiptPage() {
  const [selectedMonth, setSelectedMonth] = useState("");
  const [showReceipt, setShowReceipt] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const receiptRef = useRef<HTMLDivElement>(null);

  const totalAmount = mockReceiptData.items.reduce((sum, item) => sum + item.total, 0);
  const thaiBahtText = numberToThaiBaht(totalAmount);

  // --- ฟังก์ชันสร้างรูปภาพ (ฉบับแก้ไข: ปลดล็อค Scrollbar แบบ Hardcore) ---
  const generateCleanImage = async () => {
    if (!receiptRef.current) return null;

    try { await document.fonts.ready; } catch (e) { }

    // 1. Clone Node
    const originalNode = receiptRef.current;
    const clone = originalNode.cloneNode(true) as HTMLElement;

    // 2. Setup Container สำหรับ Clone (ซ่อนไว้หลังจอ)
    const container = document.createElement("div");
    container.style.position = 'fixed';
    container.style.top = '0';
    container.style.left = '0';
    container.style.zIndex = '-9999'; 
    // กำหนดความกว้าง Fixed 794px (A4) เพื่อให้ Layout นิ่ง
    container.style.width = '794px'; 
    container.style.height = 'auto';
    container.style.overflow = 'visible'; // ห้าม Container ซ่อนเนื้อหา
    container.style.backgroundColor = '#ffffff';
    
    // 3. ปรับ Style ของตัว Clone หลัก
    clone.style.width = '100%';
    clone.style.height = 'auto';
    clone.style.overflow = 'visible';
    clone.style.maxHeight = 'none';
    
    // 4. *** จุดสำคัญ (The Fix) ***: วนลูปหา "ทุก Element" ใน Clone
    // แล้วสั่ง overflow: visible !important ทับทุกอย่าง
    const allElements = clone.getElementsByTagName("*");
    for (let i = 0; i < allElements.length; i++) {
        const el = allElements[i] as HTMLElement;
        // บังคับปลดล็อคการซ่อน/เลื่อนเนื้อหา
        el.style.setProperty("overflow", "visible", "important");
        el.style.setProperty("overflow-x", "visible", "important");
        el.style.setProperty("overflow-y", "visible", "important");
        // บังคับปลดล็อคความสูง (เผื่อมีการ fix height ไว้)
        el.style.setProperty("max-height", "none", "important");
    }

    container.appendChild(clone);
    document.body.appendChild(container);

    // 5. รอให้ Layout คำนวณใหม่หลังปลดล็อค
    await new Promise((resolve) => setTimeout(resolve, 500));

    try {
        const dataUrl = await toPng(container, {
            cacheBust: true,
            backgroundColor: '#ffffff',
            pixelRatio: 2,
            width: 794,
            height: container.scrollHeight // จับภาพตามความสูงจริงที่ยืดออกมาแล้ว
        });

        return { dataUrl, width: 794, height: container.scrollHeight };
    } catch (err) {
        console.error("Error generating image:", err);
        return null;
    } finally {
        if (document.body.contains(container)) {
            document.body.removeChild(container);
        }
    }
  };

  const handleDownload = async () => {
    setIsGenerating(true);
    
    try {
      const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
      const isLine = /Line/i.test(navigator.userAgent);
      
      const result = await generateCleanImage();
      
      if (!result || !result.dataUrl) {
          throw new Error("ไม่สามารถสร้างรูปภาพได้");
      }

      const { dataUrl, width, height } = result;

      if (isLine || isMobile) {
          // --- Mobile: Show Image Dialog ---
          setGeneratedImage(dataUrl);
          setIsDialogOpen(true);
      } else {
          // --- Desktop: Download PDF ---
          const pdf = new jsPDF({
              orientation: 'p',
              unit: 'mm',
              format: 'a4'
          });

          const pdfWidth = pdf.internal.pageSize.getWidth(); // 210mm
          const imgRatio = width / height;
          const printHeight = pdfWidth / imgRatio;

          // ถ้าใบเสร็จยาวเกิน 1 หน้า A4 (กรณีรายการเยอะมาก)
          // Logic นี้จะย่อให้พอดี 1 หน้า (Fit to page)
          // ถ้าต้องการให้ตัดหน้า (Multi-page) จะต้องเขียน Logic เพิ่ม
          pdf.addImage(dataUrl, 'PNG', 0, 0, pdfWidth, printHeight);
          pdf.save(`ใบเสร็จ_${mockReceiptData.receiptNo}.pdf`);
      }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error("Download Error:", error);
      alert("เกิดข้อผิดพลาดในการดาวน์โหลด");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 p-4 md:p-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Navigation */}
        <div className="flex items-center gap-4 mb-4">
            <Link href="/" className="p-2 rounded-full bg-white shadow hover:bg-slate-50 text-slate-600">
                <ChevronLeft size={24} />
            </Link>
            <h1 className="text-2xl font-bold text-slate-800">ระบบใบเสร็จรับเงิน</h1>
        </div>

        {/* Step 1: Selection */}
        {!showReceipt && (
             <Card className="w-full max-w-md mx-auto mt-10 shadow-lg">
                <CardHeader>
                    <CardTitle className="text-center text-blue-700">ค้นหาใบเสร็จรับเงิน</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Select onValueChange={setSelectedMonth}>
                        <SelectTrigger>
                            <SelectValue placeholder="-- เลือกเดือน --" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="2024-01">มกราคม 2567</SelectItem>
                        </SelectContent>
                    </Select>
                    <Button 
                        className="w-full bg-blue-600 hover:bg-blue-700" 
                        disabled={!selectedMonth}
                        onClick={() => setShowReceipt(true)}
                    >
                        <Search className="mr-2 h-4 w-4" /> ดูใบเสร็จ
                    </Button>
                </CardContent>
            </Card>
        )}

        {/* Step 2: Receipt Display */}
        {showReceipt && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                
                <div className="flex justify-end gap-2 mb-4">
                    <Button variant="outline" onClick={() => setShowReceipt(false)}>
                        ย้อนกลับ
                    </Button>
                    <Button onClick={handleDownload} disabled={isGenerating} className="bg-red-600 hover:bg-red-700 text-white min-w-[140px]">
                        {isGenerating ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> กำลังสร้าง...
                            </>
                        ) : (
                            <>
                                <Download className="mr-2 h-4 w-4" /> 
                                <span className="hidden md:inline">ดาวน์โหลด PDF</span>
                                <span className="md:hidden">บันทึกรูปภาพ</span>
                            </>
                        )}
                    </Button>
                </div>

                {/* Visual Receipt (สิ่งที่ User เห็น) */}
                <div className="overflow-auto pb-10">
                    <div 
                        ref={receiptRef} 
                        className="bg-white mx-auto p-8 md:p-12 shadow-2xl text-slate-900 border border-slate-200"
                        style={{ width: "210mm", minHeight: "148mm" }} 
                    >
                        {/* Header */}
                        <div className="flex justify-between items-start border-b-2 border-slate-800 pb-4 mb-4">
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 bg-blue-900 rounded-full flex items-center justify-center text-white font-bold text-2xl">
                                    CO
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold">สหกรณ์ออมทรัพย์ตัวอย่าง จำกัด</h2>
                                    <p className="text-sm text-slate-600">123 ถ.ตัวอย่าง ต.ในเมือง อ.เมือง จ.กรุงเทพ 10000</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <h1 className="text-2xl font-bold text-blue-900 uppercase tracking-widest">ใบเสร็จรับเงิน</h1>
                            </div>
                        </div>

                        {/* Info Grid */}
                        <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm mb-6">
                            <div className="flex"><span className="w-32 font-bold text-slate-700">เลขที่ :</span><span>{mockReceiptData.receiptNo}</span></div>
                            <div className="flex"><span className="w-32 font-bold text-slate-700">วันที่ :</span><span>{mockReceiptData.date}</span></div>
                            <div className="flex"><span className="w-32 font-bold text-slate-700">สมาชิก :</span><span>{mockReceiptData.payer} ({mockReceiptData.memberId})</span></div>
                        </div>

                        {/* Table */}
                        {/* *** สำคัญ: ต้องลบ overflow-hidden ตรงนี้ออก ถ้าต้องการให้ user เห็นตารางเต็มในหน้าเว็บด้วย *** */}
                        {/* แต่ถ้า user อยากให้หน้าเว็บมี scrollbar แต่ PDF ไม่มี โค้ด generateCleanImage ด้านบนจะจัดการให้เอง */}
                        <div className="mb-6 border border-slate-300 rounded-sm overflow-hidden">
                            <Table>
                                <TableHeader className="bg-slate-100">
                                    <TableRow>
                                        <TableHead className="text-slate-900 font-bold border-r w-[60%]">รายการ</TableHead>
                                        <TableHead className="text-slate-900 font-bold text-right">จำนวนเงิน</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {mockReceiptData.items.map((item) => (
                                        <TableRow key={item.id} className="border-b border-slate-200">
                                            <TableCell className="border-r py-2">{item.name} {item.period !== '-' && `(งวด ${item.period})`}</TableCell>
                                            <TableCell className="text-right font-semibold py-2">{item.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>

                        {/* Footer */}
                         <div className="flex border border-slate-800 bg-slate-50 mb-8">
                            <div className="flex-1 p-3 border-r border-slate-800 text-center flex items-center justify-center">
                                <span className="font-medium text-blue-800 text-sm">({thaiBahtText})</span>
                            </div>
                            <div className="w-1/3 p-3 flex justify-between bg-slate-200">
                                <span className="font-bold">รวมทั้งสิ้น</span>
                                <span className="font-bold">{totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                            </div>
                        </div>

                         {/* Signatures */}
                         <div className="flex justify-between items-end mt-12 px-8">
                             <div className="text-center space-y-8">
                                 <div className="border-b border-dotted border-slate-400 w-32 mx-auto"></div>
                                 <p className="text-xs text-slate-500">เจ้าหน้าที่การเงิน</p>
                             </div>
                             <div className="text-center space-y-8">
                                 <div className="border-b border-dotted border-slate-400 w-32 mx-auto"></div>
                                 <p className="text-xs text-slate-500">ผู้จัดการ</p>
                             </div>
                         </div>
                    </div>
                </div>
            </div>
        )}

        {/* Dialog for Mobile */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogContent className="max-w-sm rounded-lg flex flex-col items-center">
                <DialogHeader>
                    <DialogTitle className="text-center">ใบเสร็จรับเงิน</DialogTitle>
                    <DialogDescription className="text-center text-blue-600 font-bold">
                        แตะค้างที่รูปภาพเพื่อบันทึก
                    </DialogDescription>
                </DialogHeader>
                <div className="w-full max-h-[60vh] overflow-auto border rounded-md bg-slate-50 p-2 flex justify-center bg-gray-200">
                    {generatedImage ? (
                        <img 
                            src={generatedImage} 
                            alt="Receipt" 
                            className="w-full h-auto object-contain shadow-sm bg-white" 
                        />
                    ) : (
                        <div className="p-8 text-gray-500">ไม่สามารถแสดงรูปภาพได้</div>
                    )}
                </div>
                <DialogFooter>
                    <DialogClose asChild><Button variant="secondary" className="w-full">ปิดหน้าต่าง</Button></DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>

      </div>
    </div>
  );
}