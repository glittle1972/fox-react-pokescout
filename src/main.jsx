import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Search, Sparkles, MapPin, Zap, Shield, Swords, RefreshCw, ChevronDown } from 'lucide-react';
import './styles.css';
import './name-filter.css';

const API = 'https://pokeapi.co/api/v2';
const regions = [
  ['all', 'All regions', ''], ['kanto', 'Kanto', 'generation-i'], ['johto', 'Johto', 'generation-ii'],
  ['hoenn', 'Hoenn', 'generation-iii'], ['sinnoh', 'Sinnoh', 'generation-iv'], ['unova', 'Unova', 'generation-v'],
  ['kalos', 'Kalos', 'generation-vi'], ['alola', 'Alola', 'generation-vii'], ['galar', 'Galar', 'generation-viii'], ['paldea', 'Paldea', 'generation-ix'],
];
const types = ['all', 'normal', 'fire', 'water', 'electric', 'grass', 'ice', 'fighting', 'poison', 'ground', 'flying', 'psychic', 'bug', 'rock', 'ghost', 'dragon', 'dark', 'steel', 'fairy'];
const typeColors = { normal:'#a8a77a', fire:'#ee8130', water:'#6390f0', electric:'#f7d02c', grass:'#7ac74c', ice:'#96d9d6', fighting:'#c22e28', poison:'#a33ea1', ground:'#e2bf65', flying:'#a98ff3', psychic:'#f95587', bug:'#a6b91a', rock:'#b6a136', ghost:'#735797', dragon:'#6f35fc', dark:'#705746', steel:'#b7b7ce', fairy:'#d685ad' };
const pretty = (s='') => s.replaceAll('-', ' ').replace(/\b\w/g, c => c.toUpperCase());

function PokeballMark() {
  return <svg width="21" height="21" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
    <path d="M3.2 12h17.6" stroke="currentColor" strokeWidth="2" />
    <circle cx="12" cy="12" r="3" fill="white" stroke="currentColor" strokeWidth="2" />
  </svg>;
}

async function getJson(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error('The Pokédex is taking a little nap. Try again in a moment!');
  return response.json();
}

function App() {
  const [type, setType] = useState('all');
  const [region, setRegion] = useState('all');
  const [nameQuery, setNameQuery] = useState('');
  const [includeEvolutions, setIncludeEvolutions] = useState(true);
  const [pokemon, setPokemon] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function findPokemon() {
    setBusy(true); setError('');
    try {
      const regionItem = regions.find(r => r[0] === region);
      const generation = regionItem?.[2];
      let pool = [];
      const query = nameQuery.trim().toLocaleLowerCase();
      if (query) {
        const data = await getJson(`${API}/pokemon?limit=10000`);
        const aliases = query.includes('gigantamax') ? [query, query.replaceAll('gigantamax', 'gmax')] : query.includes('gmax') ? [query, query.replaceAll('gmax', 'gigantamax')] : [query];
        pool = data.results.filter(entry => aliases.some(term => entry.name.toLocaleLowerCase().includes(term)));
      } else {
        if (generation) {
          const data = await getJson(`${API}/generation/${generation}`);
          pool = data.pokemon_species;
        } else {
          const data = await getJson(`${API}/pokemon-species?limit=1000`);
          pool = data.results;
        }
      }
      // Try a shuffled set so the result is fresh, while keeping API requests modest.
      pool = [...pool].sort(() => Math.random() - 0.5).slice(0, 30);
      let found = null;
      for (const entry of pool) {
        const pokemonData = query ? await getJson(entry.url) : null;
        const species = await getJson(query ? pokemonData.species.url : entry.url);
        if (!includeEvolutions && species.evolves_from_species) continue;
        if (generation && species.generation?.name !== generation) continue;
        const candidate = pokemonData || await getJson(`${API}/pokemon/${species.id}`);
        if (type !== 'all' && !candidate.types.some(t => t.type.name === type)) continue;
        found = { species, pokemon: candidate };
        break;
      }
      if (!found) throw new Error('No Pokémon found with those filters. Try another type or region!');
      const typeInfo = await Promise.all(found.pokemon.types.map(t => getJson(t.type.url)));
      const weak = new Set(); const strong = new Set();
      typeInfo.forEach(info => {
        info.damage_relations.double_damage_from.forEach(x => weak.add(x.name));
        info.damage_relations.double_damage_to.forEach(x => strong.add(x.name));
      });
      found.weaknesses = [...weak]; found.strengths = [...strong];
      found.regionName = pretty(region === 'all' ? regions.find(r => r[2] === found.species.generation.name)?.[1] || 'Unknown' : region);
      setPokemon(found);
    } catch (e) { setError(e.message || 'Something went wrong. Please try again.'); }
    finally { setBusy(false); }
  }

  return <main className="page-shell">
    <header className="topbar">
      <a className="brand" href="#top" aria-label="PokéScout home"><span className="brand-icon"><PokeballMark/></span><span>poké<span className="brand-accent">scout</span></span></a>
      <div className="top-note"><span className="online-dot"/> Your next discovery is out there</div>
      <span className="trainer-badge"><Sparkles size={15}/> TRAINER MODE</span>
    </header>

    <section className="hero" id="top">
      <div className="hero-copy">
        <div className="eyebrow"><span className="eyebrow-line"/> THE WORLD OF POKÉMON, YOUR WAY</div>
        <h1>Meet your next<br/><span>favorite Pokémon.</span></h1>
        <p className="hero-desc">Pick what you’re curious about and let’s find a Pokémon to meet. Your next adventure starts here!</p>
      </div>
      <div className="hero-art" aria-hidden="true">
        <div className="orbit orbit-one"/><div className="orbit orbit-two"/>
        <div className="sparkle sparkle-a">✦</div><div className="sparkle sparkle-b">✧</div><div className="sparkle sparkle-c">✦</div>
        <div className="sunburst"><span>✦</span></div>
        <div className="floating-chip chip-type">⚡&nbsp; TYPE</div><div className="floating-chip chip-region">⌖&nbsp; REGION</div>
        <div className="poke-orb"><div className="orb-red"/><div className="orb-white"/><div className="orb-band"/><div className="orb-center"><i/></div></div>
        <div className="art-caption">Gotta explore<br/>them all!</div>
      </div>
    </section>

    <section className="finder-card" aria-labelledby="finder-heading">
      <div className="finder-heading-row"><div className="heading-icon"><Search size={19}/></div><div><h2 id="finder-heading">Build your search</h2><p>Tell us what kind of Pokémon you want to meet.</p></div><div className="step-pill"><span>01</span> YOUR DISCOVERY</div></div>
      <div className="filters">
        <label className="filter-group"><span className="filter-label">POKÉMON NAME <span className="optional">OPTIONAL</span></span><span className="select-wrap name-wrap"><Search className="select-icon" size={16}/><input type="search" value={nameQuery} onChange={e => setNameQuery(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') findPokemon(); }} placeholder="e.g. pikachu, gigantamax" aria-label="Filter by Pokémon name"/></span></label>
        <label className="filter-group"><span className="filter-label">POKÉMON TYPE <span className="optional">OPTIONAL</span></span><span className="select-wrap"><Zap className="select-icon" size={17}/><select value={type} onChange={e => setType(e.target.value)}><option value="all">Any type</option>{types.slice(1).map(t => <option key={t} value={t}>{pretty(t)}</option>)}</select><ChevronDown size={16} className="chevron"/></span></label>
        <label className="filter-group"><span className="filter-label">REGION <span className="optional">OPTIONAL</span></span><span className="select-wrap"><MapPin className="select-icon" size={17}/><select value={region} onChange={e => setRegion(e.target.value)}>{regions.map(([id,name]) => <option value={id} key={id}>{name}</option>)}</select><ChevronDown size={16} className="chevron"/></span></label>
        <div className="filter-group evolution-group"><span className="filter-label">EVOLUTION STAGE</span><button className={`toggle-row ${includeEvolutions ? 'is-on' : ''}`} role="switch" aria-checked={includeEvolutions} onClick={() => setIncludeEvolutions(v => !v)}><span className="toggle"><i/></span><span><b>Include evolutions</b><small>{includeEvolutions ? 'All stages welcome' : 'Base forms only'}</small></span></button></div>
      </div>
      <button className="find-button" onClick={findPokemon} disabled={busy}>{busy ? <><span className="button-spinner"/> Searching the Pokédex…</> : <><Search size={18}/> Find my Pokémon <span className="button-sparkle">✦</span></>}</button>
      <div className="privacy-note"><Shield size={13}/> Just for fun — your search stays right here.</div>
    </section>

    {error && <div className="error-message" role="alert">{error}</div>}
    {pokemon ? <PokemonCard data={pokemon} onAgain={findPokemon}/> : <section className="empty-state"><div className="empty-art"><span className="empty-spark">✦</span><div className="empty-ball"><div/><i/></div><span className="empty-leaf">✧</span></div><h2>Your Pokédex is ready!</h2><p>Choose your filters above and tap <strong>Find my Pokémon</strong><br className="desktop-only"/> to meet someone new.</p><div className="empty-footer"><span/> A whole world of Pokémon awaits <span/></div></section>}
    <footer className="footer"><span>Made for curious trainers <span className="heart">♥</span></span><span>Pokémon data provided by <a href="https://pokeapi.co/" target="_blank" rel="noreferrer">PokéAPI</a></span></footer>
  </main>;
}

function TypeTag({ name }) { return <span className="type-tag" style={{'--type-color': typeColors[name] || '#9aa5a1'}}><span/> {pretty(name)}</span>; }
function PokemonCard({ data, onAgain }) {
  const { pokemon:p, species, weaknesses, strengths, regionName } = data;
  const image = p.sprites.other?.['official-artwork']?.front_default || p.sprites.front_default;
  const moves = [...p.moves].sort(() => Math.random() - 0.5).slice(0, 4).map(m => pretty(m.move.name));
  const stats = p.stats.filter(s => ['hp','attack','defense','speed'].includes(s.stat.name));
  const total = p.stats.reduce((sum,s) => sum + s.base_stat, 0);
  return <section className="result-card" aria-live="polite">
    <div className="result-top"><div className="result-kicker"><span className="result-star">✦</span> YOUR NEW DISCOVERY</div><button className="again-button" onClick={onAgain} disabled={false}><RefreshCw size={14}/> Find another</button></div>
    <div className="pokemon-main"><div className="pokemon-visual"><div className="visual-halo"/><div className="visual-spark">✦</div>{image && <img src={image} alt={pretty(p.name)} />}</div><div className="pokemon-info"><div className="dex-number">Nº {String(p.id).padStart(4,'0')} <span>•</span> {regionName} region</div><h2>{pretty(p.name)}</h2><div className="type-list">{p.types.map(t => <TypeTag key={t.type.name} name={t.type.name}/>)}</div><p className="flavor">{species.flavor_text_entries?.find(x => x.language.name === 'en')?.flavor_text?.replace(/[\n\f]/g,' ') || 'A wonderful Pokémon to add to your adventure!'}</p><div className="power-total"><span>BASE STATS</span><strong>{total}</strong><small>power points</small></div></div></div>
    <div className="result-grid"><div className="info-panel"><div className="panel-title"><span className="panel-icon stats-icon"><Zap size={15}/></span><h3>Power stats</h3></div><div className="stat-list">{stats.map(s => <div className="stat-row" key={s.stat.name}><span>{pretty(s.stat.name)}</span><div className="stat-track"><i style={{width:`${Math.min(s.base_stat / 150 * 100,100)}%`}}/></div><b>{s.base_stat}</b></div>)}</div></div>
    <div className="info-panel"><div className="panel-title"><span className="panel-icon attack-icon"><Swords size={15}/></span><h3>Attacks to know</h3></div><div className="move-list">{moves.map((m,i)=><span className="move-chip" key={i}>{m}</span>)}</div></div>
    <div className="info-panel matchup-panel"><div className="panel-title"><span className="panel-icon strength-icon"><Sparkles size={15}/></span><h3>Strong against</h3></div><div className="type-list compact">{strengths.length ? strengths.map(t=><TypeTag name={t} key={t}/>) : <span className="muted-copy">No special type advantage</span>}</div></div>
    <div className="info-panel matchup-panel"><div className="panel-title"><span className="panel-icon weakness-icon"><Shield size={15}/></span><h3>Watch out for</h3></div><div className="type-list compact">{weaknesses.length ? weaknesses.map(t=><TypeTag name={t} key={t}/>) : <span className="muted-copy">No special type weakness</span>}</div></div></div>
    <div className="result-source">Data from PokéAPI <span>•</span> Type matchups are based on the Pokémon’s type</div>
  </section>;
}

createRoot(document.getElementById('root')).render(<App/>);
