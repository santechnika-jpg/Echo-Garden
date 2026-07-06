# Echo Garden

Echo Garden yra statinis mobilus web žaidimas apie šviesos, garso ir atminties sekas naktiniame bioliuminescenciniame sode.

## Kaip žaisti

1. Atidaryk žaidimą telefone arba naršyklėje.
2. Paspausk **Pradėti**.
3. Sodas parodys 3 impulsų seką: augalai švysteli, pajuda ir, jei garsas įjungtas, sugeneruoja švelnų toną.
4. Paliesk augalus ta pačia tvarka.
5. Kiekvienas sėkmingas raundas prideda vieną naują impulsą.
6. Suklydus žaidimas neperkraunamas: sodas švelniai pritemsta ir pakartoja tą pačią seką.

Po 5, 10 ir 15 sėkmingų raundų sodas įgauna papildomų vizualinių sluoksnių: daugiau žvaigždžių, lengvą rūką, lėtai judančias šviesas ir ryškesnes žydėjimo detales.

## Valdymas

- **Pradėti / Iš naujo** - pradeda naują seką.
- **Pakartoti seką** - dar kartą parodo dabartinę melodiją.
- **Garsas įj. / išj.** - įjungia arba išjungia Web Audio API tonus.
- **Pauzė / Tęsti** - pristabdo žaidimą.
- **Reset** - grąžina žaidimą į pradinę būseną.

Garsas pradedamas tik po pirmo vartotojo paspaudimo, kad veiktų mobiliųjų naršyklių taisyklės. Išjungus garsą, žaidimas lieka pilnai žaidžiamas pagal vizualinius signalus.

## Paleidimas lokaliai

Build proceso nereikia. Galima atidaryti `index.html` tiesiogiai, bet service worker ir offline režimui geriau paleisti per vietinį serverį:

```bash
python -m http.server 4173
```

Tada atidaryk:

```text
http://localhost:4173
```

## GitHub Pages publikavimas

1. Įkelk visus šiuos failus į repository šaknį:
   - `index.html`
   - `styles.css`
   - `game.js`
   - `manifest.webmanifest`
   - `service-worker.js`
   - `README.md`
2. GitHub repository eik į **Settings -> Pages**.
3. Pasirink **Deploy from a branch**.
4. Branch: `main` arba `master`, folder: `/root`.
5. Išsaugok. Po kelių minučių žaidimas bus pasiekiamas per GitHub Pages nuorodą.

## Techninė struktūra

- Vanilla HTML, CSS ir JavaScript.
- Be išorinių bibliotekų.
- Web Audio API kiekvieno augalo tonams.
- `localStorage` geriausiam raundui.
- `requestAnimationFrame` subtiliems aplinkos efektams.
- `service-worker.js` su cache versija `echo-garden-v2`.
- Offline veikimas po pirmo užkrovimo.

## Kokybės patikros

Naudotos patikros:

```bash
node --check game.js
python -m json.tool manifest.webmanifest
python -m http.server 4173
curl -I http://localhost:4173/
```
