const {
  zeroesMatrix_m,
  zeroesMatrix_n,
  productMatrixMatrix,
  productMatrixVector,
  productRealMatrix,
  transpose,
  inverseMatrix,
} = require("./mathTools");

function showMatrix(K) {
  K.forEach((arr) => {
    process.stdout.write("[\t");
    arr.forEach((item, index) => {
      process.stdout.write(item + "\t");
    });
    process.stdout.write("]\n");
  });
}

function showKs(Ks) {
  Ks.forEach((localK, i) => {
    process.stdout.write(`K del elemento ${i + 1}:\n`);
    showMatrix(localK);
    process.stdout.write("*************************************\n");
  });
}

function showVector(b) {
  process.stdout.write("[\t");
  b.forEach((element) => {
    process.stdout.write(`${element}\t`);
  });
  process.stdout.write("]\n");
}

function showBs(bs) {
  bs.forEach((localB, i) => {
    process.stdout.write(`b del elemento ${i + 1}:\n`);
    showVector(localB);
    process.stdout.write("*************************************\n");
  });
}

function calculateLocalD(i, m) {
  let e = m.getElement(i);

  let n1 = m.getNode(e.getNode1 - 1);
  let n2 = m.getNode(e.getNode2 - 1);
  let n3 = m.getNode(e.getNode3 - 1);

  let a = n2.getX - n1.getX;
  let b = n2.getY - n1.getY;
  let d = n3.getY - n1.getY;
  let c = n3.getX - n1.getX;
  let D = a * d - b * c;

  return D;
}

function calculateMagnitude(v1, v2) {
  return Math.sqrt(Math.pow(v1, 2) + Math.pow(v2, 2));
}

function calculateLocalArea(i, m) {
  let e = m.getElement(i);
  let n1 = m.getNode(e.getNode1 - 1);
  let n2 = m.getNode(e.getNode2 - 1);
  let n3 = m.getNode(e.getNode3 - 1);

  let a = calculateMagnitude(n2.getX - n1.getX, n2.getY - n1.getY);
  let b = calculateMagnitude(n3.getX - n2.getX, n3.getY - n2.getY);
  let c = calculateMagnitude(n3.getX - n1.getX, n3.getY - n1.getY);
  let s = (a + b + c) / 2;

  let A = Math.sqrt(s * (s - a) * (s - b) * (s - c));
  return A;
}

function calculateLocalA(i, A, m) {
  let e = m.getElement(i);
  let n1 = m.getNode(e.getNode1 - 1);
  let n2 = m.getNode(e.getNode2 - 1);
  let n3 = m.getNode(e.getNode3 - 1);
  A[0][0] = n3.getY - n1.getY;
  A[0][1] = n1.getY - n2.getY;
  A[1][0] = n1.getX - n3.getX;
  A[1][1] = n2.getX - n1.getX;
}

function calculateB(B) {
  B[0][0] = -1;
  B[0][1] = 1;
  B[0][2] = 0;
  B[1][0] = -1;
  B[1][1] = 0;
  B[1][2] = 1;
}

function createLocalK(element, m) {
  // K = (k*Ae/D^2)Bt*At*A*B := K_3x3
  let k = m.getParameter("THERMAL_CONDUCTIVITY");

  let D = calculateLocalD(element, m);
  let Ae = calculateLocalArea(element, m);

  let A = zeroesMatrix_n(2);
  let B = zeroesMatrix_m(2, 3);
  calculateLocalA(element, A, m);
  calculateB(B);
  let At = transpose(A);
  let Bt = transpose(B);

  let K = productRealMatrix(
    (k * Ae) / (D * D),
    productMatrixMatrix(
      Bt,
      productMatrixMatrix(At, productMatrixMatrix(A, B, 2, 2, 3), 2, 2, 3),
      3,
      2,
      3
    )
  );

  return K;
}

function calculateLocalJ(i, m) {
  let J, a, b, c, d;
  let e = m.getElement(i);
  let n2 = m.getNode(e.getNode2 - 1);
  let n1 = m.getNode(e.getNode1 - 1);
  let n3 = m.getNode(e.getNode3 - 1);

  a = n2.getX - n1.getX;
  b = n3.getX - n1.getX;
  c = n2.getY - n1.getY;
  d = n3.getY - n1.getY;
  J = a * d - b * c;

  return J;
}

function createLocalB(element, m) {
  let b = [];

  let Q = m.getParameter("HEAT_SOURCE"),
    J,
    b_i;
  J = calculateLocalJ(element, m);

  b_i = parseFloat(((Q * J) / 6).toFixed(6));
  b.push(b_i);
  b.push(b_i);
  b.push(b_i);

  return b;
}

function crearSistemasLocales(m, localKs, localBs) {
  for (let i = 0; i < m.getSize("ELEMENTS"); i++) {
    localKs.push(createLocalK(i, m));
    localBs.push(createLocalB(i, m));
  }
}

function assemblyK(e, localK, K) {
  let index1 = e.getNode1 - 1;
  let index2 = e.getNode2 - 1;
  let index3 = e.getNode3 - 1;

  K[index1][index1] += localK[0][0];
  K[index1][index2] += localK[0][1];
  K[index1][index3] += localK[0][2];
  K[index2][index1] += localK[1][0];
  K[index2][index2] += localK[1][1];
  K[index2][index3] += localK[1][2];
  K[index3][index1] += localK[2][0];
  K[index3][index2] += localK[2][1];
  K[index3][index3] += localK[2][2];
}

function assemblyB(e, localB, b) {
  let index1 = e.getNode1 - 1;
  let index2 = e.getNode2 - 1;
  let index3 = e.getNode3 - 1;

  b[index1] += localB[0];
  b[index2] += localB[1];
  b[index3] += localB[2];
}

function ensamblaje(m, localKs, localBs, K, b) {
  const ensamblaje = [];
  for (let i = 0; i < m.getSize("ELEMENTS"); i++) {
    let e = m.getElement(i);
    assemblyK(e, localKs[i], K);
    assemblyB(e, localBs[i], b);
  }
  K.forEach((arreglo) =>
    arreglo.forEach((elem, i, cad) => (cad[i] = parseFloat(cad[i].toFixed(6))))
  );

  b.forEach((elem, i, cad) => (cad[i] = parseFloat(cad[i].toFixed(6))));
}

function applyNeumann(m, b) {
  for (let i = 0; i < m.getSize("NEUMANN"); i++) {
    let c = m.getCondition(i, "NEUMANN");
    b[c.getNode1 - 1] += c.getValue;
  }
}

function applyDirichlet(m, K, b) {
  for (let i = 0; i < m.getSize("DIRICHLET"); i++) {
    let c = m.getCondition(i, "DIRICHLET");
    let index = c.getNode1 - 1;

    K.splice(index, 1);
    b.splice(index, 1);

    for (let row = 0; row < K.length; row++) {
      let cell = K[row][index];
      K[row].splice(index, 1);
      b[row] += -1 * c.getValue * cell;
    }
  }
}

function calculate(K, b, T) {
  console.log("Iniciando calculo de respuesta...");
  console.log("Calculo de inversa...");
  const Kinv = inverseMatrix(K);
  console.log("Calculo de respuesta...");
  productMatrixVector(Kinv, b, T);
}

module.exports = {
  crearSistemasLocales,
  showKs,
  showBs,
  showMatrix,
  showVector,
  ensamblaje,
  applyNeumann,
  applyDirichlet,
  calculate,
};
