
async function loadFixtures(){
  const res = await fetch('./data/fixtures.json');
  const data = await res.json();

  const container = document.getElementById('fixtures');

  data.matches.forEach(match=>{
    const card = document.createElement('div');
    card.className = 'fixture-card';

    card.innerHTML = `
      <div class="fixture-top">
        <span>${match.group}</span>
        <span>${match.date}</span>
      </div>

      <div class="fixture-teams">
        ${match.home} vs ${match.away}
      </div>

      <div style="margin-top:8px;color:#9ca3af">
        🏟 ${match.venue}
      </div>
    `;

    container.appendChild(card);
  });
}

loadFixtures();
