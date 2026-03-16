async function testFlow() {
  try {
    const res1 = await fetch('http://localhost:3000/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'ricshark@gmail.com' })
    });
    const d1 = await res1.json();
    console.log('Forgot Password Response:', d1);

    if (d1.token) {
      const res2 = await fetch('http://localhost:3000/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: d1.token, password: 'novasenha' })
      });
      const d2 = await res2.json();
      console.log('Reset Password Response:', res2.status, d2);
    }
  } catch(e) { console.error('Error:', e) }
}
testFlow();
