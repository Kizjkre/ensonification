class SpectralMorphProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.fftSize = 1024;
    this.bufferA = null;
    this.bufferB = null;
    this.morphFactor = 0.5; // Default interpolation factor
    this.offset = 0;

    this.port.onmessage = event => {
      switch (event.data.type) {
        case 'buffers':
          this.bufferA = event.data.bufferA;
          this.bufferB = event.data.bufferB;
          this.fftSize = Math.min(this.bufferA.length, this.bufferB.length);
          break;
        case 'morphFactor':
          this.morphFactor = event.data.value;
          break;
        case 'process':
          if (!this.bufferA || !this.bufferB) break;

          const { real: realA, imag: imagA } = this.fft(this.bufferA);
          const { real: realB, imag: imagB } = this.fft(this.bufferB);

          const morphedReal = new Float32Array(this.fftSize);
          const morphedImag = new Float32Array(this.fftSize);

          for (let i = 0; i < this.fftSize; i++) {
            morphedReal[i] = this.morphFactor * realA[i] + (1 - this.morphFactor) * realB[i];
            morphedImag[i] = this.morphFactor * imagA[i] + (1 - this.morphFactor) * imagB[i];
          }

          this.morphed = this.ifft(morphedReal, morphedImag);
          break;
      }
    };
  }

  fft(signal) {
    let real = new Float32Array(this.fftSize);
    let imag = new Float32Array(this.fftSize);

    for (let k = 0; k < this.fftSize; k++) {
      for (let n = 0; n < this.fftSize; n++) {
        let angle = (-2 * Math.PI * k * n) / this.fftSize;
        real[k] += signal[n] * Math.cos(angle);
        imag[k] += signal[n] * Math.sin(angle);
      }
    }
    return { real, imag };
  }

  ifft(real, imag) {
    let signal = new Float32Array(this.fftSize);
    for (let n = 0; n < this.fftSize; n++) {
      for (let k = 0; k < this.fftSize; k++) {
        let angle = (2 * Math.PI * k * n) / this.fftSize;
        signal[n] += (real[k] * Math.cos(angle) - imag[k] * Math.sin(angle)) / this.fftSize;
      }
    }
    return signal;
  }

  process(inputs, outputs) {
    if (!this.morphed) return true;

    const input = inputs[0];
    const output = outputs[0];
    for (let channel = 0; channel < input.length; ++channel) {
      const inputChannel = input[channel];
      const outputChannel = output[channel];
      for (let i = this.offset; i < inputChannel.length + this.offset; ++i) {
        outputChannel[i] = this.morphed[i % this.fftSize];
        this.offset++;
      }
    }
    console.log(123);

    return true;
  }
}

registerProcessor('spectral-morph-processor', SpectralMorphProcessor);
