export class Discogs {
  private urlBase = 'https://api.discogs.com/';
  private token: string;
  private wait: boolean;

  constructor(token: string | undefined) {
    if (token === undefined) throw new Error('Provide a token');
    this.token = token;
    this.wait = false;
  }

  canProgress(): Promise<void> {
    if (!this.wait) return Promise.resolve();
    return new Promise((resolve) => {
      const timer = setInterval(() => {
        if (!this.wait) {
          clearInterval(timer);
          resolve();
        }
      }, 10);
    });
  }

  // deno-lint-ignore no-explicit-any
  rateLimit(headers: any) {
    const quota = parseInt(headers.get('x-discogs-ratelimit'));
    const remaining = parseInt(headers.get('x-discogs-ratelimit-remaining'));
    console.log(`Remaining discogs quota ${remaining} / ${quota}`);
    const backoff = (quota / 60) * 1000;
    console.log(`Backing off for ${backoff}`);
    this.wait = true;
    setTimeout(() => (this.wait = false), backoff);
  }

  async request(url: URL) {
    console.time('Wait');
    await this.canProgress();
    console.timeEnd('Wait');
    const result = await fetch(url.toString(), {
      headers: {
        Authorization: `Discogs token=${this.token}`,
      },
    });
    this.rateLimit(result.headers);
    return result.json();
  }

  search(artist: string, title: string) {
    const url = new URL('/database/search', this.urlBase);
    const q = url.searchParams;
    // q.append('type', 'master');
    q.append('artist', artist.replace(/\s+and\s+/i, ' '));
    q.append('release_title', title);
    return this.request(url);
  }

  getMaster(masterId: string) {
    const url = new URL(`/masters/${masterId}`, this.urlBase);
    return this.request(url);
  }

  async getPrimaryImage(masterId: string): Promise<string | undefined> {
    const masterRecord = await this.getMaster(masterId);
    const images = masterRecord.images;
    // deno-lint-ignore no-explicit-any
    const image =
      images
        ? 
        images.find((image: any) => image.type === 'primary') ||
        images[0]
        :
        undefined;
    return image?.uri;
  }
}
