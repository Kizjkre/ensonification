const RECTANGLE_VERTEX_SHADER = `#version 300 es
in vec2 a_corner;
in vec4 a_rectangle;
in float a_value;
uniform vec2 u_resolution;
uniform float u_x_scale;
uniform float u_x_offset;
uniform float u_block_gap;
out float v_value;

void main() {
  float scaled_width = (a_rectangle.z + u_block_gap) * u_x_scale - u_block_gap;
  vec2 position = vec2(
    a_rectangle.x * u_x_scale + a_corner.x * scaled_width + u_x_offset,
    a_rectangle.y + a_corner.y * a_rectangle.w
  );
  vec2 clip = position / u_resolution * 2.0 - 1.0;
  gl_Position = vec4(clip.x, -clip.y, 0.0, 1.0);
  v_value = a_value;
}`;

const LINE_VERTEX_SHADER = `#version 300 es
in vec2 a_corner;
in vec4 a_segment;
in float a_value;
uniform vec2 u_resolution;
uniform float u_x_scale;
uniform float u_x_offset;
out vec2 v_position;
out vec4 v_segment;
out float v_value;

void main() {
  vec2 start = vec2(a_segment.x * u_x_scale + u_x_offset, a_segment.y);
  vec2 end = vec2(a_segment.z * u_x_scale + u_x_offset, a_segment.w);
  vec2 bounds_min = min(start, end) - vec2(6.0);
  vec2 bounds_max = max(start, end) + vec2(6.0);
  v_position = bounds_min + (a_corner * 0.5 + 0.5) * (bounds_max - bounds_min);
  v_segment = a_segment;
  vec2 clip = v_position / u_resolution * 2.0 - 1.0;
  gl_Position = vec4(clip.x, -clip.y, 0.0, 1.0);
  v_value = a_value;
}`;

const fragmentShader = ({ line = false } = {}) => `#version 300 es
precision mediump float;
${line ? 'in vec2 v_position;\nin vec4 v_segment;' : ''}
in float v_value;
uniform bool u_use_palette;
uniform vec4 u_solid_color;
uniform vec2 u_color_domain;
uniform vec2 u_color_range;
uniform sampler2D u_palette;
out vec4 out_color;

void main() {
  ${line ? `vec2 delta = v_segment.zw - v_segment.xy;
  float length_squared = dot(delta, delta);
  float t = length_squared == 0.0 ? 0.0 : clamp(dot(v_position - v_segment.xy, delta) / length_squared, 0.0, 1.0);
  float distance_to_line = length(v_position - (v_segment.xy + t * delta));
  if (distance_to_line > 5.0) discard;
  float coverage = 1.0 - smoothstep(4.0, 5.0, distance_to_line);` : ''}
  vec4 color = u_solid_color;
  if (u_use_palette) {
    float domain_range = u_color_domain.y - u_color_domain.x;
    float normalized = domain_range == 0.0 ? 0.0 : (v_value - u_color_domain.x) / domain_range;
    float palette_position = clamp(normalized * (u_color_range.y - u_color_range.x) + u_color_range.x, 0.0, 1.0);
    color = texture(u_palette, vec2(palette_position, 0.5));
  }
  ${line ? 'color.a *= coverage;' : ''}
  out_color = color;
}`;

const CORNERS = new Float32Array([
  0, 0, 1, 0, 1, 1,
  0, 0, 1, 1, 0, 1
]);
const LINE_CORNERS = new Float32Array([
  -1, -1, 1, -1, 1, 1,
  -1, -1, 1, 1, -1, 1
]);

const compileShader = (gl, type, source) => {
  const shader = gl.createShader(type);
  if (!shader) throw new Error('Unable to create a WebGL shader.');

  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const message = gl.getShaderInfoLog(shader) || 'Unknown shader compilation error.';
    gl.deleteShader(shader);
    throw new Error(message);
  }

  return shader;
};

const createProgram = (gl, vertexSource, fragmentSource) => {
  const vertexShader = compileShader(gl, gl.VERTEX_SHADER, vertexSource);
  const pixelShader = compileShader(gl, gl.FRAGMENT_SHADER, fragmentSource);
  const program = gl.createProgram();
  if (!program) throw new Error('Unable to create a WebGL program.');

  gl.attachShader(program, vertexShader);
  gl.attachShader(program, pixelShader);
  gl.linkProgram(program);
  gl.deleteShader(vertexShader);
  gl.deleteShader(pixelShader);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    const message = gl.getProgramInfoLog(program) || 'Unknown shader linking error.';
    gl.deleteProgram(program);
    throw new Error(message);
  }

  return program;
};

const createBuffer = (gl, data, usage = gl.STATIC_DRAW) => {
  const buffer = gl.createBuffer();
  if (!buffer) throw new Error('Unable to create a WebGL buffer.');
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, data, usage);
  return buffer;
};

export default (canvas, palette) => {
  const gl = canvas.getContext('webgl2', { alpha: true, antialias: true });
  if (!gl) throw new Error('WebGL 2 is not available in this browser.');

  const rectangleProgram = createProgram(gl, RECTANGLE_VERTEX_SHADER, fragmentShader());
  const lineProgram = createProgram(gl, LINE_VERTEX_SHADER, fragmentShader({ line: true }));
  const rectangleCorners = createBuffer(gl, CORNERS);
  const lineCorners = createBuffer(gl, LINE_CORNERS);
  const staffBuffer = createBuffer(gl, new Float32Array(), gl.DYNAMIC_DRAW);
  const rectangleBuffer = createBuffer(gl, new Float32Array(), gl.DYNAMIC_DRAW);
  const lineBuffer = createBuffer(gl, new Float32Array(), gl.DYNAMIC_DRAW);
  const colorBuffer = createBuffer(gl, new Float32Array(2), gl.DYNAMIC_DRAW);
  const overlayBuffer = createBuffer(gl, new Float32Array(), gl.DYNAMIC_DRAW);
  const paletteTexture = gl.createTexture();
  if (!paletteTexture) throw new Error('Unable to create the color palette texture.');
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, paletteTexture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, palette.length / 4, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, palette);

  const programs = [rectangleProgram, lineProgram].map(program => ({
    program,
    geometry: gl.getAttribLocation(program, program === rectangleProgram ? 'a_rectangle' : 'a_segment'),
    value: gl.getAttribLocation(program, 'a_value'),
    corner: gl.getAttribLocation(program, 'a_corner'),
    resolution: gl.getUniformLocation(program, 'u_resolution'),
    xScale: gl.getUniformLocation(program, 'u_x_scale'),
    xOffset: gl.getUniformLocation(program, 'u_x_offset'),
    blockGap: gl.getUniformLocation(program, 'u_block_gap'),
    usePalette: gl.getUniformLocation(program, 'u_use_palette'),
    solidColor: gl.getUniformLocation(program, 'u_solid_color'),
    colorDomain: gl.getUniformLocation(program, 'u_color_domain'),
    colorRange: gl.getUniformLocation(program, 'u_color_range'),
    palette: gl.getUniformLocation(program, 'u_palette')
  }));

  let width = 0;
  let height = 0;
  let staffCount = 0;
  let rectangleCount = 0;
  let lineCount = 0;
  let colorValues = new Float32Array(2);

  const uploadColorValues = () => {
    const requiredLength = Math.max(2, staffCount, rectangleCount, lineCount, colorValues.length);
    if (colorValues.length < requiredLength) {
      const values = new Float32Array(requiredLength);
      values.set(colorValues);
      colorValues = values;
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, colorValues, gl.DYNAMIC_DRAW);
  };

  const setGeometryAttribute = (program, buffer, location) => {
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.enableVertexAttribArray(location);
    gl.vertexAttribPointer(location, 4, gl.FLOAT, false, 0, 0);
    gl.vertexAttribDivisor(location, 1);
  };

  const setCommonAttributes = (program, corners, geometryBuffer, geometryLocation) => {
    gl.bindBuffer(gl.ARRAY_BUFFER, corners);
    gl.enableVertexAttribArray(program.corner);
    gl.vertexAttribPointer(program.corner, 2, gl.FLOAT, false, 0, 0);
    gl.vertexAttribDivisor(program.corner, 0);
    setGeometryAttribute(program, geometryBuffer, geometryLocation);
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.enableVertexAttribArray(program.value);
    gl.vertexAttribPointer(program.value, 1, gl.FLOAT, false, 0, 0);
    gl.vertexAttribDivisor(program.value, 1);
  };

  const setPaletteUniforms = (program, domain, colorRange) => {
    gl.uniform2f(program.colorDomain, domain[0], domain[1]);
    gl.uniform2f(program.colorRange, colorRange[0], colorRange[1]);
    gl.uniform1i(program.palette, 0);
  };

  const drawRectangles = (geometryBuffer, count, program, options) => {
    if (!count) return;

    gl.useProgram(program.program);
    setCommonAttributes(program, rectangleCorners, geometryBuffer, program.geometry);
    gl.uniform2f(program.resolution, width, height);
    gl.uniform1f(program.xScale, options.xScale || 1);
    gl.uniform1f(program.xOffset, options.xOffset || 0);
    gl.uniform1f(program.blockGap, options.blockGap || 0);
    gl.uniform1i(program.usePalette, options.usePalette ? 1 : 0);
    gl.uniform4fv(program.solidColor, options.color);
    setPaletteUniforms(program, options.domain, options.range);
    gl.drawArraysInstanced(gl.TRIANGLES, 0, 6, count);
  };

  const uploadAndDrawRectangles = (data, count, color) => {
    gl.bindBuffer(gl.ARRAY_BUFFER, overlayBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.DYNAMIC_DRAW);
    drawRectangles(overlayBuffer, count, programs[0], {
      usePalette: false,
      color,
      domain: [0, 1],
      range: [0, 1]
    });
  };

  return {
    resize(nextWidth, nextHeight, pixelRatio = 1) {
      width = nextWidth;
      height = nextHeight;
      const pixelWidth = Math.max(1, Math.round(width * pixelRatio));
      const pixelHeight = Math.max(1, Math.round(height * pixelRatio));

      if (canvas.width !== pixelWidth || canvas.height !== pixelHeight) {
        canvas.width = pixelWidth;
        canvas.height = pixelHeight;
      }

      gl.viewport(0, 0, pixelWidth, pixelHeight);
    },

    setGeometry(staff, rectangles, lines) {
      staffCount = staff.length / 4;
      rectangleCount = rectangles.length / 4;
      lineCount = lines.length / 4;

      gl.bindBuffer(gl.ARRAY_BUFFER, staffBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, staff, gl.DYNAMIC_DRAW);
      gl.bindBuffer(gl.ARRAY_BUFFER, rectangleBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, rectangles, gl.DYNAMIC_DRAW);
      gl.bindBuffer(gl.ARRAY_BUFFER, lineBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, lines, gl.DYNAMIC_DRAW);
      uploadColorValues();
    },

    setColors(values) {
      colorValues = values;
      uploadColorValues();
    },

    draw({ coverColor, coverOpacity, staffColor, playheads, colorDomain, colorRange, scrollOffset, dataScale, blockGap }) {
      if (!width || !height) return;

      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

      drawRectangles(staffBuffer, staffCount, programs[0], {
        usePalette: false,
        color: staffColor,
        domain: colorDomain,
        range: colorRange,
        xScale: 1,
        xOffset: 0,
        blockGap: 0
      });
      drawRectangles(rectangleBuffer, rectangleCount, programs[0], {
        usePalette: true,
        color: [1, 1, 1, 1],
        domain: colorDomain,
        range: colorRange,
        xScale: dataScale || 1,
        xOffset: scrollOffset,
        blockGap: blockGap || 0
      });

      if (lineCount) {
        const program = programs[1];
        gl.useProgram(program.program);
        setCommonAttributes(program, lineCorners, lineBuffer, program.geometry);
        gl.uniform2f(program.resolution, width, height);
        gl.uniform1f(program.xScale, dataScale || 1);
        gl.uniform1f(program.xOffset, scrollOffset || 0);
        gl.uniform1i(program.usePalette, 1);
        gl.uniform4f(program.solidColor, 1, 1, 1, 1);
        setPaletteUniforms(program, colorDomain, colorRange);
        gl.drawArraysInstanced(gl.TRIANGLES, 0, 6, lineCount);
      }

      if (coverOpacity > 0) {
        uploadAndDrawRectangles(new Float32Array([0, 0, width, height]), 1, [
          coverColor[0], coverColor[1], coverColor[2], coverOpacity
        ]);
      }

      uploadAndDrawRectangles(playheads.subarray(0, 4), 1, [248 / 255, 113 / 255, 113 / 255, 1]);
      uploadAndDrawRectangles(playheads.subarray(4, 8), 1, [248 / 255, 113 / 255, 113 / 255, 0.5]);
    },

    destroy() {
      gl.deleteBuffer(rectangleCorners);
      gl.deleteBuffer(lineCorners);
      gl.deleteBuffer(staffBuffer);
      gl.deleteBuffer(rectangleBuffer);
      gl.deleteBuffer(lineBuffer);
      gl.deleteBuffer(colorBuffer);
      gl.deleteBuffer(overlayBuffer);
      gl.deleteTexture(paletteTexture);
      gl.deleteProgram(rectangleProgram);
      gl.deleteProgram(lineProgram);
    }
  };
};
