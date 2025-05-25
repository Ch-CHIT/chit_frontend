import useParentPath from '@/hooks/useParentPath';
import BtnCopyLink from '../atoms/button/BtnCopyLink';
import BtnOnOffParticiation from '../atoms/button/BtnOnOffParticiation';
import BtnSetting from '../atoms/button/BtnSetting';
import { useRouter } from 'next/navigation';

//추후 데이터 넘기기

export default function StreamerTools({
  sessionCode,
  channelId,
  isSessionOn,
  onClickSessionHandler,
}: {
  sessionCode: string;
  channelId: string;
  isSessionOn: boolean;
  onClickSessionHandler: () => void;
}) {
  const router = useRouter();
  const parentPath = useParentPath();
  const onClickSettingHandler = () => {
    router.push(parentPath + '/settings');
  };

  return (
    <div className="flex justify-between">
      <BtnOnOffParticiation
        isSessionOn={isSessionOn}
        onClickSessionHandler={onClickSessionHandler}
      />
      <div className="flex flex-row rounded-md bg-background-sub p-2">
        <BtnCopyLink
          link={`${process.env.NEXT_PUBLIC_FRONT_API_URL}/viewer/${channelId}/${sessionCode}`}
        />
        <BtnSetting onClickHandler={onClickSettingHandler} />
      </div>
    </div>
  );
}
