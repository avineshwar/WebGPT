// --------------------- SHADER CODE --------------------- //

// Return maximum value of each row in a matrix times -1.
const negMaxShader = `
  struct Matrix {
    data: array<f32>,
  }

  struct Dimensions {
    dimY: u32, // row dimension
    dimX: u32, // col dimension
  };

  @group(0) @binding(0) var<uniform> DimBuffer: Dimensions;
  @group(0) @binding(1) var<storage, read_write> Result: Matrix;
  @group(1) @binding(0) var<storage, read> Input: Matrix;

  @compute @workgroup_size(16, 16)
  fn main (@builtin(global_invocation_id) global_id: vec3<u32>) {
    let row: u32 = global_id.x;
    let dimX: u32 = DimBuffer.dimX;

    if (row >= DimBuffer.dimY) {
      return;
    }

    var max_buffer: f32 = 0.0;
    for (var i: u32 = 0; i < dimX; i = i + 1) {
      max_buffer = max(max_buffer, Input.data[row * dimX + i]);
    }

    Result.data[row] = -max_buffer;
  }
`;

// Return maximum value of each row in a matrix times -1.
const maskedNegMaxShader = `
  struct Matrix {
    data: array<f32>,
  }

  struct Dimensions {
    dimY: u32, // row dimension
    dimX: u32, // col dimension
  };

  @group(0) @binding(0) var<uniform> DimBuffer: Dimensions;
  @group(0) @binding(1) var<storage, read_write> Result: Matrix;
  @group(1) @binding(0) var<storage, read> Input: Matrix;

  @compute @workgroup_size(16, 16)
  fn main (@builtin(global_invocation_id) global_id: vec3<u32>) {
    let row: u32 = global_id.x;
    let dimX: u32 = DimBuffer.dimX;

    if (row >= DimBuffer.dimY) {
      return;
    }

    let rowMask: u32 = row % dimX;

    var max_buffer: f32 = 0.0;
    for (var i: u32 = 0; i < rowMask; i = i + 1) {
      max_buffer = max(max_buffer, Input.data[row * dimX + i]);
    }

    Result.data[row] = -max_buffer;
  }
`;

// Adds constants [rows, 1] to each row of a matrix [rows, cols].
const addShader = `
  struct Matrix {
      data: array<f32>,
  }

  struct Dimensions {
    dimY: u32, // row dimension of input matrix
    dimX: u32, // col dimension of input matrix
  };

  @group(0) @binding(0) var<uniform> DimBuffer: Dimensions;
  @group(0) @binding(1) var<storage, read_write> Result: Matrix;
  @group(1) @binding(0) var<storage, read> Input: Matrix;
  @group(2) @binding(0) var<storage, read> Constants: Matrix;

  @compute @workgroup_size(16, 16)
  fn main (@builtin(global_invocation_id) global_id: vec3<u32>) {
      let row: u32 = global_id.x;
      let col: u32 = global_id.y;
      let dimX: u32 = DimBuffer.dimX;
      let dimY: u32 = DimBuffer.dimY;

      if (row >= dimY || col >= dimX) {
        return;
      }

      Result.data[row * dimX + col] = Input.data[row * dimX + col] + Constants.data[row];
    }
`;

// Exponentiates each element of a matrix.
const expShader = `
  struct Matrix {
      data: array<f32>,
  }

  struct Dimensions {
    dimY: u32, // row dimension of input matrix
    dimX: u32, // col dimension of input matrix
  };

  @group(0) @binding(0) var<uniform> DimBuffer: Dimensions;
  @group(0) @binding(1) var<storage, read_write> Result: Matrix;
  @group(1) @binding(0) var<storage, read> Input: Matrix;

  @compute @workgroup_size(16, 16)
  fn main (@builtin(global_invocation_id) global_id: vec3<u32>) {
      let row: u32 = global_id.x;
      let col: u32 = global_id.y;
      let dimX: u32 = DimBuffer.dimX;
      let dimY: u32 = DimBuffer.dimY;

      if (row >= dimY || col >= dimX) {
        return;
      }

      Result.data[row * dimX + col] = exp(Input.data[row * dimX + col]);
    }
`;

// Combined add and exp.
// Adds constants [rows, 1] to each row of a matrix [rows, cols].
// Then exponentiates each element of the matrix.
const addExpShader = `
  struct Matrix {
      data: array<f32>,
  }

  struct Dimensions {
    dimY: u32, // row dimension of input matrix
    dimX: u32, // col dimension of input matrix
  };

  @group(0) @binding(0) var<uniform> DimBuffer: Dimensions;
  @group(0) @binding(1) var<storage, read_write> Result: Matrix;
  @group(1) @binding(0) var<storage, read> Input: Matrix;
  @group(2) @binding(0) var<storage, read> Constants: Matrix;

  @compute @workgroup_size(16, 16)
  fn main (@builtin(global_invocation_id) global_id: vec3<u32>) {
      let row: u32 = global_id.x;
      let col: u32 = global_id.y;
      let dimX: u32 = DimBuffer.dimX;
      let dimY: u32 = DimBuffer.dimY;

      let rowMask: u32 = row % dimX;

      if (row >= dimY || col > rowMask) {
        return;
      }

      Result.data[row * dimX + col] = exp(Input.data[row * dimX + col] + Constants.data[row]);
    }
`;

// Returns the sum of each row of a matrix.
const sumShader = `
  struct Matrix {
    data: array<f32>,
  }

  struct Dimensions {
    dimY: u32, // row dimension
    dimX: u32, // col dimension
  };

  @group(0) @binding(0) var<uniform> DimBuffer: Dimensions;
  @group(0) @binding(1) var<storage, read_write> Result: Matrix;
  @group(1) @binding(0) var<storage, read> Input: Matrix;

  @compute @workgroup_size(16, 16)
  fn main (@builtin(global_invocation_id) global_id: vec3<u32>) {
    let row: u32 = global_id.x;
    let dimX: u32 = DimBuffer.dimX;

    if (row >= DimBuffer.dimY) {
      return;
    }

    var sum: f32 = 0.0;
    for (var i: u32 = 0; i < dimX; i = i + 1) {
        sum = sum + Input.data[row * dimX + i];
    }

    Result.data[row] = sum;
  }
`;

// Divides each element of a matrix by a constant [rows, 1].
const divideShader = `
  struct Matrix {
      data: array<f32>,
  }

  struct Dimensions {
    dimY: u32, // row dimension of input matrix
    dimX: u32, // col dimension of input matrix
  };

  @group(0) @binding(0) var<uniform> DimBuffer: Dimensions;
  @group(0) @binding(1) var<storage, read_write> Result: Matrix;
  @group(1) @binding(0) var<storage, read> Input: Matrix;
  @group(2) @binding(0) var<storage, read> Divisors: Matrix;

  @compute @workgroup_size(16, 16)
  fn main (@builtin(global_invocation_id) global_id: vec3<u32>) {
      let row: u32 = global_id.x;
      let col: u32 = global_id.y;
      let dimX: u32 = DimBuffer.dimX;
      let dimY: u32 = DimBuffer.dimY;

      if (row >= dimY || col >= dimX) {
        return;
      }

      Result.data[row * dimX + col] = Input.data[row * dimX + col] / Divisors.data[row];
    }
`;

// Multiplies matrix times weights and adds bias.
const FFNShader = `
  struct Matrix {
    data: array<f32>,
  }

  struct Dimensions {
    dimY: u32, // row dimension of A and row dimension of C
    dimX: u32, // col dimension of B and col dimension of C
    dimS: u32, // shared dimension of A and B
  };

  @group(1) @binding(0) var<storage, read> Input: Matrix;

  @group(0) @binding(0) var<uniform> DimBuffer: Dimensions;
  @group(0) @binding(1) var<storage, read> Bias: Matrix;
  @group(0) @binding(2) var<storage, read> Weight: Matrix;
  @group(0) @binding(3) var<storage, read_write> Result: Matrix;

  @compute @workgroup_size(16, 16)
  fn main (@builtin(global_invocation_id) global_id: vec3<u32>) {
    let row: u32 = global_id.x;
    let col: u32 = global_id.y;
    let dimX: u32 = DimBuffer.dimX;
    let dimY: u32 = DimBuffer.dimY;
    let dimS: u32 = DimBuffer.dimS;

    if (row >= dimY || col >= dimX) {
      return;
    }

    var sum: f32 = 0.0;
    for (var i: u32 = 0; i < dimS; i = i + 1) {
        sum = sum + Input.data[row * dimS + i] * Weight.data[i * dimX + col];
    }

    Result.data[row * dimX + col] = sum + Bias.data[col];
  }
`;

// Masks all values in the matrix that are not causal to -1 bil.
// Currently also transposes the matrix for copying.
const causalMaskShader = `
  struct Matrix {
      data: array<f32>,
  }

  struct Dimensions {
    dimY: u32, // row dimension of input matrix
    dimX: u32, // col dimension of input matrix
  };

  @group(0) @binding(0) var<uniform> DimBuffer: Dimensions;
  @group(0) @binding(1) var<storage, read_write> Result: Matrix;

  @group(1) @binding(0) var<storage, read> Input: Matrix;

  @compute @workgroup_size(16, 16)
  fn main (@builtin(global_invocation_id) global_id: vec3<u32>) {
      let row: u32 = global_id.x;
      let col: u32 = global_id.y;
      let dimX: u32 = DimBuffer.dimX;
      let dimY: u32 = DimBuffer.dimY;

      if (row >= dimY || col >= dimX) {
        return;
      }

      let rowMask: u32 = row % dimX;
      let rowNum: u32 = row / dimX;
      if (col > rowMask) {
        Result.data[row * dimX + col] = -1e9;
      } else {
        Result.data[row * dimX + col] = Input.data[rowMask * dimY + col + rowNum * dimX];
      }

    }
`;

// Masks all values in the matrix that are not causal to 0.
// Currently also transposes the matrix for copying.
const simpleCausalMaskShader = `
  struct Matrix {
      data: array<f32>,
  }

  struct Dimensions {
    dimY: u32, // row dimension of input matrix
    dimX: u32, // col dimension of input matrix
  };

  @group(0) @binding(0) var<uniform> DimBuffer: Dimensions;
  @group(0) @binding(1) var<storage, read_write> Result: Matrix;

  @group(1) @binding(0) var<storage, read> Input: Matrix;

  @compute @workgroup_size(16, 16)
  fn main (@builtin(global_invocation_id) global_id: vec3<u32>) {
    let row: u32 = global_id.x;
    let col: u32 = global_id.y;
    let dimX: u32 = DimBuffer.dimX;
    let dimY: u32 = DimBuffer.dimY;

    let rowMask: u32 = row % dimX;
    if (row >= dimY || col > rowMask) {
      return;
    }

    let rowNum: u32 = row / dimX;
    Result.data[row * dimX + col] = Input.data[rowMask * dimY + col + rowNum * dimX];

  }
`;

// Transpose the matrix.
const transposeShader = `
  struct Matrix {
    data: array<f32>,
  }

  struct Dimensions {
    dimY: u32, // row dimension of input matrix
    dimX: u32, // col dimension of input matrix
  };

  @group(0) @binding(0) var<uniform> DimBuffer: Dimensions;
  @group(0) @binding(1) var<storage, read_write> Result: Matrix;

  @group(1) @binding(0) var<storage, read> Input: Matrix;

  @compute @workgroup_size(16, 16)
  fn main(@builtin(global_invocation_id) global_id: vec3<u32>) {
    let row: u32 = global_id.x;
    let col: u32 = global_id.y;
    let dimX: u32 = DimBuffer.dimX;
    let dimY: u32 = DimBuffer.dimY;

    if (row >= dimY || col >= dimX) {
      return;
    }

    Result.data[row * dimX + col] = Input.data[col * dimY + row];
  }
`;

// Splits a matrix into Q, K, and V matrices.
const splitQKVShader = `
  struct Matrix {
    data: array<f32>,
  }

  struct Dimensions {
    dimY: u32, // row dimension of Q, K, V
    dimX: u32, // col dimension of Q, K, V
  };

  @group(1) @binding(0) var<storage, read> Input: Matrix;

  @group(0) @binding(0) var<uniform> DimBuffer: Dimensions;
  @group(0) @binding(1) var<storage, read_write> Q: Matrix;
  @group(0) @binding(2) var<storage, read_write> K: Matrix;
  @group(0) @binding(3) var<storage, read_write> V: Matrix;


  @compute @workgroup_size(16, 16)
  fn main (@builtin(global_invocation_id) global_id: vec3<u32>) {
    let row: u32 = global_id.x;
    let col: u32 = global_id.y;
    let dimX: u32 = DimBuffer.dimX;
    let dimY: u32 = DimBuffer.dimY;

    if (row >= dimY || col >= dimX) {
      return;
    }

    Q.data[row * dimX + col] = Input.data[row * dimX * 3 + col];
    K.data[row * dimX + col] = Input.data[row * dimX * 3 + dimX + col];
    V.data[row * dimX + col] = Input.data[row * dimX * 3 + 2 * dimX + col];

  }
`;

// Calculates attention weights from Q and K matrices.
const attentionWeightsShader = `
  struct Matrix {
    data: array<f32>,
  }

  struct Dimensions {
    dimY: u32, // output row and col dimension, Q & K row dimension (context)
    dimX: u32, // context * heads
    qkvCols: u32, // col dim of Q, K heads
    embedDim: u32, // embedding dimension
  };

  @group(1) @binding(0) var<storage, read> Queries: Matrix;
  @group(1) @binding(1) var<storage, read> Keys: Matrix;

  @group(0) @binding(0) var<uniform> DimBuffer: Dimensions;
  @group(0) @binding(1) var<storage, read_write> Result: Matrix;

  @compute @workgroup_size(16, 16)
  fn main (@builtin(global_invocation_id) global_id: vec3<u32>) {
    let row: u32 = global_id.x;
    let col: u32 = global_id.y;
    let dimY: u32 = DimBuffer.dimY;
    let dimX: u32 = DimBuffer.dimX;
    let qkvCols: u32 = DimBuffer.qkvCols;
    let embedDim: u32 = DimBuffer.embedDim;

    if (row >= dimY || col >= dimX) {
      return;
    }

    var head: u32 = col / dimY;
    var col_r: u32 = col % dimY;
    var sum: f32 = 0.0;
    for (var i: u32 = 0; i < qkvCols; i = i + 1) {
        sum = sum + Queries.data[row * embedDim + i + head * qkvCols] * Keys.data[col_r * embedDim + i + head * qkvCols];
    }

    Result.data[row * dimX + col] = sum;
  }
`;

// Calculates attention values from attention weights and V matrix.
const attentionValuesShader = `
  struct Matrix {
    data: array<f32>,
  }

  struct Dimensions {
    dimY: u32, // Values row and col dimension, Weights row dimension (context)
    dimX: u32, // Result col dim (n_embd)
    numHeads: u32, // number of heads
    vCols: u32, // col dim of V
  };

  @group(1) @binding(0) var<storage, read> Weights: Matrix;
  @group(1) @binding(1) var<storage, read> Values: Matrix;

  @group(0) @binding(0) var<uniform> DimBuffer: Dimensions;
  @group(0) @binding(1) var<storage, read_write> Result: Matrix;

  @compute @workgroup_size(16, 16)
  fn main (@builtin(global_invocation_id) global_id: vec3<u32>) {
    let row: u32 = global_id.x;
    let col: u32 = global_id.y;
    let dimY: u32 = DimBuffer.dimY;
    let dimX: u32 = DimBuffer.dimX;
    let vCols: u32 = DimBuffer.vCols;

    if (row >= dimY || col >= dimX) {
      return;
    }

    var head: u32 = col / vCols;
    var col_r: u32 = col % dimY;
    var sum: f32 = 0.0;
    for (var i: u32 = 0; i < dimY; i = i + 1) {
        sum = sum +  Values.data[i * dimX + col] * Weights.data[row * dimY + i + head * dimY * dimY];
    }

    Result.data[row * dimX + col] = sum;
  }
`;

// Multiplies every value in a matrix by a single constant.
const multiplyShader = `
  struct Matrix {
      data: array<f32>,
  }

  struct Dimensions {
    dimY: u32, // row dimension of input matrix
    dimX: u32, // col dimension of input matrix
    attentionScale: f32,
  };

  @group(0) @binding(0) var<uniform> DimBuffer: Dimensions;
  @group(0) @binding(1) var<storage, read_write> Result: Matrix;

  @group(1) @binding(0) var<storage, read> Input: Matrix;

  @compute @workgroup_size(16, 16)
  fn main (@builtin(global_invocation_id) global_id: vec3<u32>) {
      let row: u32 = global_id.x;
      let col: u32 = global_id.y;
      let dimX: u32 = DimBuffer.dimX;

      if (row >= DimBuffer.dimY || col >= dimX) {
        return;
      }

      Result.data[row * dimX + col] = Input.data[row * dimX + col] * DimBuffer.attentionScale;
    }
`;

// Adds two matrices element-wise.
// Obviously super inefficient but i'll be optimizing later, just trying to get this working for now.
const elementWiseAdditionShader = `
  struct Matrix {
      data: array<f32>,
  }

  struct Uniforms {
    dimY: u32,
    dimX: u32,
  };

  @group(2) @binding(0) var<storage, read> LayerOutput: Matrix;
  @group(1) @binding(0) var<storage, read> Residual: Matrix;

  @group(0) @binding(0) var<uniform> dimBuffer: Uniforms;
  @group(0) @binding(1) var<storage, read_write> Result: Matrix;

  @compute @workgroup_size(16, 16)
  fn main (@builtin(global_invocation_id) global_id: vec3<u32>) {
    let row: u32 = global_id.x;
    let col: u32 = global_id.y;
    let dimX: u32 = dimBuffer.dimX;
    let dimY: u32 = dimBuffer.dimY;

    if (row >= dimY || col >= dimX) {
      return;
    }

    Result.data[row * dimX + col] = LayerOutput.data[row * dimX + col] + Residual.data[row * dimX + col];
  }
`;

// Multiplies two matrices.
const matMulShader = `
    struct Matrix {
        data: array<f32>,
    }

    struct Uniforms {
      dimY: u32, // row dimension of A and row dimension of C
      dimX: u32, // col dimension of B and col dimension of C
      dimS: u32, // shared dimension of A and B
    };

    @group(1) @binding(0) var<storage, read> A: Matrix;
    @group(1) @binding(1) var<storage, read> B: Matrix;

    @group(0) @binding(1) var<storage, read_write> C: Matrix;
    @group(0) @binding(0) var<uniform> dimBuffer: Uniforms;

    @compute @workgroup_size(16, 16)
    fn main (@builtin(global_invocation_id) global_id: vec3<u32>) {
        let row: u32 = global_id.x;
        let col: u32 = global_id.y;
        let dimX: u32 = dimBuffer.dimX;
        let dimY: u32 = dimBuffer.dimY;
        let dimS: u32 = dimBuffer.dimS;

        if (row >= dimY || col >= dimX) {
          return;
        }

        var sum: f32 = 0.0;
        for (var i: u32 = 0; i < dimS; i = i + 1) {
            sum = sum + A.data[row * dimS + i] * B.data[i * dimX + col];
        }

        C.data[row * dimX + col] = sum;
      }
  `;

// Calculates mean and standard deviation per row of a matrix.
const normStatsShader = `
  struct Matrix {
    data: array<f32>,
  }

  struct Dimensions {
    dimY: u32, // row dimension
    dimX: u32, // col dimension
  };

  @group(1) @binding(0) var<storage, read> Input: Matrix;

  @group(0) @binding(0) var<uniform> DimBuffer: Dimensions;
  @group(0) @binding(1) var<storage, read_write> Result: Matrix;

  @compute @workgroup_size(16, 16)
  fn main (@builtin(global_invocation_id) global_id: vec3<u32>) {
    let row: u32 = global_id.x;
    let col: u32 = global_id.y;
    let dimX: u32 = DimBuffer.dimX;

    if (row >= DimBuffer.dimY || col >= 1) {
      return;
    }

    var sum: f32 = 0.0;
    for (var i: u32 = 0; i < dimX; i = i + 1) {
        sum = sum + Input.data[row * dimX + i];
    }
    var mean: f32 = sum / f32(dimX);

    var variance: f32 = 0.0;
    for (var i: u32 = 0; i < dimX; i = i + 1) {
        variance = variance + (Input.data[row * dimX + i] - mean) * (Input.data[row * dimX + i] - mean);
    }
    variance = variance / f32(dimX);
    var stdev: f32 = sqrt(variance + 1e-5);

    Result.data[row * 2] = mean;
    Result.data[row * 2 + 1] = stdev;
  }
`;

// Adjusts the input matrix by the mean and standard deviation and gamma and beta parameters.
const normShader = `
  struct Matrix {
      data: array<f32>,
  }

  struct Dimensions {
    dimY: u32, // row dimension of input matrix
    dimX: u32, // col dimension of input matrix
  };

  @group(0) @binding(0) var<uniform> DimBuffer: Dimensions;
  @group(0) @binding(1) var<storage, read_write> Result: Matrix;

  @group(1) @binding(0) var<storage, read> Input: Matrix;
  @group(1) @binding(1) var<storage, read> Gamma: Matrix;
  @group(1) @binding(2) var<storage, read> Beta: Matrix;
  @group(2) @binding(0) var<storage, read> Stats: Matrix;

  @compute @workgroup_size(16, 16)
  fn main (@builtin(global_invocation_id) global_id: vec3<u32>) {
    let row: u32 = global_id.x;
    let col: u32 = global_id.y;
    let dimX: u32 = DimBuffer.dimX;
    let dimY: u32 = DimBuffer.dimY;

    if (row >= dimY || col >= dimX) {
      return;
    }

    let mean = Stats.data[row * 2];
    let stdev = Stats.data[row * 2 + 1];
    let output = (Input.data[row * dimX + col] - mean) / stdev;
    let gamma = Gamma.data[col];
    let beta = Beta.data[col];
    let shift = gamma * output + beta;
    Result.data[row * dimX + col] = shift;
  }
`;

// Squashes all elements of a matrix using the GELU function.
// There's tons of obvious ineffiencies here but I'm pushing them to after this is working.
const GELUShader = `
  struct Matrix {
      data: array<f32>,
  }

  struct Dimensions {
    dimY: u32, // row dimension of input matrix
    dimX: u32, // col dimension of input matrix
  };

  const SQRPI: f32 = 0.7978845608;
  fn gelu(x: f32) -> f32 {
    if (x < -10.0) {
      return 0.0;
    } else if (x > 10.0) {
      return x;
    } else {
      let cdf_approx: f32 = 0.5 * (1.0 + tanh(SQRPI * (x + 0.044715 * pow(x, 3))));
      return x * cdf_approx;
    }
  }

  @group(0) @binding(0) var<uniform> DimBuffer: Dimensions;
  @group(0) @binding(1) var<storage, read_write> Result: Matrix;

  @group(1) @binding(0) var<storage, read> Input: Matrix;

  @compute @workgroup_size(16, 16)
  fn main (@builtin(global_invocation_id) global_id: vec3<u32>) {
      let row: u32 = global_id.x;
      let col: u32 = global_id.y;
      let dimX: u32 = DimBuffer.dimX;
      let dimY: u32 = DimBuffer.dimY;

      if (row >= dimY || col >= dimX) {
        return;
      }

      Result.data[row * dimX + col] = gelu(Input.data[row * dimX + col]);
    }
  `;
