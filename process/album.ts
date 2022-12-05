// deno-lint-ignore-file no-explicit-any
import { readCSV, writeJSON } from 'https://deno.land/x/flat@0.0.15/mod.ts';
import { Bandcamp } from '../lib/bandcamp.ts';
import config from '../lib/config.ts';
import { Discogs } from '../lib/discogs.ts';

const discogs = new Discogs(config.discogs.token);

const filename = Deno.args[0];

type AlbumDetails = {
  artist: string;
  album: string;
}

const dropUndefined = (album: any) => Boolean(album.Artist);

const parseAlbum = (album: any) => ({
  ...Object.entries(album).reduce((a, [k, v]) => ({ ...a, [k.toLowerCase()]: v }), []),
  date: new Date(album.Date),
})

const albumsList = (await readCSV(filename)).filter(dropUndefined).map(parseAlbum);

function uniqueItems<T>(array: T[]) {
  const set = new Set(array.filter(x => x));
  return Array.from(set);
}

async function getDiscogsData({ artist, album }: AlbumDetails) {
  let data;
  try {
    const response = await discogs.search(artist, album);
    data = response.results;
  } catch(error) {
    console.error(error.message);
    return {}
  }
  const masterIds = uniqueItems<string>(data.map((x: any) => x.master_id));
  const image = await discogs.getPrimaryImage(masterIds[0]);
  return data.map((data: any) => (data ? { year: data.year, discogs_id: data.id, image: image || data.cover_image, discogs_title: data.title } : undefined))[0];
}

const dayString = (date: Date) => date.toISOString().split('T')[0];

const updatedAlbums: any[] = [];

for (let album of albumsList) {
  const bandcampInfo = album.bandcamp ? await (new Bandcamp(album.bandcamp)).details() : undefined;
  const discogsInfo = await getDiscogsData(album);
  album = {
    ...album,
    ...discogsInfo,
    ...bandcampInfo,
  };
  console.log(album)
  await writeJSON(`data/${dayString(album.date)}.json`, album);
  updatedAlbums.push(album);
}

await writeJSON(`data/album-of-the-week.json`, updatedAlbums.map(d => ({ id: dayString(d.date), ...d })));
