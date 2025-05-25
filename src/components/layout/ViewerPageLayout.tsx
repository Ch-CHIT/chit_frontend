type Props = { children: React.ReactNode };

export default function ViewerPageLayout({ children }: Props) {
  return <div className="flex w-full flex-1 flex-col items-start">{children}</div>;
}
