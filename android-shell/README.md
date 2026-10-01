# Android-schil (Capacitor)

Verpakt de bestaande app (`index.html`) als Android-app. Er is **geen tweede versie van de code**: de
workflow neemt telkens de actuele `index.html` uit de repo-root en bouwt daar een APK van.

## Eenmalig instellen

1. Zet in de repo-root (naast `index.html`) deze twee mappen:
   - `android-shell/` (deze map)
   - `.github/workflows/android.yml`
2. Commit en push.

## Een APK bouwen

1. GitHub → tab **Actions** → **Android APK** → **Run workflow**.
2. Na ± 6–10 minuten staat de APK onder **Releases → android-latest → matchday-tracker.apk**
   (ook te downloaden onderaan de run zelf).
3. Open die releasepagina **op de telefoon**, tik op `matchday-tracker.apk`, sta "installeren uit
   onbekende bronnen" toe voor je browser en installeer.

Een nieuwe build installeer je gewoon over de vorige heen; de gegevens blijven staan (zelfde
ondertekeningssleutel, oplopend versienummer = het nummer van de run).

## Je gegevens meenemen

De app op je telefoon heeft een **eigen opslag**, los van de website in Chrome. Maak in de website
eerst een back-up (Team → Export) en importeer die in de Android-app.

## Wat de schil anders doet

- Back-up en wedstrijdkaart delen via het Android-deelblad (in plaats van een download).
- Lichte trilling bij elke geteld tik tijdens een wedstrijd.
- Terugknop: sluit eerst een open blad, daarna terug naar het wedstrijdscherm; tijdens een lopende
  wedstrijd gebeurt er niets (zodat je de app niet per ongeluk verlaat).
- Geen service worker en geen "zet op beginscherm"-hint (de app is al geïnstalleerd). Lettertypes
  zitten in de app, dus ook de eerste start werkt offline.

## Goed om te weten

- Dit is een **debug-APK** met een vaste, openbare sleutel (`debug.keystore`). Prima voor jezelf en
  teamgenoten; voor de Play Store is later een eigen, geheime sleutel nodig.
- Het app-id `com.creativeacer.matchdaytracker` (in `capacitor.config.json`) wordt definitief zodra je
  publiceert. Kies het vóór die tijd bewust.
- iOS zit er niet in (dat vraagt een Mac en een Apple-ontwikkelaarsaccount).

## Handmatig testen op het toestel (eerste keer)

- Start: geen witte rand of flits, kleuren kloppen, statusbalk heeft lichte iconen, niets valt onder de
  camera-uitsparing of de navigatiebalk.
- Lettertypes: koppen in Oswald, tekst in Work Sans, ook met vliegtuigmodus.
- Doelpunt tikken → lichte trilling en kleurflits.
- Back-up: Team → Export → deelblad opent, opslaan in Drive/Bestanden, daarna importeren werkt.
- Wedstrijdkaart delen als afbeelding; tekst delen.
- Terugknop: sluit een blad; tijdens de wedstrijd niets; op het startscherm → app naar achtergrond.
- App sluiten en heropenen midden in een wedstrijd: tijd en score kloppen nog.
