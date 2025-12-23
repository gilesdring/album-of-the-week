import { Data } from "lume/core/file.ts";

export const layout = 'template/album.vto';

export type Album = {
    artist: string;
    album: string;
    date: string;
}

export default function* ({ url, week }: Data & { week: { [k: string]: Album } }) {
    const albumIndex = Object.entries(week).map(([id, { artist, album, date }]) => ({ id, artist, album, date }));

    yield {
        url: '/data/album-of-the-week.json',
        content: JSON.stringify(albumIndex),
    };

    for (const [slug, album] of Object.entries(week)) {
        yield {
            ...album,
            id: slug,
            url: `${url}${slug}/`,
            date: new Date(album.date),
            tags: ['album'],
        }
    }
}