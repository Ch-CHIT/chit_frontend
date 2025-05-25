import CommonLayout from '@/components/layout/CommonLayout';
import LoginClientPage from '@/components/organisms/LoginClientPage';
import { UserRoleType } from '@/store/authStore';
import { cookies } from 'next/headers';

type CallBackProps = {
  searchParams: Promise<{
    code: string;
    state: string;
  }>;
};

export default async function CallBackPage(props: CallBackProps) {
  const { searchParams } = props;
  const { code, state } = await searchParams;
  const cookieStore = await cookies();
  let role: UserRoleType = 'VIEWER';

  try {
    role = cookieStore.get('CH_ROLE')?.value as UserRoleType;
  } catch (error) {
    console.error('Error fetching role from cookies', error);
  }
  if (!code || !state) {
    console.error('Missing code or state in search parameters');
    return <div>Error: Missing code or state</div>;
  }

  return (
    <CommonLayout>
      <LoginClientPage code={code} state={state} role={role} />
    </CommonLayout>
  );
}
