const shapefile = require("shapefile");

Promise.all([
  parseInput(),
  shapefile.read("build/PROVINCIAS_inei_geogpsperu_suyopomalia.shp"),
  shapefile.read("build/DEPARTAMENTOS_inei_geogpsperu_suyopomalia.shp")
]).then(output);

function parseInput() {
  return new Promise((resolve, reject) => {
    const chunks = [];
    process.stdin
        .on("data", chunk => chunks.push(chunk))
        .on("end", () => {
          try { resolve(JSON.parse(chunks.join(""))); }
          catch (error) { reject(error); }
        })
        .setEncoding("utf8");
  });
}

function output([topology, provinces, departments]) {
  provinces = new Map(provinces.features.map(d => [d.properties.IDPROV, d.properties]));
  // permite agregar el nombre de departamento dentro del topojson 
  // y dentro de objects.departments.geometries.properties.name
  departments = new Map(departments.features.map(d => [d.properties.CCDD, d.properties]));

  for (const province of topology.objects.provinces.geometries) {
    province.properties = {
      name: provinces.get(province.id).NOMBPROV
    };
  }

  for (const department of topology.objects.departments.geometries) {
    department.properties = {
      name: departments.get(department.id).NOMBDEP
    };
  }

  process.stdout.write(JSON.stringify(topology));
  process.stdout.write("\n");
}