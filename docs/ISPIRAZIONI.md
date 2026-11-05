# Da dove ho preso spunto

Prima di scrivere il motore ho studiato il codice di alcune app open source che consigliano cosa indossare o gestiscono un
armadio digitale. **Non ho copiato codice**: ho letto come ragionano e ho riscritto da zero, in TypeScript, le idee che mi
sembravano più sensate. Le licenze qui sotto dicono cosa si può riusare; per i progetti AGPL o senza licenza ho preso solo
spunti di design.

| Progetto | Licenza | Cosa fa | Cosa ho imparato |
|---|---|---|---|
| [Anyesh/wardrowbe](https://github.com/Anyesh/wardrowbe) | MIT | Armadio digitale con suggerimenti: un pre-filtro a regole sceglie i capi, poi un modello linguistico compone l'outfit | Punteggio dei capi come prodotto di fattori (meteo × formalità × stagione × uso recente × preferenza), sensibilità al freddo, sbalzo di temperatura ≥ 8° da gestire con strati togliibili, intervalli di lavaggio, preferiti, "ultima volta indossato" |
| [kamil-kucharski/vestiq](https://github.com/kamil-kucharski/vestiq) | MIT | Stylist a regole tutto sul dispositivo (Android) | Più varianti dello stesso giorno scelte con un **bonus di diversità** basato sulla somiglianza di Jaccard; regole strutturali (niente scarpe sportive in contesti formali, cravatta solo con la camicia) |
| [lilja/clothes-by-weather](https://github.com/lilja/clothes-by-weather) | MIT | Piccola tabella meteo → vestiti | Soglie pratiche: maglione sotto i 15°, giacca leggera 15-18°, giacca pesante 5-15°, ombrello già dal 20-40% di pioggia, pantaloni lunghi con vento forte |
| [mthaak/whatshouldiweartoday](https://github.com/mthaak/whatshouldiweartoday) | nessuna | App meteo per il tragitto casa-lavoro | Usare la temperatura **percepita** e il meteo delle **ore in cui sei fuori**, non la media del giorno |
| [Paullitsc/Style-It-Yourself](https://github.com/Paullitsc/Style-It-Yourself) | AGPL-3.0 | Valutazione della coerenza di un outfit | Neutri che vanno con tutto (navy, beige, denim…), armonie per tonalità, penalità quando la formalità dei capi è troppo diversa |
| [TracySteel/shimmer-strip](https://github.com/TracySteel/shimmer-strip) | nessuna | Generatore di outfit | Fasce climatiche con probabilità di uno strato in più, niente vestito con il freddo |
| [googlarz/fashion-skill](https://github.com/googlarz/fashion-skill) | CC BY 4.0 | Regole di stile scritte per un assistente | Evitare di riproporre lo stesso outfit a breve distanza |
| [Lazztech/Libre-Closet](https://github.com/Lazztech/Libre-Closet) | AGPL-3.0 | Armadio digitale PWA | Idee di interfaccia: più colori per capo, stato di lavaggio, archivio |

## Cosa è entrato nell'app

- **Soglie riviste** sulla temperatura percepita (corretta di ±3° per chi è freddoloso o caloroso):
  maglione o felpa sotto i 15°, giacca leggera fino a 18°, maniche corte da sole solo sopra i 18°.
- **Ombrello pieghevole "per sicurezza"** dal 25% di probabilità di pioggia; con vento forte niente bermuda.
- **Formalità da 1 a 5** per ogni capo (dalla tuta alle décolleté): un capo non può essere più di due gradini lontano dalla
  media di quelli già scelti, così non escono scarpe da corsa con il blazer.
- **Tre idee diverse** per ogni giornata e ogni impegno: il motore genera nove varianti e ne tiene tre che si somigliano il
  meno possibile (somiglianza di Jaccard), con un titolo che dice in cosa sono diverse ("Più elegante", "Con fantasia",
  "Con la tuta intera"…).
- **Armadio più furbo**: capi preferiti (+2 nel punteggio), capi "da lavare" esclusi, pulsante **"Lo metto oggi"** che conta
  gli usi e fa variare le proposte dei due giorni seguenti.
- **Catalogo più ricco**: gilet, parka, giacca di pelle, pantaloni cargo e di velluto, pantaloni palazzo, tuta intera, sandali
  col tacco, cravatta, cappello di paglia.

## Cosa ho aggiunto io

- Nessuno dei progetti studiati considera l'**indice UV**: occhiali e cappello in base a UV e sole sono una regola mia.
- Gli **impegni** (cena elegante, palestra…) con l'outfit calcolato sul meteo di quell'ora estendono l'idea del tragitto
  casa-lavoro di whatshouldiweartoday: ogni impegno ha la sua occasione e la sua lista "in borsa".
- Le **fantasie** (righe, quadri, pois, fiori) scelte in base a stagione e occasione e disegnate sulle **sagome SVG** fatte a
  mano, al posto delle foto quando non ci sono.
