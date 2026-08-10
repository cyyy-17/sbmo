"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Printer } from "lucide-react"

export function StudentQRCode({ studentId, studentName }: { studentId: string, studentName: string }) {
  // Use the window origin if available, fallback to a relative path for the QR API which will handle it as a string
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://sbcms.app'
  const profileUrl = `${baseUrl}/dashboard/students/${studentId}`
  
  // Using a free zero-dependency QR Code API
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(profileUrl)}&margin=10`

  const handlePrint = () => {
    // Open a new window and print the QR code
    const printWindow = window.open('', '_blank')
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Student ID: ${studentName}</title>
            <style>
              body { font-family: sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; margin: 0; }
              .card { border: 2px solid #000; padding: 20px; border-radius: 10px; text-align: center; }
              img { width: 150px; height: 150px; margin-bottom: 10px; }
            </style>
          </head>
          <body>
            <div class="card">
              <h2>${studentName}</h2>
              <img src="${qrUrl}" alt="QR Code" />
              <p>Scan for Student Profile</p>
              <p style="font-size: 10px; color: gray;">ID: ${studentId}</p>
            </div>
            <script>
              window.onload = () => {
                window.print();
                window.close();
              }
            </script>
          </body>
        </html>
      `)
      printWindow.document.close()
    }
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Quick Access QR</CardTitle>
        <CardDescription>Scan to open profile</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center space-y-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img 
          src={qrUrl} 
          alt={`QR Code for ${studentName}`} 
          className="w-[150px] h-[150px] border p-2 bg-white rounded-md"
        />
        <Button variant="outline" size="sm" className="w-full" onClick={handlePrint}>
          <Printer className="w-4 h-4 mr-2" />
          Print ID Badge
        </Button>
      </CardContent>
    </Card>
  )
}
