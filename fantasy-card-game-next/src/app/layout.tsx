
import BottomMenu from '@/components/BottomMenu';
import Navbar from '../components/Navbar';
import './globals.css'; 

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-gray-900">
        <Navbar />
        <div className="flex-1 flex flex-col">{children}</div>
        <BottomMenu />  
      </body>
    </html>
  );
}