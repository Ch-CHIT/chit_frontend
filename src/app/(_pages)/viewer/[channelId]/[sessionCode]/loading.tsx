import CommonLayout from '@/components/layout/CommonLayout';
import Image from 'next/image';

const Loading = () => {
  return (
    <CommonLayout>
      <Image src="/assets/loading.svg" alt="loading" width="40" height="40"></Image>
    </CommonLayout>
  );
};

export default Loading;
