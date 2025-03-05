import Cancel from '@/app/assets/icons/Cancel';
import Heart from '@/app/assets/icons/Heart';
import ZzzicIcon from '@/app/assets/icons/ZzzicIcon';
import {
  deleteContentsSessionParticipant,
  putContentsSessionParticipantPick,
} from '@/services/streamer/streamer';

type Props = {
  accessToken: string;
  refreshUsers: () => void;
  memberId: number;
  zicName: string;
  gameNicname: string;
  isHeart: boolean;
};

export default function MemberCard({
  accessToken,
  refreshUsers,
  memberId,
  zicName,
  gameNicname,
  isHeart,
}: Props) {
  //하트 클릭하면 변경
  const onClickPickHandler = async () => {
    console.log('pick! <3');
    console.log(refreshUsers);
    const response = await putContentsSessionParticipantPick(
      accessToken,
      memberId,
    );
    if (response.status === 200) {
      refreshUsers();
      console.log('유저를 선택했습니다.');
    } else {
      console.log('문제 발생');
    }
  };
  const onClickBanHandler = async () => {
    console.log('delete! <3');
    console.log(refreshUsers);
    const response = await deleteContentsSessionParticipant(
      accessToken,
      memberId,
    );
    if (response.status === 200) {
      refreshUsers();
      console.log('유저를 추방했습니다.');
    } else {
      console.log('유저 추방 문제 발생');
    }
  };
  return (
    <div
      id="member"
      className="member relative mb-1 flex-col rounded-md bg-background-sub p-[10px] last:mb-0"
    >
      <div className="mb-2 flex flex-row items-center justify-start">
        <ZzzicIcon width={20} height={20} />
        <div className="mx-2 flex-1 text-bold-small text-black">{zicName}</div>
        <div
          className="absolute right-[10px] top-[10px] cursor-pointer"
          onClick={onClickBanHandler}
        >
          <Cancel width={12} height={12} />
        </div>
      </div>
      <div className="flex flex-row items-center justify-start">
        <div className="h-5 w-5"></div>
        <div className="mx-2 flex-1 text-medium text-hint">{gameNicname}</div>
        <div
          className="absolute right-[10px] cursor-pointer"
          onClick={onClickPickHandler}
        >
          <Heart width={12} height={12} fill={isHeart} />
        </div>
      </div>
    </div>
  );
}
