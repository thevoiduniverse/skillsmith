if (typeof registerPaint !== 'undefined') {
  registerPaint('smooth-corners', class {
    static get inputProperties() {
      return ['--corner-radius'];
    }

    paint(ctx, size, properties) {
      const w = size.width;
      const h = size.height;
      const r = Math.min(
        parseFloat(properties.get('--corner-radius')) || 0,
        w / 2,
        h / 2
      );

      if (r === 0) {
        ctx.fillRect(0, 0, w, h);
        return;
      }

      // iOS continuous corner approximation
      // p: extended tangent distance (curve starts further from corner)
      // k: bezier offset factor (controls how close curve passes to corner)
      const p = Math.min(r * 1.6, Math.min(w, h) / 2);
      const k = 0.155;

      ctx.beginPath();
      ctx.moveTo(p, 0);
      ctx.lineTo(w - p, 0);
      ctx.bezierCurveTo(w - p * k, 0, w, p * k, w, p);
      ctx.lineTo(w, h - p);
      ctx.bezierCurveTo(w, h - p * k, w - p * k, h, w - p, h);
      ctx.lineTo(p, h);
      ctx.bezierCurveTo(p * k, h, 0, h - p * k, 0, h - p);
      ctx.lineTo(0, p);
      ctx.bezierCurveTo(0, p * k, p * k, 0, p, 0);
      ctx.closePath();
      ctx.fillStyle = '#fff';
      ctx.fill();
    }
  });
}
