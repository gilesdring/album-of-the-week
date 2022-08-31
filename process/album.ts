// deno-lint-ignore-file no-explicit-any
import { readCSV, writeJSON } from 'https://deno.land/x/flat@0.0.15/mod.ts';
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
  date: new Date(album.Date),
  artist: album.Artist,
  album: album.Album,
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
  return data.map((data: any) => (data ? { year: data.year, discogs_id: data.id, cover_image: image || data.cover_image, discogs_title: data.title } : undefined))[0];
}

const dayString = (date: Date) => date.toISOString().split('T')[0];

for (let i = 0; i < albumsList.length; i++) {
  const discogsInfo = await getDiscogsData(albumsList[i]);
  albumsList[i] = { ...albumsList[i], ...discogsInfo };
  console.log(albumsList[i]);
  const album = albumsList[i];
  await writeJSON(`data/${dayString(album.date)}.json`, album);
}

await writeJSON(`data/album-of-the-week.json`, albumsList.map(d => ({ id: dayString(d.date), ...d })));
