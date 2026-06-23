const token = process.env.VITE_CHARTMETRIC_REFRESH_TOKEN || 'ZahzPHm6T5iyTnzdCJF4jaQN5GjAn7emH83Pc3jHoF9W1ss0u50OImXM5Lc9RS6C';
fetch('https://api.chartmetric.com/api/token', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ refreshtoken: token })
})
.then(res => res.json())
.then(console.log)
.catch(console.error);
