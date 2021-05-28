const math = require("mathjs");
const readline = require("readline");

const { Mesh } = require("./classes");
const { leerMallayCondiciones, writeResults } = require("./tools");
const {
  crearSistemasLocales,
  showKs,
  showBs,
  showMatrix,
  showVector,
  ensamblaje,
  applyNeumann,
  applyDirichlet,
  calculate,
} = require("./sel");
const { zeroesVector, zeroesMatrix_n } = require("./mathTools");

async function main() {
  let filename = process.argv[2];
  console.log(
    "IMPLEMENTACION DEL METODO DE LOS ELEMENTOS FINITOS\n" +
      "\t- TRANSFERENCIA DE CALOR\n" +
      "\t- 2 DIMENSIONES\n" +
      "\t- FUNCIONES DE FORMA LINEALES\n" +
      "\t- PESOS DE GALERKIN\n" +
      "\t- MALLA TRIANGULAR IRREGULAR\n" +
      "*********************************************************************************\n\n"
  );

  const localKs = [];
  const localBs = [];

  const m = new Mesh();

  await leerMallayCondiciones(m, filename);
  console.log("Datos obtenidos correctamente\n********************\n");

  crearSistemasLocales(m, localKs, localBs);
  //showKs(localKs);
  //showBs(localBs);
  console.log("******************************");

  let K = zeroesMatrix_n(m.getSize("NODES"));
  let b = zeroesVector(m.getSize("NODES"));

  ensamblaje(m, localKs, localBs, K, b);
  //showMatrix(K);
  //showVector(b);
  console.log("******************************");
  //console.log(`${K.length} - ${K[0].length}`);
  //console.log(b.length);

  applyNeumann(m, b);
  //showMatrix(K);
  //showVector(b);
  console.log("******************************\n");
  //console.log(`${K.length} - ${K[0].length}`);
  //console.log(b.length);

  applyDirichlet(m, K, b);
  //showMatrix(K);
  //showVector(b);
  console.log("******************************\n");
  //console.log(`${K.length} - ${K[0].length}`);
  //console.log(b.length);

  let T = zeroesVector(b.length);
  calculate(K, b, T);

  console.log("La respuesta es: ");
  showVector(T);

  writeResults(m, T, filename);

  return 0;
}

main();
