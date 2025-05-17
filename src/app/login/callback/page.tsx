import CommonLayout from '@/components/layout/CommonLayout';
import LoginClientPage from '@/components/organisms/LoginClientPage';
import { UserRoleType } from '@/store/authStore';
import { cookies } from 'next/headers';

type CallBackProps = {
  searchParams: {
    code: string;
    state: string;
  };
};

export default async function CallBackPage({ searchParams }: CallBackProps) {
  const code = searchParams.code;
  const state = searchParams.state;
  const cooikeStore = cookies();
  const role = ((await cooikeStore).get('CH_ROLE')?.value ?? 'VIEWER') as UserRoleType;

  return (
    <CommonLayout>
      <LoginClientPage code={code} state={state} role={role} />
    </CommonLayout>
  );
}
