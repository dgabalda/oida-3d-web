# Llicència del model 3D

Cada peça és en un fitxer propi (`*.glb`) i té la seva llicència, que també consta a les metadades del GLB (`asset.copyright` i `extras.license`). Criteri conservador (2026-11-08): les peces de l'orella mitjana i interna de l'atles Z-Anatomy vénen del model de la Universitat de Dundee, que és CC BY-NC-SA.

## Peces CC BY-NC-SA 4.0 (ús no comercial)

**Universitat de Dundee, «Anatomy of the Inner Ear»** — https://www.dundee.ac.uk/tilt/medical-illustration/anatomy-inner-ear · https://learningspaces.dundee.ac.uk/tilt/project/anatomy-of-the-inner-ear
Crèdits: Patrick Spielmann (contingut), Penny Lockwood i David Stewart (revisió), Annie Campbell (il·lustració mèdica).
Deriva de **«3D Ear» de la Universitat McGill** (W. R. J. Funnell, S. J. Daniel i D. Nicolson), CC BY-NC-SA. Arribat a aquesta web a través de l'atles Z-Anatomy.
Llicència: **Creative Commons Reconeixement-NoComercial-CompartirIgual 4.0** — https://creativecommons.org/licenses/by-nc-sa/4.0/deed.ca. **No permet l'ús comercial.**

| Fitxer | Objecte de l'atles |
|---|---|
| `tympanum.glb` | Tympanic membrane.r |
| `malleus.glb`, `incus.glb`, `stapes.glb` | Malleus.r, Incus.r, Stapes.r |
| `cochlea.glb` | Cochlea.r |
| `vestibule.glb` | Vestibule.r (inclou els tres canals semicirculars) |
| `nerve.glb` | Cochlear nerve |

## Peces CC BY-SA 4.0

**Z-Anatomy** (https://github.com/Z-Anatomy) — **Creative Commons Reconeixement-CompartirIgual 4.0** — https://creativecommons.org/licenses/by-sa/4.0/deed.ca

| Fitxer | Objectes de l'atles |
|---|---|
| `pinna.glb` | Helix, Antihelix, Crura of antihelix, Tragus, Concha of auricle, Cavity of concha, Cymba conchae, Lobule of auricle, Apex of auricle, Anterior notch of auricle, Auricular tubercle, Eminentia conchae, Posterior auricular groove (.r). «Auricular region» (làmina plana) s'ha tret. |
| `auditoryTube.glb` | Auditory tube.r |
| `temporalBone.glb` | Temporal bone.r (context, apagat per defecte) |

## Obra pròpia (CC BY-SA 4.0)

| Fitxer | Què és |
|---|---|
| `canal.glb` | **Reconstruït per a aquesta web, no és de l'atles:** tub en S de ~24 mm i 7 mm de diàmetre entre el centre de *Cavity of concha.r* i el centre de *Tympanic membrane.r*. |
| `auditoryTubeBony.glb` | **Reconstruït per a aquesta web, no és de l'atles:** part òssia de la trompa auditiva, tub de ~15 mm que s'estreny de 3,5 mm a 1,6 mm de diàmetre (istme), de la part alta de la paret anterior de la caixa del timpà fins a l'inici d'*Auditory tube.r* (part cartilaginosa). Forma part de l'estructura «Trompa auditiva». |

La finestra oval també és una referència esquemàtica dibuixada al codi (no és de l'atles).

## Canvis fets per a aquesta web

Selecció de les peces de l'orella dreta, fusió de les parts del pavelló en una sola peça, retirada de la làmina «Auricular region», ombrejat suau al pavelló i al conducte, reconstrucció de la part òssia de la trompa auditiva, aplicació de la posició del món i exportació a GLB sense materials (script `scripts/model/exporta-orella.py`). Les peces derivades es distribueixen amb la mateixa llicència que el seu original.
