type Props = {
  isSessionOn: boolean;
  onClickSessionHandler: () => void;
};

export default function BtnOnOffParticiation({ isSessionOn, onClickSessionHandler }: Props) {
  return (
    <div
      className={`w-fit rounded-md ${isSessionOn ? 'bg-primary' : 'bg-disable'} cursor-pointer p-2 text-bold-small`}
      onClick={onClickSessionHandler}
    >
      시참 <span className="text-alert">{isSessionOn ? 'ON' : 'OFF'}</span>
    </div>
  );
}
