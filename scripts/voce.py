# -*- coding: utf-8 -*-
"""La voce del narratore: legge un testo (o tutta la campagna) e ne fa un .mp3.

Sintesi in locale con Chatterbox Multilingual, clonando la voce di riferimento
`voci/narratore.wav` (la cartella voci/ resta fuori da git: e' una voce vera).
Ogni blocco letto viene RIASCOLTATO con Whisper: Chatterbox, specie sui pezzi
corti, a volte inventa sillabe o parole in coda («Mince, nallevare»). Se il
trascritto si allontana dal testo il blocco si rigenera; la coda dopo l'ultima
parola riconosciuta si taglia sempre.

Cosa si legge, nella campagna (mai le regole, mai la soluzione):
  - la lettera d'incarico, senza il corsivo finale «Luoghi disponibili...»;
  - il testo dei luoghi, intero;
  - delle tessere solo la parte narrativa, fino alla prima frase di regola
    («QUANDO RIVELATE...», «prova NERVI (Media)», «1 danno»...).

Uso:
  python scripts/voce.py "testo da leggere" -o uscita.mp3 [--effetto studio]
  python scripts/voce.py --file testo.txt -o uscita.mp3
  python scripts/voce.py --campagna [--episodi ep3,ep4] [--effetto studio]
  python scripts/voce.py --prova          # controlli sulla preparazione del testo

Effetti (--effetto, predefinito: studio):
  studio       voce calda e vicina, compressione dolce, stanza piccola in legno
  fonografo    banda stretta, saturazione, fruscio e crepitii da cilindro 1889
  sotterraneo  riverbero lungo e scuro, rombo grave di fondo
  noir         voce ravvicinata e compressa, eco corta, tappeto scuro
  nessuno      voce nuda: solo il volume portato allo stesso livello (loudnorm)

Cambiare la voce di riferimento:
  1. fermare una --campagna in corso: la voce si rilegge a ogni blocco, e
     sostituirla a meta' mescola due voci nello stesso file;
  2. ffmpeg -i nuovo.m4a -ac 1 -ar 24000 voci/narratore.wav
     (10-20 s, una voce sola, niente musica ne' riverbero, letta col tono voluto;
     una voce che si ha il diritto di usare: propria o di chi acconsente);
  3. i .mp3 gia' fatti si saltano: per rifarli con la voce nuova cancellare
     voci/generati/ (o solo voci/generati/ep3/) e rilanciare --campagna.
  Per provare una voce senza toccare quella principale: --voce voci/altra.wav.

Il primo avvio crea l'ambiente in %LOCALAPPDATA%\\osr-voce (~4 GB: torch CUDA,
Chatterbox, faster-whisper). Serve ffmpeg nel PATH.
La campagna riparte da dove si era fermata: i .mp3 gia' fatti si saltano.
"""
import argparse, difflib, json, os, re, subprocess, sys, tempfile, time
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
VENV = Path(os.environ.get('LOCALAPPDATA', Path.home())) / 'osr-voce'
PY = VENV / ('Scripts/python.exe' if os.name == 'nt' else 'bin/python')
VOCE = ROOT / 'voci' / 'narratore.wav'
USCITA = ROOT / 'voci' / 'generati'
EPISODI = ['preludio'] + [f'ep{i}' for i in range(1, 21)]


# --- ambiente ----------------------------------------------------------------

def nell_ambiente():
    """Rilancia lo script dentro il suo venv, creandolo la prima volta."""
    if Path(sys.prefix).resolve() == VENV.resolve():
        return
    if not (VENV / 'pronto').exists():
        print(f'Preparo l\'ambiente in {VENV} (solo la prima volta, ~4 GB)...', flush=True)
        uv = ['uv', 'pip', 'install', '-p', str(PY)]
        subprocess.run(['uv', 'venv', '-p', '3.11', str(VENV)], check=True)
        # setuptools<81: il watermarker di Chatterbox importa ancora pkg_resources
        subprocess.run(uv + ['chatterbox-tts', 'faster-whisper', 'num2words', 'setuptools<81'], check=True)
        subprocess.run(uv + ['torch', 'torchaudio', '--index-url', 'https://download.pytorch.org/whl/cu124',
                             '--reinstall-package', 'torch', '--reinstall-package', 'torchaudio'], check=True)
        (VENV / 'pronto').write_text('ok')
    sys.exit(subprocess.run([str(PY), __file__, *sys.argv[1:]]).returncode)


# --- preparazione del testo -----------------------------------------------------

# una frase di regola: da qui in poi la tessera non si legge (maiuscole volute)
REGOLA = re.compile(r'QUANDO RIVELATE|\b(?:NERVI|ACUME|VIGORE|DIFESA|SALUTE)\b|\((?:Facile|Media|Difficile)\)'
                    r'|Interagire|\bT\d\b|segnalin|\bround\b|\d+ dann[oi]\b|prossimo turno')
FRASI = re.compile(r'(?<=[.!?])\s+')


def numeri(t):
    """Chatterbox legge male le cifre («1741» -> «mindesat»): si scrivono in lettere."""
    from num2words import num2words
    n = lambda x, **k: num2words(int(x), lang='it', **k)
    t = re.sub(r'\b(\d{1,2}):(\d{2})\b', lambda m: n(m[1]) + ('' if m[2] == '00' else ' e ' + n(m[2])), t)
    t = re.sub(r'\b(\d+)°', lambda m: n(m[1], to='ordinal'), t)
    return re.sub(r'\d+', lambda m: n(m[0]), t)


def pulisci(t):
    t = re.sub(r'<br\s*/?>', ' ', t)
    t = re.sub(r'<[^>]+>', '', t)
    t = t.replace('’', "'").replace('…', '...')
    t = re.sub(r'[«»“”"]', '', t)
    t = re.sub(r'\s*[—–]\s*', ', ', t)
    t = re.sub(r'\bDott\.', 'Dottor', t)
    # il MAIUSCOLO enfatico si leggerebbe lettera per lettera
    t = re.sub(r"\b(?:[A-ZÀ-Ý]'[A-ZÀ-Ý]{2,}|[A-ZÀ-Ý]{2,}(?:'[A-ZÀ-Ý]+)?)\b", lambda m: m[0].lower(), t)
    t = numeri(t)
    t = re.sub(r',\s*([,.;:!?])', r'\1', t)
    return re.sub(r'\s+', ' ', t).strip(' ,')


def narrativa_tessera(t):
    frasi = FRASI.split(t or '')
    i = next((k for k, f in enumerate(frasi) if REGOLA.search(f)), len(frasi))
    return ' '.join(frasi[:i])


def narrativa_lettera(html):
    # il corsivo lungo e' il promemoria per i giocatori; quello breve e' enfasi
    return re.sub(r'<i>(.*?)</i>', lambda m: '' if len(m[1]) > 40 else m[1], html or '', flags=re.S)


def blocchi(t, minimo=120, massimo=250):
    """Frasi raggruppate in blocchi: sotto i ~120 caratteri Chatterbox inventa parole."""
    pezzi = []
    for f in FRASI.split(t):
        while len(f) > massimo:   # frase lunghissima: si spezza all'ultima pausa utile
            cut = max(f.rfind(c, 0, massimo) for c in ',;:')
            if cut < minimo // 2: break
            pezzi.append(f[:cut + 1]); f = f[cut + 1:].strip()
        pezzi.append(f)
    out, cur = [], ''
    for p in pezzi:
        if cur and len(cur) + len(p) > massimo and len(cur) >= minimo // 2:
            out.append(cur); cur = ''
        cur = (cur + ' ' + p).strip()
        if len(cur) >= minimo: out.append(cur); cur = ''
    if cur:
        if out and len(cur) < minimo // 2: out[-1] += ' ' + cur
        else: out.append(cur)
    return out


# --- effetti (ffmpeg) -------------------------------------------------------------

def _ir(nome, durata, ritardo, taglio):
    """Risposta all'impulso sintetica: rumore rosa con coda esponenziale."""
    p = VENV / f'ir_{nome}.wav'
    if not p.exists():
        af = (f'adelay={ritardo},' if ritardo else '') + f'afade=t=out:st=0:d={durata}:curve=exp,lowpass=f={taglio}'
        subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-f', 'lavfi', '-i',
                        f'anoisesrc=color=pink:d={durata}:a=0.5:r=24000', '-af', af, '-ac', '1', str(p)], check=True)
    return str(p)


def effetto(nome, wav, mp3, durata):
    rumore = lambda colore, a: ['-f', 'lavfi', '-t', str(durata), '-i', f'anoisesrc=color={colore}:a={a}:r=24000']
    if nome == 'nessuno':
        ing, fc = [], '[0]loudnorm=I=-18'
    elif nome == 'studio':
        ing = ['-i', _ir('studio', 0.7, 0, 5000)]
        fc = ('[0]highpass=f=70,equalizer=f=160:t=q:w=1:g=3,equalizer=f=3500:t=q:w=1.5:g=-2,'
              'acompressor=threshold=-20dB:ratio=3:attack=10:release=200,asplit[d][w];'
              '[w][1]afir=dry=10:wet=10[r];[d][r]amix=inputs=2:weights=1 0.18,loudnorm=I=-18')
    elif nome == 'fonografo':
        ing = rumore('pink', 0.02) + ['-f', 'lavfi', '-t', str(durata), '-i',
                                      'aevalsrc=if(lt(random(0)\\,0.0006)\\,random(1)*0.6-0.3\\,0):s=24000']
        fc = ('[0]highpass=f=250,lowpass=f=3800,acompressor=threshold=-24dB:ratio=6,'
              'asoftclip=type=atan:param=1.2,equalizer=f=1500:t=q:w=1:g=4[v];'
              '[1]highpass=f=800,lowpass=f=5000[n];[2]lowpass=f=4000[c];'
              '[v][n][c]amix=inputs=3:weights=1 0.5 0.6:normalize=0,loudnorm=I=-18')
    elif nome == 'sotterraneo':
        ing = ['-i', _ir('sotterraneo', 3.5, 60, 2200)] + rumore('brown', 0.08)
        fc = ('[0]highpass=f=70,equalizer=f=140:t=q:w=1:g=2,acompressor=threshold=-20dB:ratio=3,asplit[d][w];'
              '[w][1]afir=dry=10:wet=10[r];[2]lowpass=f=120,volume=0.6[rb];'
              '[d][r][rb]amix=inputs=3:weights=1 0.35 0.5:normalize=0,loudnorm=I=-18')
    elif nome == 'noir':
        ing = rumore('brown', 0.05)
        fc = ('[0]highpass=f=60,equalizer=f=120:t=q:w=0.8:g=4,equalizer=f=6000:t=h:w=2000:g=-4,'
              'acompressor=threshold=-26dB:ratio=5:attack=5:release=150:makeup=4,aecho=0.85:0.5:110:0.18[v];'
              '[1]lowpass=f=300,highpass=f=40[t];[v][t]amix=inputs=2:weights=1 0.35:normalize=0,loudnorm=I=-18')
    else:
        raise SystemExit(f'effetto sconosciuto: {nome}')
    mp3 = Path(mp3); mp3.parent.mkdir(parents=True, exist_ok=True)
    tmp = mp3.with_suffix('.tmp.mp3')
    subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-i', str(wav), *ing, '-filter_complex', fc,
                    '-b:a', '128k', str(tmp)], check=True)
    tmp.replace(mp3)   # niente .mp3 a meta': la campagna li salta se esistono


# --- sintesi ----------------------------------------------------------------------

class Narratore:
    def __init__(self, voce, pausa):
        import torch
        from chatterbox.mtl_tts import ChatterboxMultilingualTTS
        from faster_whisper import WhisperModel
        if not Path(voce).exists():
            raise SystemExit(f'manca la voce di riferimento: {voce}')
        self.torch, self.voce, self.pausa = torch, str(voce), pausa
        self.tts = ChatterboxMultilingualTTS.from_pretrained(device='cuda')
        # Whisper su CPU: lascia la GPU a Chatterbox e la scalda di meno
        self.orecchio = WhisperModel('small', device='cpu', compute_type='int8')
        self.sr = self.tts.sr

    def _blocco(self, testo):
        """Genera un blocco, lo riascolta, taglia la coda; fino a 3 tentativi."""
        import torchaudio
        parole = lambda s: re.findall(r'\w+', numeri(s).lower())
        meglio = (-1, None)
        for _ in range(3):
            w = self.tts.generate(testo, language_id='it', audio_prompt_path=self.voce,
                                  exaggeration=0.4, cfg_weight=0.3, temperature=0.7)
            with tempfile.NamedTemporaryFile(suffix='.wav', delete=False) as f: p = f.name
            torchaudio.save(p, w, self.sr)
            segs, _ = self.orecchio.transcribe(p, language='it', word_timestamps=True)
            ws = [x for s in segs for x in (s.words or [])]
            os.unlink(p)
            sim = difflib.SequenceMatcher(None, parole(testo), parole(' '.join(x.word for x in ws))).ratio()
            if ws:   # la coda dopo l'ultima parola riconosciuta e' spesso una sillaba inventata
                w = w[:, :min(w.shape[1], int((ws[-1].end + 0.25) * self.sr))]
            if sim > meglio[0]: meglio = (sim, w)
            time.sleep(self.pausa)   # respiro alla GPU
            if sim >= 0.85: break
        return meglio

    def leggi(self, testo, mp3, nome_effetto):
        bs = blocchi(pulisci(testo))
        if not bs: return None
        silenzio = self.torch.zeros(1, int(self.sr * 0.35))
        pezzi, sims = [], []
        for b in bs:
            sim, w = self._blocco(b)
            pezzi += [w, silenzio]; sims.append(round(sim, 2))
        tutto = self.torch.cat(pezzi, 1)
        import torchaudio
        with tempfile.NamedTemporaryFile(suffix='.wav', delete=False) as f: wav = f.name
        torchaudio.save(wav, tutto, self.sr)
        effetto(nome_effetto, wav, mp3, tutto.shape[1] / self.sr + 1)
        os.unlink(wav)
        return {'blocchi': len(bs), 'somiglianza_min': min(sims), 'somiglianze': sims}


# --- campagna ------------------------------------------------------------------

def testi_episodio(ep):
    e = json.load(open(ROOT / 'webapp' / 'data' / f'{ep}.json', encoding='utf8'))
    if e.get('lettera'): yield 'lettera', narrativa_lettera(e['lettera'])
    for l in e.get('luoghi', []):
        if l.get('testo'): yield f'luogo-{str(l["n"]).zfill(2)}', l['testo']
    for t in e.get('tessere', []):
        n = narrativa_tessera(t.get('testo'))
        if n: yield t['id'], n


def campagna(args):
    eps = args.episodi.split(',') if args.episodi else EPISODI
    lavoro = [(ep, nome, t) for ep in eps for nome, t in testi_episodio(ep)
              if not (USCITA / ep / f'{nome}.mp3').exists()]
    print(f'{len(lavoro)} testi da leggere (gli altri ci sono gia\').', flush=True)
    if not lavoro: return
    nar = Narratore(args.voce, args.pausa)
    indice_p = USCITA / 'indice.json'
    indice = json.load(open(indice_p, encoding='utf8')) if indice_p.exists() else {}
    t0 = time.time()
    for k, (ep, nome, t) in enumerate(lavoro, 1):
        info = nar.leggi(t, USCITA / ep / f'{nome}.mp3', args.effetto)
        if info:
            indice[f'{ep}/{nome}.mp3'] = {**info, 'testo': t[:200]}
            json.dump(indice, open(indice_p, 'w', encoding='utf8'), ensure_ascii=False, indent=1)
        resto = (time.time() - t0) / k * (len(lavoro) - k) / 60
        print(f'[{k}/{len(lavoro)}] {ep}/{nome}  somiglianza min {info and info["somiglianza_min"]}'
              f'  (mancano ~{resto:.0f} min)', flush=True)
    dubbi = [k for k, v in indice.items() if v['somiglianza_min'] < 0.85]
    print(f'\nFatto. Da riascoltare ({len(dubbi)}): ' + ', '.join(dubbi) if dubbi else '\nFatto, nessun blocco dubbio.')


# --- controlli ----------------------------------------------------------------------

def prova():
    assert numeri('nel 1741') == 'nel millesettecentoquarantuno', numeri('nel 1741')
    assert numeri('dalle 18:00 alle 22:30') == 'dalle diciotto alle ventidue e trenta'
    assert pulisci('Appeso, VIVO — Tobia. «Il <b>Ladro</b>»') == 'Appeso, vivo, Tobia. Il Ladro'
    assert pulisci("L’ACCORDATORE canta") == "l'accordatore canta", pulisci("L’ACCORDATORE canta")
    t3 = ('La galleria si stringe e l’eco cambia mestiere: non ripete — RISPONDE. Chi entra in questa '
          'tessera per la prima volta prova NERVI (Difficile): la propria voce torna sbagliata.')
    assert narrativa_tessera(t3).endswith('RISPONDE.'), narrativa_tessera(t3)
    t6 = 'Di spalle, un uomo sta accordando la pietra. QUANDO RIVELATE QUESTA TESSERA: appare L’ACCORDATORE.'
    assert narrativa_tessera(t6) == 'Di spalle, un uomo sta accordando la pietra.'
    let = 'Trovate Tobia, <i>adesso</i>.<br/><br/><i>Luoghi disponibili dall’inizio: il Lavatoio Grande, la bottega.</i>'
    assert pulisci(narrativa_lettera(let)) == 'Trovate Tobia, adesso.', pulisci(narrativa_lettera(let))
    lungo = ('Una frase. ' * 30) + ('parola, ' * 60) + 'fine.'
    bs = blocchi(lungo)
    assert all(len(b) <= 60 + 250 for b in bs) and ' '.join(bs).split() == lungo.split(), [len(b) for b in bs]
    assert all(len(b) >= 60 for b in bs), [len(b) for b in bs]
    # sui dati veri: nessuna regola sopravvive nella parte letta delle tessere
    for ep in EPISODI:
        p = ROOT / 'webapp' / 'data' / f'{ep}.json'
        if not p.exists(): continue
        nomi = [n for n, _ in testi_episodio(ep)]
        assert len(nomi) == len(set(nomi)), (ep, 'due testi con lo stesso nome di file')
        for nome, t in testi_episodio(ep):
            assert not REGOLA.search(t if nome != 'lettera' else ''), (ep, nome)
            assert 'Luoghi disponibili' not in t and 'Aperti dall' not in t, (ep, nome)
    print('prova: tutto verde')


def main():
    nell_ambiente()
    a = argparse.ArgumentParser(description='La voce del narratore (Chatterbox, in locale).')
    a.add_argument('testo', nargs='?')
    a.add_argument('--file')
    a.add_argument('-o', '--uscita')
    a.add_argument('--effetto', default='studio', choices=['nessuno', 'studio', 'fonografo', 'sotterraneo', 'noir'],
                   help='trattamento audio (predefinito: studio; nessuno = solo volume uniforme)')
    a.add_argument('--voce', default=str(VOCE), help='voce di riferimento (predefinita: voci/narratore.wav)')
    a.add_argument('--pausa', type=float, default=0.0, help='secondi di riposo della GPU tra un blocco e l\'altro')
    a.add_argument('--campagna', action='store_true')
    a.add_argument('--episodi', help='es. ep3,ep4 (con --campagna)')
    a.add_argument('--prova', action='store_true')
    args = a.parse_args()
    if args.prova: return prova()
    if args.campagna: return campagna(args)
    testo = open(args.file, encoding='utf8').read() if args.file else args.testo
    if not testo or not args.uscita: a.error('serve un testo (o --file) e -o uscita.mp3')
    info = Narratore(args.voce, args.pausa).leggi(testo, args.uscita, args.effetto)
    print(f'{args.uscita}: {info}')


if __name__ == '__main__':
    main()
