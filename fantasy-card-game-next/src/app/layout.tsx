
import BottomMenu from '@/components/BottomMenu';
import Navbar from '../components/Navbar';
import './globals.css'; 
import { SupabaseProvider } from '@/components/SupabaseProvider';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-gray-900">
        <SupabaseProvider>
          <Navbar />
          <div className="flex-1 flex flex-col">{children}</div>
          <BottomMenu />  
        </SupabaseProvider>
      </body>
    </html>
  );
}