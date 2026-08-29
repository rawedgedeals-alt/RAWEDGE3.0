const data = window.RAWEDGE_DATA || {casinos:[]};
const grid = document.getElementById("reviewGrid");
const offers = document.getElementById("offerGrid");
const filters = document.getElementById("filters");
document.getElementById("casinoCount").textContent = data.casinos.length;

const cats = ["All", ...new Set(data.casinos.map(x => x.category))];
filters.innerHTML = cats.map((c,i)=>`<button class="filter ${i===0?"active":""}" data-cat="${c}">${c}</button>`).join("");

function renderReviews(category="All"){
  const rows = category==="All" ? data.casinos : data.casinos.filter(x=>x.category===category);
  grid.innerHTML = rows.map(c=>`
    <article class="review-card">
      <div class="card-top"><span class="tag">${c.status}</span><span class="muted">DATA SCORE</span></div>
      <h3>${c.name}</h3>
      <div><span class="score">${c.score}</span><span class="muted"> / 10</span></div>
      <div class="stat-grid">
        <div class="stat"><b>${c.payout}</b><span>Redemption status</span></div>
        <div class="stat"><b>${c.minimum}</b><span>Minimum cashout</span></div>
        <div class="stat"><b>${c.playthrough}</b><span>Playthrough</span></div>
        <div class="stat"><b>${c.rtp}</b><span>RTP note</span></div>
      </div>
      <a class="card-link" href="${c.affiliate}" target="_blank" rel="sponsored nofollow noopener">View current offer</a>
    </article>`).join("");
}
function renderOffers(){
  offers.innerHTML = data.casinos.map(c=>`
    <article class="offer">
      <span class="tag">${c.category}</span>
      <h3>${c.name}</h3>
      <div class="bonus">${c.offer}</div>
      <p>Affiliate offer. Terms, eligibility, availability and wagering requirements can change.</p>
      <a class="card-link" href="${c.affiliate}" target="_blank" rel="sponsored nofollow noopener">Claim / view offer</a>
    </article>`).join("");
}
filters.addEventListener("click", e=>{
  if(!e.target.matches(".filter")) return;
  document.querySelectorAll(".filter").forEach(b=>b.classList.remove("active"));
  e.target.classList.add("active");
  renderReviews(e.target.dataset.cat);
});
renderReviews();
renderOffers();