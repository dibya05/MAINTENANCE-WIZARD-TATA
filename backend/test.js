require('dotenv').config();
fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`)
  .then(res => res.json())
  .then(data => console.log(JSON.stringify(data.models.map(m => m.name), null, 2)))
  .catch(err => console.error(err));
