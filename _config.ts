import lume from "lume/mod.ts";
import base_path from "lume/plugins/base_path.ts";

const site = lume();

site.use(base_path({
  location: new URL("https://gilesdring.com/album-of-the-week/")
}));

site.ignore("src", "node_modules");

site.loadPages([".html"]);
site.loadAssets([".css"]);
site.copy("/data");

export default site;
