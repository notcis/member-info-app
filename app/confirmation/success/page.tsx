"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, ShieldCheck } from "lucide-react";
import Link from "next/link";

export default function SuccessPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans">
      <Card className="w-full max-w-md shadow-xl border-t-4 border-t-green-500">
        <CardContent className="pt-10 pb-10 text-center space-y-6">
          {/* Icon Animation Wrapper */}
          <div className="relative mx-auto w-24 h-24">
            <div className="absolute inset-0 bg-green-100 rounded-full animate-ping opacity-25"></div>
            <div className="relative bg-green-100 rounded-full w-24 h-24 flex items-center justify-center text-green-600">
              <CheckCircle2 size={48} strokeWidth={3} />
            </div>
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-slate-800">
              ยืนยันข้อมูลเรียบร้อยแล้ว
            </h1>
            <p className="text-slate-500">
              ระบบได้รับข้อมูลการยืนยันยอดประจำปี
              <br />
              ของท่านเรียบร้อยแล้ว
            </p>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg text-sm text-blue-800 flex items-start gap-3 text-left">
            <ShieldCheck className="shrink-0 mt-0.5" size={20} />
            <p>
              ขอขอบพระคุณที่เป็นส่วนหนึ่งในการช่วยให้ สหกรณ์ออมทรัพย์ฯ
              เกิดความถูกต้อง โปร่งใส ในการดำเนินงาน
            </p>
          </div>

          <div className="pt-4">
            <Link href="https://lin.ee/3gV8oIg">
              {/* ใส่ Link LINE OA ของจริงตรงนี้ หรือใช้ liff.closeWindow() ถ้าใช้ LIFF */}
              <Button className="w-full bg-[#06C755] hover:bg-[#05b54d] text-white font-bold h-12 text-lg shadow-md transition-all active:scale-95">
                กลับไปที่ LINE OA
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
