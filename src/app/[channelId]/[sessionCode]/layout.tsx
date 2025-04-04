'use client';
import CommonLayout from '@/components/layout/CommonLayout';
import NavBar from '@/components/layout/NavBar';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <CommonLayout>
      <NavBar></NavBar>
      {children}
    </CommonLayout>
  );
}
