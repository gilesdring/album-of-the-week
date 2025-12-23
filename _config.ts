import lume from "lume/mod.ts";
import base_path from "lume/plugins/base_path.ts";

const site = lume({
  src: "./src",
  location: new URL("https://gilesdring.com/album-of-the-week/")
});

site.use(base_path());

site.ignore("node_modules");

site.add([".css"]);

export default site;
