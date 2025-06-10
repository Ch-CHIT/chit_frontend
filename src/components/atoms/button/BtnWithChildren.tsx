'use client';

type BtnWithTextType = 'alert' | 'disable' | 'default' | 'submit';

type Props = {
  children: React.ReactNode;
  type?: BtnWithTextType;
  onClickHandler?: (
    e: React.MouseEvent<HTMLButtonElement> | React.MouseEvent<HTMLDivElement>,
  ) => void | Promise<void>;
};

export default function BtnWithChildren({ onClickHandler, children, type = 'default' }: Props) {
  const buttonStyles = {
    alert: 'alert', // 경고 버튼
    disable: 'disable', // 비활성화 버튼
    default: 'primary', // 기본 버튼
    submit: 'default',
  };

  if (type === 'disable')
    return (
      <div
        className={`button-container flex w-full cursor-default flex-row items-center justify-center rounded-md text-medium-large bg-${buttonStyles[type]} p-[14px] text-white`}
      >
        {children}
      </div>
    );

  return (
    <div
      className={`button-container flex w-full cursor-pointer flex-row items-center justify-center rounded-md text-medium-large bg-${buttonStyles[type]} p-[14px] text-white`}
      onClick={onClickHandler}
    >
      {children}
    </div>
  );
}

export const BtnSubmit = ({ children, type = 'default' }: Props) => {
  const buttonStyles = {
    alert: 'alert', // 경고 버튼
    disable: 'disable', // 비활성화 버튼
    default: 'primary', // 기본 버튼
    submit: 'primary',
  };

  return (
    <button
      className={`button-container flex w-full cursor-pointer flex-row items-center justify-center rounded-md text-medium-large bg-${buttonStyles[type]} p-[14px] text-white`}
      type="submit"
    >
      {children}
    </button>
  );
};
