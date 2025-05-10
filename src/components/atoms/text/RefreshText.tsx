import RefreshIcon from '../../../../public/assets/icons/RefreshIcon';
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
type Props = {};

export default function RefreshText({}: Props) {
  return (
    <div className="flex cursor-pointer flex-row items-center justify-center text-primary">
      <RefreshIcon width={14} height={14} aria-label="Refresh Icon" />
      <div className="text-bold-small">방송 상태 새로고침하기</div>
    </div>
  );
}
