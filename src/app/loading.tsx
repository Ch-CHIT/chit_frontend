import CommonLayout from '@/components/layout/CommonLayout';
import PageLayout from '@/components/layout/PageLayout';
import Image from 'next/image';

const Loading = () => {
  return (
    <PageLayout>
      <CommonLayout>
        <Image src="/assets/loading.svg" alt="loading" width="40" height="40" />
      </CommonLayout>
    </PageLayout>
  );
};

export default Loading;
