import CommonLayout from '@/components/layout/CommonLayout';
import { Suspense } from 'react';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <CommonLayout>
      <Suspense>{children}</Suspense>
    </CommonLayout>
  );
}
