const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NTI4NjUsImFwaV9rZXlfaWQiOjE1MDY1MiwidGltZXN0YW1wIjoxNzgxODc4Njc1MTQ5LCJpYXQiOjE3ODE4Nzg2NzUsImV4cCI6MTc4MTg4MjI3NX0.0n8GnR54HUHjKbFc5AR5c9MGp4RgKGDNtZ8XVhQNNGM';
fetch('https://api.chartmetric.com/api/search?q=Rema&type=artists&limit=1', {
  headers: { 'Authorization': `Bearer ${token}` }
})
.then(res => res.json())
.then(data => {
  const artist = data.obj.artists[0];
  console.log('Artist:', artist);
  return fetch(`https://api.chartmetric.com/api/artist/${artist.id}/tracks`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
})
.then(res => res.json())
.then(data => console.log('Tracks snippet:', data.obj.slice(0, 2)))
.catch(console.error);
