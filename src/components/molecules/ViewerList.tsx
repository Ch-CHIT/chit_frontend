import AutoSizer from 'react-virtualized-auto-sizer';
import MemberCard from '../organisms/MemberCard';
import InfiniteLoader from 'react-window-infinite-loader';
import { FixedSizeList as List } from 'react-window';
import { ParticipantResponseType } from '../../store/sseStore';
import PartyText from '../atoms/text/PartyText';
import { useCallback } from 'react';

const CARD_SIZE = 69;
const FONT_SIZE = 14;
const SPACE = 4;
const PADDING = 8;

type Props = {
  participants: ParticipantResponseType[];
  maxGroupParticipants: number;
  loadMoreItems: () => void;
};

export default function ViewerList({ participants, maxGroupParticipants, loadMoreItems }: Props) {
  //유저 그룹 생성
  const createGroupedUser = useCallback(
    (participants: ParticipantResponseType[]) => {
      if (!maxGroupParticipants) {
        console.error('maxGroupParticipants 값없음');
        return;
      }

      // ✅ 중복 제거 (viewerId 기준)
      const uniqueParticipants: ParticipantResponseType[] = Array.from(
        new Map(participants.map((p) => [p.viewerId, p])).values(),
      );

      const grouped: ParticipantResponseType[][] = [];
      for (let i = 0; i < uniqueParticipants.length; i += maxGroupParticipants!) {
        const group = uniqueParticipants.slice(i, i + maxGroupParticipants!);
        if (!group) break;
        grouped.push(group);
      }

      return grouped;
    },
    [maxGroupParticipants],
  );

  const groupedParticipants = createGroupedUser(participants);

  return (
    groupedParticipants && (
      <InfiniteLoader
        isItemLoaded={(index) => index >= groupedParticipants.length}
        itemCount={groupedParticipants.length}
        loadMoreItems={loadMoreItems}
      >
        {({ onItemsRendered, ref }) => (
          <AutoSizer>
            {({ height, width }) => (
              <List
                ref={ref}
                className="scroll-container flex w-full flex-1 flex-col pr-2"
                itemSize={
                  FONT_SIZE + //폰트사이즈
                  CARD_SIZE * maxGroupParticipants! + //카드크기
                  SPACE * (maxGroupParticipants! - 1) + // 카드사이간격
                  PADDING * 2 + //폰트 마진top 8 , bottom 8
                  PADDING //마지막 블록 padding8
                }
                height={height}
                onItemsRendered={onItemsRendered}
                itemCount={groupedParticipants.length}
                width={width}
              >
                {({ index, style }) => {
                  const group = groupedParticipants[index];
                  return (
                    <div
                      key={index}
                      id="partyblock"
                      style={{
                        ...style,
                        height: Number(style.height!) - PADDING,
                        paddingBottom: PADDING,
                      }}
                      className="flex h-full w-[inherit] flex-row"
                    >
                      <div id="partyMembers" className="flex-1 flex-col">
                        <PartyText index={index} />
                        {group.map((viewer) => {
                          return (
                            <MemberCard
                              key={viewer.viewerId}
                              refreshUsers={() => {}}
                              memberId={viewer.viewerId}
                              chzzkNickname={`${viewer.chzzkNickname}`}
                              gameNicname={`${viewer.gameNickname}`}
                              isHeart={viewer.fixedPick}
                            />
                          );
                        })}
                      </div>
                    </div>
                  );
                }}
              </List>
            )}
          </AutoSizer>
        )}
      </InfiniteLoader>
    )
  );
}
