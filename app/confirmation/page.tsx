"use client";

import React, { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { toPng } from "html-to-image";
import jsPDF from "jspdf";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Download,
  Save,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { mockConfirmData, formatCurrency } from "@/lib/data-confirm";

export default function ConfirmationPage() {
  const router = useRouter();
  const [status, setStatus] = useState<"correct" | "incorrect" | "">("");
  const [remark, setRemark] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Dialog State
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const contentRef = useRef<HTMLDivElement>(null);

  // --- Logic สร้างรูปภาพ/PDF (Advanced Cloning) ---
  const generateDocument = async () => {
    if (!contentRef.current) return null;
    try {
      await document.fonts.ready;
    } catch (e) {}

    // 1. Clone Node
    const originalNode = contentRef.current;
    const clone = originalNode.cloneNode(true) as HTMLElement;

    // 2. Setup Container (Off-screen)
    const container = document.createElement("div");
    Object.assign(container.style, {
      position: "fixed",
      top: "0",
      left: "0",
      zIndex: "-9999",
      width: "794px", // A4 width
      backgroundColor: "#ffffff",
      overflow: "visible",
    });

    // 3. Sync User Inputs to Clone (สำคัญมาก: เพื่อให้สิ่งที่ user พิมพ์ติดไปด้วย)
    // 3.1 Sync Radio Buttons
    const originalRadios = originalNode.querySelectorAll('input[type="radio"]');
    const cloneRadios = clone.querySelectorAll('input[type="radio"]');
    originalRadios.forEach((radio, i) => {
      if ((radio as HTMLInputElement).checked) {
        (cloneRadios[i] as HTMLInputElement).setAttribute("checked", "true");
        // Hack: ใส่ Style ให้เห็นชัดๆ ในรูป
        (
          cloneRadios[i].nextElementSibling as HTMLElement
        ).style.backgroundColor = "#2563eb";
        (cloneRadios[i].nextElementSibling as HTMLElement).style.borderColor =
          "#2563eb";
      }
    });

    // 3.2 Sync Textarea
    const originalTextarea = originalNode.querySelector("textarea");
    const cloneTextarea = clone.querySelector("textarea");
    if (originalTextarea && cloneTextarea) {
      cloneTextarea.innerHTML = originalTextarea.value; // ใส่ค่าที่พิมพ์ลงไปใน HTML
      cloneTextarea.style.border = "1px solid #000"; // เพิ่มขอบให้ชัด
    }

    // 4. Force Styles for PDF/Image
    clone.style.width = "100%";
    clone.style.height = "auto";
    const allElements = clone.getElementsByTagName("*");
    for (let i = 0; i < allElements.length; i++) {
      const el = allElements[i] as HTMLElement;
      el.style.setProperty("overflow", "visible", "important");
    }

    container.appendChild(clone);
    document.body.appendChild(container);

    // Wait for render
    await new Promise((resolve) => setTimeout(resolve, 500));

    try {
      const dataUrl = await toPng(container, {
        cacheBust: true,
        backgroundColor: "#ffffff",
        pixelRatio: 2,
        width: 794,
        height: container.scrollHeight,
      });
      return { dataUrl, width: 794, height: container.scrollHeight };
    } catch (err) {
      console.error(err);
      return null;
    } finally {
      document.body.removeChild(container);
    }
  };

  const handleSaveCopy = async () => {
    if (!status) {
      alert("กรุณาเลือกผลการตรวจสอบก่อนบันทึก");
      return;
    }
    setIsGenerating(true);
    try {
      const isMobile = /Android|iPhone|iPad|iPod|Line/i.test(
        navigator.userAgent,
      );
      const result = await generateDocument();

      if (result?.dataUrl) {
        if (isMobile) {
          setGeneratedImage(result.dataUrl);
          setIsDialogOpen(true);
        } else {
          const pdf = new jsPDF("p", "mm", "a4");
          const pdfWidth = pdf.internal.pageSize.getWidth();
          const pdfHeight = (result.height * pdfWidth) / result.width;
          pdf.addImage(result.dataUrl, "PNG", 0, 0, pdfWidth, pdfHeight);
          pdf.save(`ยืนยันยอด_${mockConfirmData.profile.memberId}.pdf`);
        }
      }
    } catch (e) {
      alert("เกิดข้อผิดพลาดในการบันทึก");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSubmit = async () => {
    if (!status) {
      alert("กรุณาเลือกผลการตรวจสอบ (ถูกต้อง หรือ ไม่ถูกต้อง)");
      return;
    }
    if (status === "incorrect" && !remark.trim()) {
      alert("กรุณาระบุข้อทักท้วง");
      return;
    }

    setIsSubmitting(true);
    // Simulate API Call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    router.push("/confirmation/success");
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans pb-24">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2 mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-blue-900">
            ระบบยืนยันยอดสมาชิก
          </h1>
          <p className="text-slate-500 text-sm">
            ตรวจสอบข้อมูล หุ้น หนี้ และเงินฝากประจำปี
          </p>
        </div>

        {/* --- Main Document Card --- */}
        <Card className="shadow-lg border-t-4 border-t-blue-600">
          <div ref={contentRef} className="bg-white p-6 md:p-10 text-slate-900">
            {/* ส่วนที่ 1: ข้อมูลสมาชิก */}
            <div className="border-b pb-6 mb-6">
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-bold text-xl">
                  CO
                </div>
                <div className="text-right">
                  <div className="inline-block px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-bold border border-blue-200">
                    ใบยืนยันยอด
                  </div>
                </div>
              </div>
              <h2 className="text-xl font-bold text-slate-800 mb-4">
                ส่วนที่ 1: ข้อมูลสมาชิก
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-slate-500 block">เลขทะเบียนสมาชิก</span>
                  <span className="font-semibold text-lg">
                    {mockConfirmData.profile.memberId}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">ชื่อ-นามสกุล</span>
                  <span className="font-semibold text-lg">
                    {mockConfirmData.profile.name}
                  </span>
                </div>
                <div className="md:col-span-2">
                  <span className="text-slate-500 block">สังกัด/หน่วยงาน</span>
                  <span className="font-semibold">
                    {mockConfirmData.profile.department}
                  </span>
                </div>
              </div>
            </div>

            {/* ส่วนที่ 2: รายละเอียดทางการเงิน */}
            <div className="border-b pb-6 mb-6">
              <h2 className="text-xl font-bold text-slate-800 mb-4">
                ส่วนที่ 2: รายละเอียดทางการเงิน
              </h2>
              <p className="text-sm text-slate-600 mb-4 bg-slate-50 p-3 rounded border">
                เรียน ท่านสมาชิก สหกรณ์ขอเรียนว่า ณ วันที่{" "}
                <strong>{mockConfirmData.auditDate}</strong> ท่านมียอดคงเหลือ
                ดังนี้:
              </p>

              <div className="space-y-4">
                {/* 1. หุ้น */}
                <div>
                  <h3 className="text-sm font-bold text-blue-800 uppercase mb-2">
                    1. ทุนเรือนหุ้น
                  </h3>
                  {mockConfirmData.financials.shares.map((item) => (
                    <div
                      key={item.id}
                      className="flex justify-between py-2 border-b border-dotted last:border-0"
                    >
                      <span className="text-sm">{item.label}</span>
                      <span className="font-bold">
                        {formatCurrency(item.amount)} บาท
                      </span>
                    </div>
                  ))}
                </div>

                {/* 2. เงินกู้ */}
                <div>
                  <h3 className="text-sm font-bold text-red-700 uppercase mb-2 mt-4">
                    2. เงินกู้ (หนี้คงเหลือ)
                  </h3>
                  {mockConfirmData.financials.loans.map((item) => (
                    <div
                      key={item.id}
                      className="flex justify-between py-2 border-b border-dotted last:border-0"
                    >
                      <span className="text-sm text-slate-700">
                        {item.label}
                      </span>
                      <span className="font-bold text-slate-900">
                        {formatCurrency(item.balance)} บาท
                      </span>
                    </div>
                  ))}
                </div>

                {/* 3. เงินฝาก */}
                <div>
                  <h3 className="text-sm font-bold text-green-700 uppercase mb-2 mt-4">
                    3. เงินฝาก (เงินฝากคงเหลือ)
                  </h3>
                  {mockConfirmData.financials.deposits.map((item) => (
                    <div
                      key={item.id}
                      className="flex justify-between py-2 border-b border-dotted last:border-0"
                    >
                      <span className="text-sm text-slate-700">
                        {item.label}
                      </span>
                      <span className="font-bold text-slate-900">
                        {formatCurrency(item.balance)} บาท
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ส่วนที่ 3: ตรวจสอบและยืนยัน */}
            <div>
              <h2 className="text-xl font-bold text-slate-800 mb-2">
                ส่วนที่ 3: การตอบกลับผู้สอบบัญชี
              </h2>
              <p className="text-sm text-slate-600 mb-4">
                เรียน ผู้สอบบัญชีฯ ข้าพเจ้าได้ตรวจสอบยอดเงินคงเหลือ ณ วันที่{" "}
                {mockConfirmData.auditDate} แล้ว ขอรับรองว่า:
              </p>

              <RadioGroup
                value={status}
                onValueChange={(val: "correct" | "incorrect") => setStatus(val)}
                className="space-y-3"
              >
                <div
                  className={`flex items-start space-x-2 p-3 rounded-lg border ${status === "correct" ? "bg-green-50 border-green-200" : "border-slate-200"}`}
                >
                  <RadioGroupItem value="correct" id="r1" className="mt-1" />
                  <div className="grid gap-1.5 leading-none">
                    <Label
                      htmlFor="r1"
                      className="font-bold cursor-pointer text-base"
                    >
                      ถูกต้อง
                    </Label>
                    <span className="text-xs text-slate-500">
                      ยอดเงินทั้งหมดตรงตามข้อมูลของข้าพเจ้า
                    </span>
                  </div>
                </div>
                <div
                  className={`flex items-start space-x-2 p-3 rounded-lg border ${status === "incorrect" ? "bg-red-50 border-red-200" : "border-slate-200"}`}
                >
                  <RadioGroupItem value="incorrect" id="r2" className="mt-1" />
                  <div className="w-full grid gap-1.5 leading-none">
                    <Label
                      htmlFor="r2"
                      className="font-bold cursor-pointer text-base"
                    >
                      ไม่ถูกต้อง
                    </Label>
                    <span className="text-xs text-slate-500">
                      มียอดเงินบางรายการคลาดเคลื่อน
                    </span>

                    {status === "incorrect" && (
                      <div className="mt-2 animate-in slide-in-from-top-2 fade-in">
                        <Label className="text-xs text-red-600 mb-1 block">
                          ระบุข้อทักท้วง:
                        </Label>
                        <Textarea
                          placeholder="โปรดระบุรายละเอียดส่วนที่ไม่ถูกต้อง..."
                          className="w-full bg-white text-sm"
                          value={remark}
                          onChange={(e) => setRemark(e.target.value)}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </RadioGroup>
            </div>
          </div>
        </Card>

        {/* Actions Bar (Fixed Bottom on Mobile) */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t shadow-lg md:relative md:bg-transparent md:border-0 md:shadow-none md:p-0 z-50">
          <div className="max-w-3xl mx-auto flex gap-3">
            <Button
              variant="outline"
              className="flex-1 bg-white hover:bg-slate-50 text-slate-700 border-slate-300"
              onClick={handleSaveCopy}
              disabled={isGenerating}
            >
              {isGenerating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              เก็บหลักฐาน
            </Button>
            <Button
              className="flex-[2] bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-md"
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  {" "}
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />{" "}
                  กำลังส่งข้อมูล...{" "}
                </>
              ) : (
                "ยืนยันและส่งข้อมูล"
              )}
            </Button>
          </div>
        </div>

        {/* Dialog for Image Save (Mobile) */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-sm rounded-lg flex flex-col items-center">
            <DialogHeader>
              <DialogTitle className="text-center">
                บันทึกเอกสารยืนยัน
              </DialogTitle>
              <DialogDescription className="text-center text-blue-600 font-bold">
                แตะค้างที่รูปภาพเพื่อบันทึก
              </DialogDescription>
            </DialogHeader>
            <div className="w-full max-h-[60vh] overflow-auto border rounded-md bg-slate-50 p-2 flex justify-center">
              {generatedImage && (
                <img
                  src={generatedImage}
                  alt="Confirmation"
                  className="w-full h-auto object-contain bg-white shadow-sm"
                />
              )}
            </div>
            <DialogFooter className="w-full">
              <DialogClose asChild>
                <Button variant="secondary" className="w-full">
                  ปิดหน้าต่าง
                </Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
