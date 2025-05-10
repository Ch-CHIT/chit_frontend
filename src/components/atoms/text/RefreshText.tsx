import RefreshIcon from '../../../../public/assets/icons/RefreshIcon';
type Props = {
  onClickHandler: () => Promise<void>;
};

export default function RefreshText({ onClickHandler }: Props) {
  return (
    <div className="flex cursor-pointer flex-row items-center justify-center text-primary">
      <RefreshIcon width={14} height={14} aria-label="Refresh Icon" />
      <div className="text-bold-small" onClick={onClickHandler}>
        방송 상태 새로고침하기
      </div>
    </div>
  );
}
