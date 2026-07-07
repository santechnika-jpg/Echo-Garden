# Echo Garden

Echo Garden yra statinis mobilus web žaidimas apie šviesos, garso ir atminties sekas naktiniame bioliuminescenciniame sode.

## Kaip žaisti

1. Atidaryk žaidimą telefone arba naršyklėje.
2. Pasirink režimą, jei nori kitokio ritmo.
3. Paspausk **Pradėti**.
4. Sodas parodys 3 impulsų seką: augalai švysteli, pajuda ir, jei garsas įjungtas, sugeneruoja švelnų toną.
5. Paliesk augalus ta pačia tvarka.
6. Kiekvienas sėkmingas raundas prideda vieną naują impulsą.
7. Suklydus žaidimas neperkraunamas: sodas švelniai pritemsta arba, Zen režime, ramiai pakartoja tą pačią seką.

Po 5, 10 ir 15 sėkmingų raundų sodas įgauna papildomų vizualinių sluoksnių: daugiau žvaigždžių, lengvą rūką, lėtai judančias šviesas ir ryškesnes žydėjimo detales.

## Režimai

- **Klasika** - pagrindinis Echo Garden ritmas.
- **Zen** - klaidos nepritamsina sodo; seka tiesiog grįžta ramiau.
- **Dienos** - tos pačios dienos pradinis seed'as visiems bandymams.
- **Lėtas** - ilgesni tarpai tarp impulsų, patogiau mokytis.

## Valdymas

- **Pradėti / Iš naujo** - pradeda naują seką.
- **Pakartoti seką** - dar kartą parodo dabartinę melodiją.
- **Garsas įj. / išj.** - įjungia arba išjungia Web Audio API tonus.
- **Pauzė / Tęsti** - pristabdo žaidimą. Jei pauzė įjungiama sekos rodymo metu, tęsiama nuo sustojimo vietos.
- **Atstatyti** - grąžina žaidimą į pradinę būseną.
- **Mažiau judesio** - sumažina CSS ir canvas animacijas.
- **Ryškus kontrastas** - padidina teksto, valdiklių ir augalų kontrastą.

Garsas pradedamas tik po pirmo vartotojo paspaudimo, kad veiktų mobiliųjų naršyklių taisyklės. Išjungus garsą, žaidimas lieka pilnai žaidžiamas pagal vizualinius signalus. Telefonuose su palaikymu augalų paspaudimai ir klaidos taip pat turi subtilią vibraciją.

## Paleidimas lokaliai

Build proceso nereikia. Galima atidaryti `index.html` tiesiogiai, bet service worker ir offline režimui geriau paleisti per vietinį serverį:

```bash
python -m http.server 4173
```

Tada atidaryk:

```text
http://localhost:4173
```

Jei naudoji Node, galima paleisti:

```bash
npm run serve
```

## GitHub Pages publikavimas

1. Įkelk visus šiuos failus ir katalogus į repository šaknį:
   - `index.html`
   - `styles.css`
   - `game.js`
   - `manifest.webmanifest`
   - `service-worker.js`
   - `icons/`
   - `scripts/`
   - `package.json`
   - `project-manifest.yaml`
   - `README.md`
2. GitHub repository eik į **Settings -> Pages**.
3. Pasirink **Deploy from a branch**.
4. Branch: `main` arba `master`, folder: `/root`.
5. Išsaugok. Po kelių minučių žaidimas bus pasiekiamas per GitHub Pages nuorodą.

## Techninė struktūra

- Vanilla HTML, CSS ir JavaScript.
- Be išorinių bibliotekų.
- Web Audio API kiekvieno augalo tonams.
- `localStorage` geriausiam raundui ir žaidėjo pasirinkimams.
- `requestAnimationFrame` subtiliems aplinkos efektams, su sumažinto judesio režimu.
- Deterministinis dienos seed'as `Dienos` režimui.
- `service-worker.js` su cache versija `echo-garden-v3`.
- Offline veikimas po pirmo užkrovimo.
- `project-manifest.yaml` aktyvaus projekto riboms ir leidimų taisyklėms.

## Kokybės patikros

Naudojamos patikros:

```bash
npm run check
```

Komanda patikrina:

- `game.js` sintaksę;
- `service-worker.js` sintaksę;
- `manifest.webmanifest` JSON struktūrą;
- PWA ikonų nuorodas;
- svarbiausių HTML valdiklių buvimą;
- service worker cache sąrašą.
