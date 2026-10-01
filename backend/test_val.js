const { z } = require('zod');

async function testPut() {
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  const putSchema = z.object({
    date: z.string().regex(dateRegex).refine(val => new Date(val) <= new Date(Date.now() + 86400000), 'Future dates are not allowed'),
    memberId: z.string().length(24),
    status: z.enum(['P', 'A'])
  });

  try {
    const payload = putSchema.parse({
      date: '2026-10-01',
      memberId: '64d2b2f0e4b0a1a2b3c4d5e6',
      status: 'P'
    });
    console.log("Validation PASSED:", payload);
  } catch(e) {
    console.log("Validation FAILED:", e.errors);
  }
}
testPut();
