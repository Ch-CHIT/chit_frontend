import { StreamerStatusType } from '@/services/streamer/type';
import Image from 'next/image';

type MediumProfileImgProps = {
  imageUrl?: string;
  status: StreamerStatusType;
};

const MediumProfileImg = ({ imageUrl, status }: MediumProfileImgProps) => {
  const defaultImage = '/assets/logo/logo_small.svg';
  const image = imageUrl?.trim() ? imageUrl : defaultImage;

  return (
    <div
      className={`relative h-16 w-16 overflow-hidden rounded-full p-[3px] ring-4 ${status === 'OPEN' ? 'ring-primary' : 'ring-disable'}`}
    >
      <Image
        src={image}
        fill
        className={`${imageUrl?.trim() ? 'object-cover' : 'object-contain p-3'}`}
        alt="profile"
      />
    </div>
  );
};

export default MediumProfileImg;
