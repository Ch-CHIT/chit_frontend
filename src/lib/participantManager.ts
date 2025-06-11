import { ParticipantResponseType } from '@/store/sseStore';
import { OrderedSet } from 'js-sdsl';

export class ParticipantManager {
  participantsTree: OrderedSet<ParticipantResponseType>;
  compareFn: (a: ParticipantResponseType, b: ParticipantResponseType) => number = (a, b) => {
    if (a.round !== b.round) return a.round - b.round;
    if (a.fixedPick !== b.fixedPick) return a.fixedPick ? -1 : 1;
    return a.participantId - b.participantId;
  };

  constructor(data?: ParticipantResponseType[]) {
    this.participantsTree = new OrderedSet<ParticipantResponseType>(data || [], this.compareFn);
  }

  addOrUpdateParticipant(participant: ParticipantResponseType) {
    const iter = this.participantsTree.begin();

    while (!iter.equals(this.participantsTree.end())) {
      if (iter.pointer.participantId === participant.participantId) {
        this.participantsTree.eraseElementByIterator(iter);
        break;
      }
      iter.next();
    }

    this.participantsTree.insert(participant);
  }
  sendTopNToLastRound(n: number): void {
    const items = this.getAllParticipants();
    const maxRound = items.reduce((max, p) => Math.max(max, p.round), 0);
    const targetRound = maxRound + 1;

    const toUpdate = items.slice(0, n).map((participant) => ({
      ...participant,
      round: targetRound,
    }));

    toUpdate.forEach((participant) => {
      this.addOrUpdateParticipant(participant);
    });
  }

  removeParticipant(participantId: number) {
    const iter = this.participantsTree.begin();
    while (!iter.equals(this.participantsTree.end())) {
      if (iter.pointer.participantId === participantId) {
        this.participantsTree.eraseElementByIterator(iter);
        return true;
      }
      iter.next();
    }
    return false;
  }

  fixedParticipant(fixedParticipant: ParticipantResponseType) {
    const iter = this.participantsTree.begin();

    while (!iter.equals(this.participantsTree.end())) {
      if (iter.pointer.participantId === fixedParticipant.participantId) {
        this.participantsTree.eraseElementByIterator(iter);
        break;
      }
      iter.next();
    }

    this.participantsTree.insert(fixedParticipant);
  }

  getAllParticipants(): ParticipantResponseType[] {
    return Array.from(this.participantsTree).map((p) => ({ ...p }));
  }

  clear() {
    this.participantsTree.clear();
    return [];
  }
}
