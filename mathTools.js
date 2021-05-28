function zeroesMatrix_n(len_n) {
  let n = parseInt(len_n);
  let M = [];
  for (let i = 0; i < parseInt(n); i++) {
    let row = Array(n).fill(0.0);
    M.push(row);
  }
  return M;
}

function zeroesMatrix_m(len_n, len_m) {
  let n = parseInt(len_n);
  let m = parseInt(len_m);
  let M = [];
  for (let i = 0; i < n; i++) {
    let row = Array(m).fill(0.0);
    M.push(row);
  }
  return M;
}

function zeroesVector(len_n) {
  let n = parseInt(len_n);
  let v = [];
  for (let i = 0; i < n; i++) {
    v.push(0.0);
  }
  return v;
}

function copyMatrix(A) {
  let copy = zeroesMatrix_n(A.length);
  for (let i = 0; i < A.length; i++)
    for (let j = 0; j < A[0].length; j++) copy[i][j] = A[i][j];
  return copy;
}

function calculateMember(i, j, r, A, B) {
  let member = 0;
  for (let k = 0; k < r; k++) member += A[i][k] * B[k][j];

  return member;
}

function productMatrixMatrix(A, B, n, r, m) {
  let R = zeroesMatrix_m(n, m);
  for (let i = 0; i < n; i++)
    for (let j = 0; j < m; j++) R[i][j] = calculateMember(i, j, r, A, B);

  return R;
}

function productMatrixVector(A, v, R) {
  for (let f = 0; f < A.length; f++) {
    let cell = 0.0;
    for (let c = 0; c < v.length; c++) cell += A[f][c] * v[c];
    R[f] += cell;
    R[f] = parseFloat(R[f].toFixed(3));
  }
}

function productRealMatrix(real, M) {
  let R = zeroesMatrix_n(M.length);
  for (let i = 0; i < M.length; i++)
    for (let j = 0; j < M[0].length; j++)
      R[i][j] = parseFloat((real * M[i][j]).toFixed(6));
  return R;
}

function getMinor(M, i, j) {
  M.splice(i, 1);
  for (let i = 0; i < M.length; i++) {
    M[i].splice(j, 1);
  }
}

function determinant(M) {
  if (M.length === 1) {
    return M[0][0];
  } else {
    let det = 0.0;
    for (let i = 0; i < M[0].length; i++) {
      let minor = copyMatrix(M);
      getMinor(minor, 0, i);
      det += Math.pow(-1, i) * M[0][i] * determinant(minor);
    }
    return det;
  }
}

function cofactors(M) {
  const cof = zeroesMatrix_n(M.length);
  for (let i = 0; i < M.length; i++) {
    for (let j = 0; j < M[0].length; j++) {
      let minor = copyMatrix(M);
      getMinor(minor, i, j);
      cof[i][j] = Math.pow(-1, i + j) * determinant(minor);
    }
  }
  return cof;
}

function transpose(M) {
  let T = zeroesMatrix_m(M[0].length, M.length);
  for (let i = 0; i < M.length; i++)
    for (let j = 0; j < M[0].length; j++) T[j][i] = M[i][j];
  return T;
}

function inverseMatrix(M) {
  console.log("Iniciando calculo de inversa...");
  console.log("Calculo de determinante...");
  let det = determinant(M);
  if (det === 0) process.exit();

  console.log("Iniciando calculo de cofactores...");
  const cof = cofactors(M);

  console.log("Calculo de adjunta...");
  const adj = transpose(cof);

  console.log("Calculo de inversa...");
  const Minv = productRealMatrix(1 / det, adj);

  return Minv;
}

module.exports = {
  zeroesMatrix_m,
  zeroesMatrix_n,
  zeroesVector,
  productMatrixMatrix,
  productMatrixVector,
  productRealMatrix,
  transpose,
  inverseMatrix,
};
