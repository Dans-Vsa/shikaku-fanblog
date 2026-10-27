import { readStore, writeStore } from './storage';

/**
 * Lapisan adapter komunitas. UI hanya bergantung pada interface `CommunityStore`;
 * implementasi saat ini localStorage. Untuk backend sungguhan, cukup buat kelas
 * baru (mis. RestCommunityStore) dengan method yang sama lalu ganti `communityStore`.
 */
export type BoardKind = 'panels' | 'interpretations';

export interface CommunityPost {
  id: string;
  kind: BoardKind;
  author: string;
  text: string;
  /** label tambahan: babak / topik */
  tag?: string;
  votes: number;
  createdAt: number;
  /** contoh bawaan situs (bukan dari pengguna) */
  seed?: boolean;
}

export interface CommunityStore {
  list(kind: BoardKind): Promise<CommunityPost[]>;
  add(post: Omit<CommunityPost, 'id' | 'votes' | 'createdAt'>): Promise<CommunityPost>;
  vote(id: string): Promise<CommunityPost | null>;
  hasVoted(id: string): boolean;
  remove(id: string): Promise<void>;
}

const POSTS_KEY = 'community-posts';
const VOTES_KEY = 'community-votes';
const MAX_TEXT = 400;

function isPostArray(v: unknown): v is CommunityPost[] {
  return (
    Array.isArray(v) &&
    v.every((p) => p && typeof p === 'object' && typeof (p as CommunityPost).id === 'string')
  );
}

const isStringArray = (v: unknown): v is string[] =>
  Array.isArray(v) && v.every((s) => typeof s === 'string');

/** Bersihkan input pengguna: buang karakter kontrol (kecuali baris baru/tab), trim, batasi panjang. */
export function sanitize(text: string, max = MAX_TEXT) {
  let out = '';
  for (const ch of text) {
    const code = ch.codePointAt(0) ?? 0;
    // 10 = baris baru, 9 = tab (dipertahankan)
    const control = (code < 32 && code !== 10 && code !== 9) || code === 127;
    if (!control) out += ch;
  }
  return out.trim().slice(0, max);
}

export class LocalCommunityStore implements CommunityStore {
  constructor(private seeds: CommunityPost[] = []) {}

  private all(): CommunityPost[] {
    return readStore<CommunityPost[]>(POSTS_KEY, [], isPostArray);
  }

  private save(posts: CommunityPost[]) {
    writeStore(POSTS_KEY, posts.slice(-300));
  }

  async list(kind: BoardKind) {
    const own = this.all();
    const ownIds = new Set(own.map((p) => p.id));
    const seeds = this.seeds.filter((s) => !ownIds.has(s.id));
    const votes = new Set(readStore<string[]>(VOTES_KEY, [], isStringArray));
    return [...own, ...seeds]
      .filter((p) => p.kind === kind)
      .map((p) => (p.seed && votes.has(p.id) ? { ...p, votes: p.votes + 1 } : p))
      .sort((a, b) => b.votes - a.votes || b.createdAt - a.createdAt);
  }

  async add(post: Omit<CommunityPost, 'id' | 'votes' | 'createdAt'>) {
    const created: CommunityPost = {
      ...post,
      author: sanitize(post.author, 40),
      text: sanitize(post.text),
      tag: post.tag ? sanitize(post.tag, 40) : undefined,
      id: `p_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`,
      votes: 0,
      createdAt: Date.now(),
    };
    this.save([...this.all(), created]);
    return created;
  }

  hasVoted(id: string) {
    return readStore<string[]>(VOTES_KEY, [], isStringArray).includes(id);
  }

  async vote(id: string) {
    if (this.hasVoted(id)) return null;
    writeStore(VOTES_KEY, [...readStore<string[]>(VOTES_KEY, [], isStringArray), id]);
    const posts = this.all();
    const target = posts.find((p) => p.id === id);
    if (target) {
      target.votes += 1;
      this.save(posts);
      return target;
    }
    return this.seeds.find((s) => s.id === id) ?? null;
  }

  async remove(id: string) {
    this.save(this.all().filter((p) => p.id !== id));
  }
}
