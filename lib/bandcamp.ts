import { DOMParser } from 'https://deno.land/x/deno_dom/deno-dom-wasm.ts';

export class Bandcamp {
  url: URL;
  document: any;
  constructor(link: string) {
    this.url = new URL(link);
  }
  async fetch() {
    if (this.document) return;
    const res = await fetch(this.url.toString());
    const html = await res.text();
    this.document = new DOMParser().parseFromString(html, 'text/html');
  }
  get image() {
    return this.document.querySelector('link[rel=image_src]').getAttribute('href');
  }
  async details() {
    await this.fetch();
    return {
      image: this.image
    }
  }
}