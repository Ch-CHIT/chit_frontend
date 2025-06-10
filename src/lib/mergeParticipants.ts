import { ParticipantResponseType } from '@/store/sseStore';

/**
 * 기존 참가자 목록과 새로운 참가자 목록을 병합하면서,
 * viewerId 기준으로 중복 제거하고 최신(current)의 값을 우선 반영한다.
 *
 * @param oldParticipants 기존 participants 목록
 * @param currentParticipants 최신 participants 목록
 * @returns 병합된 participants 목록
 */
export function mergeParticipants(
  oldParticipants: ParticipantResponseType[],
  currentParticipants: ParticipantResponseType[],
): ParticipantResponseType[] {
  // const currentIds = new Set(currentParticipants.map((p) => p.viewerId));
  const result: ParticipantResponseType[] = [];

  currentParticipants.forEach((participant) => {
    result.push(participant); // current 기준으로 무조건 포함
  });

  // 만약 currentParticipants에 없는 기존 참가자를 유지하고 싶다면 아래 추가 (지금은 제거!)
  // oldParticipants.forEach((p) => {
  //   if (currentIds.has(p.viewerId)) {
  //     result.push(p); // 중복 방지 필요
  //   }
  // });

  return result;
}
