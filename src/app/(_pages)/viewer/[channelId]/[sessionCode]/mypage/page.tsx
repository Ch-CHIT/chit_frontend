import Input from '@/components/atoms/input/Input';
import ViewerPageLayout from '@/components/layout/ViewerPageLayout';
import GameCard from '@/components/organisms/GameCard';

export default function page() {
  return (
    <ViewerPageLayout>
      <section className="w-full">
        <p className="mb-5 text-bold-middle">
          지금까지 <span className="text-primary">4개</span>의 게임에 참여했어요
          :)
        </p>
        <Input placeholder="게임명으로 검색할 수 있어요" />
      </section>
      <section className="mt-5 w-full flex-1">
        <div id="gameCardList">
          <GameCard category="리그오브레전드" gameNicname="눈사람" />
          <GameCard category="전략적 팀 전투" gameNicname="배그 닉네임 123" />
        </div>
      </section>
      <div className="mt-1 text-medium-small underline underline-offset-2 text-input-placeholder">
        회원탈퇴하기
      </div>
    </ViewerPageLayout>
  );
}
