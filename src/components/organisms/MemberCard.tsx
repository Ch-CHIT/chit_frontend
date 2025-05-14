import { toast } from 'react-toastify';
import Cancel from '../../../public/assets/icons/Cancel';
import Heart from '../../../public/assets/icons/Heart';
import ZzzicIcon from '../../../public/assets/icons/ZzzicIcon';
import {
  deleteContentsSessionParticipant,
  putContentsSessionParticipantPick,
} from '@/services/streamer/streamer';
import useAuthStore from '@/store/authStore';
import { useQueryClient } from '@tanstack/react-query';

type Props = {
  refreshUsers: () => void;
  memberId: number;
  chzzkNickname: string;
  gameNicname: string;
  isHeart: boolean;
};

export default function MemberCard({
  refreshUsers,
  memberId,
  chzzkNickname,
  gameNicname,
  isHeart,
}: Props) {
  //하트 클릭하면 변경
  const queryClient = useQueryClient();
  const { accessToken } = useAuthStore();
  const onClickPickHandler = async () => {
    if (!accessToken) return;
    const response = await putContentsSessionParticipantPick(accessToken, memberId);
    if (response.success) {
      queryClient.refetchQueries({ queryKey: ['participants'] });
    } else {
    }
  };
  const onClickBanHandler = async () => {
    if (!accessToken) return;

    queryClient.refetchQueries({ queryKey: ['participants'] });
    const response = await deleteContentsSessionParticipant(accessToken, memberId);
    if (response.success) {
      refreshUsers();
      toast.success('유저를 추방했습니다.');
    }
  };
  return (
    <div
      id="member"
      className="member relative mb-1 mr-2 flex-col rounded-md bg-background-sub p-[10px] last:mb-0"
    >
      <div className="mb-2 flex flex-row items-center justify-start">
        <ZzzicIcon width={20} height={20} />
        <div className="mx-2 flex-1 text-bold-small text-black">{chzzkNickname}</div>
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
        <div className="absolute right-[10px] cursor-pointer" onClick={onClickPickHandler}>
          <Heart width={12} height={12} fill={isHeart} />
        </div>
      </div>
    </div>
  );
}
