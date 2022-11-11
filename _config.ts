import lume from "lume/mod.ts";
import base_path from "lume/plugins/base_path.ts";

const site = lume({
  src: "./src",
  location: new URL("https://gilesdring.com/album-of-the-week/")
});

site.use(base_path());

site.ignore("node_modules");

site.loadAssets([".css"]);

for await (const dataFile of Deno.readDirSync('./data')) {
  if (dataFile.isFile) site.remoteFile(`/data/${dataFile.name}`, `./data/${dataFile.name}`);
};
site.copy("/data");

export default site;
