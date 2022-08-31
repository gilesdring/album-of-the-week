import "https://deno.land/x/dotenv@v3.2.0/load.ts";

export default {
  discogs: {
    token: Deno.env.get('DISCOGS_TOKEN')
  }
}