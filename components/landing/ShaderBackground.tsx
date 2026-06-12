"use client";

import { useEffect, useRef } from "react";

export function ShaderBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const containerEl = containerRef.current;
    const canvasEl = canvasRef.current;
    if (!containerEl || !canvasEl) return;
    const container = containerEl;
    const canvas = canvasEl;

    function syncSize() {
      const w = container.clientWidth || 1280;
      const h = container.clientHeight || 720;
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
    }

    const resizeObserver = new ResizeObserver(syncSize);
    resizeObserver.observe(container);
    syncSize();

    const glCtx = (canvas.getContext("webgl") || canvas.getContext("experimental-webgl")) as WebGLRenderingContext | null;
    if (!glCtx) return;
    const gl = glCtx;

    const vs = `attribute vec2 a_position; varying vec2 v_texCoord; void main() { v_texCoord = a_position * 0.5 + 0.5; gl_Position = vec4(a_position, 0.0, 1.0); }`;
    const fs = `precision highp float;
      uniform vec2 u_resolution; varying vec2 v_texCoord;
      void main() {
        vec2 uv = v_texCoord;
        vec2 pos = uv * u_resolution.xy / 100.0;
        vec2 grid_uv = fract(pos) - 0.5;
        float dots = smoothstep(0.05, 0.0, length(grid_uv));
        vec3 bgColor = vec3(0.043, 0.059, 0.102);
        vec3 finalColor = bgColor;
        finalColor += dots * 0.025;
        gl_FragColor = vec4(finalColor, 1.0);
      }`;

    function createShader(type: number, src: string) {
      const s = gl.createShader(type)!;
      gl.shaderSource(s, src);
      gl.compileShader(s);
      return s;
    }

    const prog = gl.createProgram();
    gl.attachShader(prog, createShader(gl.VERTEX_SHADER, vs));
    gl.attachShader(prog, createShader(gl.FRAGMENT_SHADER, fs));
    gl.linkProgram(prog);
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);

    const pos = gl.getAttribLocation(prog, "a_position");
    gl.enableVertexAttribArray(pos);
    gl.vertexAttribPointer(pos, 2, gl.FLOAT, false, 0, 0);

    const uRes = gl.getUniformLocation(prog, "u_resolution");

    gl.viewport(0, 0, canvas.width, canvas.height);
    if (uRes) gl.uniform2f(uRes, canvas.width, canvas.height);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  return (
    <div ref={containerRef} className="fixed inset-0 -z-10 opacity-50 pointer-events-none">
      <canvas ref={canvasRef} className="block w-full h-full" />
    </div>
  );
}
