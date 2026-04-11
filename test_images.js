const https = require('https');

const urls = [
  "https://images.unsplash.com/photo-1541410965313-d53b3c16ef17",
  "https://images.unsplash.com/photo-1532131926615-1a13e51082ce",
  "https://images.unsplash.com/photo-1614200187524-dc4b892acf16",
  "https://images.unsplash.com/photo-1506509748685-612a2083cb0f",
  "https://images.unsplash.com/photo-1534488972407-5a4aa6e47d83", // car
  "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7",
  "https://images.unsplash.com/photo-1493238792000-8113da705763", // car
  "https://images.unsplash.com/photo-1502877338535-766e1452684a", // car
  "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7",
  "https://images.unsplash.com/photo-1629858567156-f28329606d50", // F1
  "https://images.unsplash.com/photo-1515569067071-ec3b51335dd0", // race track
  "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7", // car
];

async function check() {
  for (const url of urls) {
    try {
      const res = await new Promise((resolve) => {
        https.get(url, (res) => {
          resolve(res.statusCode);
        });
      });
      console.log(url, res);
    } catch {
      console.log(url, "Error");
    }
  }
}
check();
