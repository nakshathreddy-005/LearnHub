// Small shared validator: rules = { field: { required, type: 'string'|'number', min, max, enum } }. Throws 400 with per-field errors.
export function check(body, rules) {
  const errors = {};
  for (const [k, r] of Object.entries(rules)) {
    let v = body[k];
    if (v === undefined || v === null || v === '') { if (r.required) errors[k] = `${r.label || k} is required`; continue; }
    if (r.type === 'number') {
      v = Number(v); if (!Number.isFinite(v)) { errors[k] = `${k} must be a number`; continue; }
      body[k] = v;
      if (r.min !== undefined && v < r.min) errors[k] = `Must be at least ${r.min}`;
      if (r.max !== undefined && v > r.max) errors[k] = `Must be at most ${r.max}`;
    } else if (r.type === 'string' && (typeof v !== 'string' || v.length > (r.max || 500))) errors[k] = `Must be text of at most ${r.max || 500} characters`;
    if (r.enum && !r.enum.includes(v)) errors[k] = `Must be one of: ${r.enum.join(', ')}`;
  }
  if (Object.keys(errors).length) throw Object.assign(new Error('Please fix the highlighted fields'), { status: 400, errors });
}
