import { readCSV, writeJSON } from 'https://deno.land/x/flat@0.0.15/mod.ts';
import config from '../lib/config.ts';
import { Discogs } from '../lib/discogs.ts';

const discogs = new Discogs(config.discogs.token);

const filename = Deno.args[0];

type albumType = {
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

const getDiscogsData = async ({ artist, album }: albumType) => await discogs.search(artist, album)
  .then((response: any) => response.results[0])
  .then((data: any) => (data ? { year: data.year, discogs_id: data.id, cover_image: data.cover_image, discogs_title: data.title } : undefined))
  .catch(error => {
    console.error(error.message);
    return {};
  });

const dayString = (date: Date) => date.toISOString().split('T')[0];

for (let i = 0; i < albumsList.length; i++) {
  const discogsInfo = await getDiscogsData(albumsList[i]);
  albumsList[i] = { ...albumsList[i], ...discogsInfo };
  console.log(albumsList[i]);
  const album = albumsList[i];
  await writeJSON(`data/${dayString(album.date)}.json`, album);
}

await writeJSON(`data/album-of-the-week.json`, albumsList.map(d => ({ id: dayString(d.date), ...d })));
