import { StreamerStatusType } from '@/services/streamer/type';
import Image from 'next/image';

type BigProfileImgProps = {
  imageUrl?: string;
  status: StreamerStatusType;
};

const BigProfileImg = ({ imageUrl, status }: BigProfileImgProps) => {
  const defaultImage = ' /assets/logo/logo_small.svg';
  const image = imageUrl ?? defaultImage;

  return (
    <div
      className={`relative h-32 w-32 overflow-hidden rounded-full p-[3px] ring-4 ${status === 'OPEN' ? 'ring-primary' : 'ring-disable'}`}
    >
      <Image
        src={image}
        fill
        className={`${image ? 'object-cover' : 'object-contain p-3'}`}
        alt="profile"
      />
    </div>
  );
};

export default BigProfileImg;
