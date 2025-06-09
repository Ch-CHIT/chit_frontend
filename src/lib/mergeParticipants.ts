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
  const map = new Map<number, ParticipantResponseType>();

  // 기존 참가자 먼저 삽입
  oldParticipants.forEach((p) => map.set(p.viewerId, p));
  // 최신 참가자 덮어쓰기
  currentParticipants.forEach((p) => map.set(p.viewerId, p));

  return Array.from(map.values()); // 정렬 없음
}
