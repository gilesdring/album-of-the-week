import { isDocumentFragment } from "https://deno.land/x/deno_dom@v0.1.35-alpha/src/dom/utils.ts";
import { readJSON, writeJSON } from "https://deno.land/x/flat@0.0.15/mod.ts";

const filename = Deno.args[0];

// NB this will fail over 100 records!
const raw = await readJSON(filename);

const albums = raw.records
  .map((x) => ({
    id: x.fields.Date,
    date: new Date(x.fields.Date),
    artist: x.fields.Artist,
    album: x.fields.Album,
    bandcamp: x.fields.Bandcamp,
    image: x.fields.Image,
    discogs_id: x.fields["Discogs ID"],
  }))
  .filter((x) => x.album)
  .sort((a, b) => Date.parse(a.id) - Date.parse(b.date));

albums.forEach(
  async ({ id, ...album }) => await writeJSON(`data/${id}.json`, album),
);

// Maybe derive this from the created files
await writeJSON(`data/album-of-the-week.json`, albums);

// Clean up raw file
await Deno.remove(filename);